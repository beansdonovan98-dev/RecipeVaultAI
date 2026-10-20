import type { RemoteRecipe, RemoteRecipeInput } from '@/types/sync';
import { getImageFileMeta, isRemoteImageUri } from './syncHelpers';

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
const REQUEST_TIMEOUT_MS = 20000;

export function isRemoteConfigured(): boolean {
  return (
    /^https?:\/\//i.test(SUPABASE_URL) &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.startsWith('your-') &&
    !SUPABASE_ANON_KEY.startsWith('sb_secret_')
  );
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function rpc<T>(functionName: string, args: Record<string, unknown>): Promise<T> {
  if (!isRemoteConfigured()) {
    throw new Error('Shared rooms are not configured in this build.');
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'AbortError' || /network request failed|failed to fetch/i.test(error.message))
    ) {
      throw new Error('Could not reach the shared room. Check your connection and try again.');
    }
    throw error;
  }

  const text = await response.text();
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('The shared room server is not set up yet. Run the Supabase schema first.');
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('The shared room key was rejected. Check the Supabase anon key.');
    }
    throw new Error(`Shared room request failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return (text ? JSON.parse(text) : null) as T;
}

export async function createRoom(code: string): Promise<string> {
  const roomId = await rpc<string | null>('rvai_create_room', { p_code: code });
  if (!roomId) {
    throw new Error('Could not create or find that room.');
  }
  return roomId;
}

export async function listRecipes(code: string): Promise<RemoteRecipe[] | null> {
  const recipes = await rpc<RemoteRecipe[] | null>('rvai_list_recipes', { p_code: code });
  if (recipes === null || recipes === undefined) {
    return null;
  }
  return Array.isArray(recipes) ? recipes : [];
}

export async function upsertRecipe(code: string, recipe: RemoteRecipeInput): Promise<void> {
  await rpc<RemoteRecipe | null>('rvai_upsert_recipe', {
    p_code: code,
    p_recipe: recipe,
  });
}

export async function deleteRecipe(code: string, remoteId: string): Promise<void> {
  await rpc<null>('rvai_delete_recipe', { p_code: code, p_id: remoteId });
}

export async function uploadPhoto(
  roomId: string,
  remoteId: string,
  localUri: string
): Promise<string> {
  if (isRemoteImageUri(localUri)) {
    return localUri;
  }
  if (!isRemoteConfigured()) {
    throw new Error('Shared rooms are not configured in this build.');
  }

  const { extension, mimeType } = getImageFileMeta(localUri);
  const storagePath = `${roomId}/${remoteId}.${extension}`;
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: `${remoteId}.${extension}`,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetchWithTimeout(
    `${SUPABASE_URL}/storage/v1/object/recipe-photos/${storagePath}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'x-upsert': 'true',
      },
      body: formData,
    },
    45000
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Photo upload failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/recipe-photos/${storagePath}?v=${Date.now()}`;
}
