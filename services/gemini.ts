const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Preferred Gemini model. The Gemini Flash line is the part of the free tier
 * that is available to brand new Google AI Studio accounts, and it is the
 * strongest option for strict JSON output. Override at build time with
 * EXPO_PUBLIC_GEMINI_MODEL if you want to try another model.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

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

export interface GeminiChatMessage {
  role: 'user' | 'model';
  content: string;
}

export function getGeminiApiKey(): string {
  return (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '').trim();
}

export function getGeminiModel(): string {
  const configured = (process.env.EXPO_PUBLIC_GEMINI_MODEL ?? '').trim();
  return configured || DEFAULT_GEMINI_MODEL;
}

// Known-good free-tier Flash models, tried in order if the configured model is
// unavailable for this account.
export const DEFAULT_GEMINI_FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash'];

export function getGeminiModels(): string[] {
  return [...new Set([getGeminiModel(), ...DEFAULT_GEMINI_FALLBACK_MODELS])];
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey().length > 0;
}

function buildUrl(model: string, apiKey: string): string {
  return `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

export interface GeminiGenerateOptions {
  model?: string;
  systemInstruction?: string;
  responseMimeType?: 'application/json' | 'text/plain';
  temperature?: number;
  /** How long to wait before giving up on one request. */
  timeoutMs?: number;
  signal?: AbortSignal;
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiErrorPayload {
  error?: { message?: string };
}

interface GeminiModelInfo {
  name?: string;
  supportedGenerationMethods?: string[];
}

/**
 * Asks the API which models this key can actually use. AI Studio no longer
 * advertises a single "current" model per key, so this is the reliable way to
 * find one that works instead of guessing model IDs.
 */
export async function listGeminiModels(): Promise<string[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return [];
  }
  try {
    const response = await fetch(
      `${GEMINI_BASE}/models?pageSize=100&key=${encodeURIComponent(apiKey)}`,
    );
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

function isModelError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : '';
  return /not found|not supported|does not exist|unsupported|invalid model|not available|permission/i.test(
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

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort);

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

  try {
    const response = await fetch(buildUrl(options.model ?? getGeminiModel(), apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as
      | { candidates?: GeminiCandidate[] }
      | GeminiErrorPayload
      | null;

    if (!response.ok) {
      const detail = (payload as GeminiErrorPayload | null)?.error?.message;
      throw new Error(detail || `Gemini request failed with status ${response.status}`);
    }

    const candidates = (payload as { candidates?: GeminiCandidate[] } | null)?.candidates;
    const text = candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    if (!text.trim()) {
      throw new Error('Gemini returned an empty response.');
    }
    return text;
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
 * Tries the configured model, then the known-good free-tier fallbacks. If those
 * all fail because the key does not expose them, it asks the API for the model
 * list and retries with the best Flash models it finds. Aborts are never retried.
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
      return await geminiGenerateText(messages, { ...options, model });
    } catch (error) {
      if (!shouldRetry(error, options.signal)) {
        throw error;
      }
      lastError = error;
    }
  }

  // Last resort: discover what this key can actually use.
  if (isModelError(lastError)) {
    const discovered = rankGeminiModels(await listGeminiModels()).filter(
      (model) => !tried.includes(model),
    );
    for (const model of discovered.slice(0, 3)) {
      try {
        return await geminiGenerateText(messages, { ...options, model });
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
