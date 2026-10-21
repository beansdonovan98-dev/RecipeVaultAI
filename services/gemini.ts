const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Free-tier Gemini model. The Gemini 3.x Flash line is the part of the free
 * tier that is available to brand new Google AI Studio accounts, and it is the
 * strongest option for strict JSON output. Override at build time with
 * EXPO_PUBLIC_GEMINI_MODEL if you want to try another model.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

const DEFAULT_TIMEOUT_MS = 25000;

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
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
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
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}

/**
 * Tries the configured model first, then the known-good free-tier fallbacks.
 * Aborts and missing-key errors are not retried.
 */
export async function geminiGenerateTextWithFallback(
  messages: GeminiChatMessage[],
  options: GeminiGenerateOptions = {},
): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key is not configured.');
  }

  let lastError: unknown = null;
  for (const model of getGeminiModels()) {
    try {
      return await geminiGenerateText(messages, { ...options, model });
    } catch (error) {
      if (options.signal?.aborted) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini request failed.');
}
