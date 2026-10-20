import type { RecipeSyncRecord, RemoteRecipeInput } from '../types/sync';

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const MIN_ROOM_CODE_LENGTH = 6;
export const MAX_ROOM_CODE_LENGTH = 20;

export function normalizeRoomCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isRoomCodeValid(value: string): boolean {
  const normalized = normalizeRoomCode(value);
  return (
    normalized.length >= MIN_ROOM_CODE_LENGTH &&
    normalized.length <= MAX_ROOM_CODE_LENGTH
  );
}

export function generateRoomCode(
  length = 10,
  random: () => number = Math.random
): string {
  let code = '';
  for (let index = 0; index < length; index += 1) {
    const next = Math.floor(random() * ROOM_CODE_ALPHABET.length);
    code += ROOM_CODE_ALPHABET[Math.min(next, ROOM_CODE_ALPHABET.length - 1)];
  }
  return code;
}

export function createRemoteId(random: () => number = Math.random): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(random() * 16);
    const digit = character === 'x' ? value : (value & 0x3) | 0x8;
    return digit.toString(16);
  });
}

export function isRemoteImageUri(uri: string | null): boolean {
  return typeof uri === 'string' && /^https?:\/\//i.test(uri);
}

export function getImageFileMeta(uri: string): { extension: string; mimeType: string } {
  const cleanUri = uri.split('?')[0].split('#')[0];
  const match = cleanUri.match(/\.([a-z0-9]+)$/i);
  const extension = (match?.[1] ?? 'jpg').toLowerCase();

  switch (extension) {
    case 'png':
      return { extension: 'png', mimeType: 'image/png' };
    case 'webp':
      return { extension: 'webp', mimeType: 'image/webp' };
    case 'gif':
      return { extension: 'gif', mimeType: 'image/gif' };
    case 'heic':
      return { extension: 'heic', mimeType: 'image/heic' };
    case 'heif':
      return { extension: 'heif', mimeType: 'image/heif' };
    case 'jpeg':
    case 'jpg':
      return { extension: 'jpg', mimeType: 'image/jpeg' };
    default:
      return { extension: 'jpg', mimeType: 'image/jpeg' };
  }
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeJsonArray(raw: string): unknown[] {
  const parsed = safeJsonParse<unknown>(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function safeNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function toRemoteRecipeInput(
  record: RecipeSyncRecord,
  remoteId: string,
  imageUrl: string | null
): RemoteRecipeInput {
  return {
    id: remoteId,
    title: record.title.trim() || 'Untitled',
    description: record.description ?? '',
    category: record.category || 'Dinner',
    prepTime: safeNumber(record.prepTime, 0),
    cookTime: safeNumber(record.cookTime, 0),
    servings: safeNumber(record.servings, 1),
    ingredients: safeJsonArray(record.ingredients),
    instructions: safeJsonArray(record.instructions),
    imageUrl,
    isFavorite: record.isFavorite,
  };
}
