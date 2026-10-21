const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const INTERACTIONS_URL = `${GEMINI_BASE}/interactions`;

/**
 * Preferred Gemini model. The previous default (gemini-3.5-flash) is retired
 * for new API keys; Google points new keys at gemini-3.8-flash, and that is
 * what the Interactions API is built around. Override at build time with
 * EXPO_PUBLIC_GEMINI_MODEL if you want to try another model.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

const DEFAULT_TIMEOUT_MS = 60000;

/**
 * Thrown when a request outlives its timeout, as opposed to the caller
 * cancelling it. Kept separate so a slow model is not reported as "Aborted".
 */
export class GeminiTimeoutError extends Error {
  constructor(message = 'The assistant took too long to answer. Please try again.') {
    super(message);
    this.name = 'GeminiTimeoutError';
  }
}

/** An HTTP error from the Gemini API, keeping the status for retry decisions. */
export class GeminiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GeminiRequestError';
    this.status = status;
  }
}

export interface GeminiChatMessage {
  role: 'user' | 'model';
  content: string;
}

export function getGeminiApiKey(): string {
  return (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '').trim();
}

export function getGeminiModel(): string {
  // Deprecation notices quote models with a "models/" prefix, which is not
  // part of the ID the API expects.
  const configured = (process.env.EXPO_PUBLIC_GEMINI_MODEL ?? '')
    .trim()
    .replace(/^models\//, '');
  return configured || DEFAULT_GEMINI_MODEL;
}

// Tried in order when the configured model is unavailable for this key.
export const DEFAULT_GEMINI_FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
];

// The last model that answered. Kept so a retired default costs one request
// after launch instead of one on every message.
let resolvedModel: string | null = null;

export function getGeminiModels(): string[] {
  return [
    ...new Set([
      ...(resolvedModel ? [resolvedModel] : []),
      getGeminiModel(),
      ...DEFAULT_GEMINI_FALLBACK_MODELS,
    ]),
  ];
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey().length > 0;
}

function buildGenerateUrl(model: string): string {
  return `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent`;
}

export interface GeminiGenerateOptions {
  model?: string;
  systemInstruction?: string;
  responseMimeType?: 'application/json' | 'text/plain';
  temperature?: number;
  /** Reasoning effort for the Interactions API. Low keeps replies quick. */
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high';
  /** How long to wait before giving up on one request. */
  timeoutMs?: number;
  signal?: AbortSignal;
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiModelInfo {
  name?: string;
  supportedGenerationMethods?: string[];
}

interface InteractionStep {
  type?: string;
  content?: unknown;
}

interface InteractionPayload {
  output_text?: unknown;
  steps?: InteractionStep[];
}

/**
 * Asks the API which models this key can actually use, so a retired or
 * unavailable model ID is never a dead end.
 */
export async function listGeminiModels(): Promise<string[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return [];
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${GEMINI_BASE}/models?pageSize=100`, {
        headers: { 'x-goog-api-key': apiKey },
        signal: controller.signal,
      });
      if (!response.ok) {
        return [];
      }
      const payload = (await response.json().catch(() => null)) as
        | { models?: GeminiModelInfo[] }
        | null;
      return (payload?.models ?? [])
        .filter((model) => (model.supportedGenerationMethods ?? []).includes('generateContent'))
        .map((model) => (model.name ?? '').replace(/^models\//, ''))
        .filter((name) => name.length > 0);
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return [];
  }
}

/**
 * Orders the models a key exposes by how well they suit recipe generation:
 * Flash models first, newest version first, general-purpose before lite or
 * preview variants. Pure helper, exported for testing.
 */
export function rankGeminiModels(models: string[]): string[] {
  const usable = models.filter(
    (name) => /flash/i.test(name) && !/image|audio|tts|live|embedding|vision|veo/i.test(name),
  );

  const score = (name: string) => {
    const version = Number((name.match(/gemini-(\d+(?:\.\d+)?)/) ?? [])[1] ?? 0);
    const litePenalty = /lite/i.test(name) ? 0.4 : 0;
    const previewPenalty = /preview|exp|experimental/i.test(name) ? 0.2 : 0;
    return version - litePenalty - previewPenalty;
  };

  return [...usable].sort((a, b) => score(b) - score(a));
}

/**
 * Maps chat history onto Interactions API steps. Stateless mode resends the
 * whole conversation, so a follow-up like "make it without curry" still sees
 * the recipe the assistant just wrote.
 */
export function buildInteractionInput(messages: GeminiChatMessage[]) {
  return messages.map((message) => ({
    type: message.role === 'user' ? 'user_input' : 'model_output',
    content: [{ type: 'text', text: message.content }],
  }));
}

function blockText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (!Array.isArray(content)) {
    return '';
  }
  return content
    .map((part) => {
      if (!part || typeof part !== 'object') {
        return '';
      }
      const text = (part as { text?: unknown }).text;
      return typeof text === 'string' ? text : '';
    })
    .join('');
}

/**
 * Pulls the answer out of an interaction. The API returns `steps`, with the
 * final answer in the last `model_output` step; `output_text` is the SDK's
 * convenience field, used here when the REST response includes it.
 */
export function extractInteractionText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return '';
  }
  const interaction = payload as InteractionPayload;
  if (typeof interaction.output_text === 'string' && interaction.output_text.trim()) {
    return interaction.output_text;
  }
  const steps = Array.isArray(interaction.steps) ? interaction.steps : [];
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    const step = steps[index];
    if (!step || step.type !== 'model_output') {
      continue;
    }
    const text = blockText(step.content);
    if (text.trim()) {
      return text;
    }
  }
  return '';
}

function readErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return '';
  }
  const error = (payload as { error?: unknown }).error;
  if (!error || typeof error !== 'object') {
    return '';
  }
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' ? message : '';
}

async function postJson(
  url: string,
  apiKey: string,
  body: unknown,
  options: GeminiGenerateOptions,
): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new GeminiRequestError(
        readErrorMessage(payload) || `Gemini request failed with status ${response.status}`,
        response.status,
      );
    }
    return payload;
  } catch (error) {
    if (timedOut && !options.signal?.aborted) {
      throw new GeminiTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}

/**
 * The current, recommended transport. Stateless (`store: false`) because the
 * app already keeps the conversation on the phone.
 */
async function generateWithInteractions(
  model: string,
  messages: GeminiChatMessage[],
  apiKey: string,
  options: GeminiGenerateOptions,
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    store: false,
    input: buildInteractionInput(messages),
    generation_config: {
      thinking_level: options.thinkingLevel ?? 'low',
    },
  };
  if (options.systemInstruction) {
    body.system_instruction = options.systemInstruction;
  }
  if (options.responseMimeType) {
    body.response_format = {
      type: 'text',
      mime_type:
        options.responseMimeType === 'application/json' ? 'application/json' : 'text/plain',
    };
  }

  const payload = await postJson(INTERACTIONS_URL, apiKey, body, options);
  const text = extractInteractionText(payload);
  if (!text.trim()) {
    throw new Error('Gemini returned an empty response.');
  }
  return text;
}

/**
 * The legacy transport. Google still supports it, so it stays as a safety net
 * in case the Interactions endpoint rejects a request.
 */
async function generateWithContent(
  model: string,
  messages: GeminiChatMessage[],
  apiKey: string,
  options: GeminiGenerateOptions,
): Promise<string> {
  const body: Record<string, unknown> = {
    contents: messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    })),
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
    },
  };
  if (options.systemInstruction) {
    body.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  const payload = (await postJson(buildGenerateUrl(model), apiKey, body, options)) as {
    candidates?: GeminiCandidate[];
  } | null;
  const text =
    payload?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
  if (!text.trim()) {
    throw new Error('Gemini returned an empty response.');
  }
  return text;
}

export async function geminiGenerateText(
  messages: GeminiChatMessage[],
  options: GeminiGenerateOptions = {},
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }
  if (messages.length === 0) {
    throw new Error('Gemini requires at least one message.');
  }
  const model = options.model ?? getGeminiModel();

  try {
    return await generateWithInteractions(model, messages, apiKey, options);
  } catch (error) {
    // A caller cancel or a slow model is not a reason to ask again elsewhere.
    if (options.signal?.aborted || error instanceof GeminiTimeoutError) {
      throw error;
    }
    return generateWithContent(model, messages, apiKey, options);
  }
}

function isModelError(error: unknown): boolean {
  if (error instanceof GeminiRequestError && (error.status === 404 || error.status === 403)) {
    return true;
  }
  const message = error instanceof Error ? error.message : '';
  return /not found|not supported|does not exist|unsupported|invalid model|not available|no longer available|new users|deprecated|retired|migrate|update to|permission/i.test(
    message,
  );
}

function shouldRetry(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) {
    return false;
  }
  // A slow model should not be retried on another model: that just makes the
  // user wait longer for the same answer.
  if (error instanceof GeminiTimeoutError) {
    return false;
  }
  return !(error instanceof Error && error.name === 'AbortError');
}

/**
 * Tries the configured model, then the known-good fallbacks. If those all fail
 * because the key does not expose them, it asks the API for the model list and
 * retries with the best Flash models it finds. Aborts are never retried.
 */
export async function geminiGenerateTextWithFallback(
  messages: GeminiChatMessage[],
  options: GeminiGenerateOptions = {},
): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key is not configured.');
  }

  const tried: string[] = [];
  let lastError: unknown = null;

  for (const model of getGeminiModels()) {
    tried.push(model);
    try {
      const text = await geminiGenerateText(messages, { ...options, model });
      resolvedModel = model;
      return text;
    } catch (error) {
      if (!shouldRetry(error, options.signal)) {
        throw error;
      }
      lastError = error;
    }
  }

  // Last resort: discover what this key can actually use. A retired model
  // ("no longer available to new users") lands here instead of failing.
  if (isModelError(lastError)) {
    const discovered = rankGeminiModels(await listGeminiModels()).filter(
      (model) => !tried.includes(model),
    );
    for (const model of discovered.slice(0, 3)) {
      tried.push(model);
      try {
        const text = await geminiGenerateText(messages, { ...options, model });
        resolvedModel = model;
        return text;
      } catch (error) {
        if (!shouldRetry(error, options.signal)) {
          throw error;
        }
        lastError = error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini request failed.');
}
