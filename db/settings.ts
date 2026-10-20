import { getDatabase } from './schema';
import type { RoomConfig } from '@/types/sync';
import { isAuthorId, type AuthorId } from '@/constants/authors';

const ROOM_CODE_KEY = 'room_code';
const ROOM_ID_KEY = 'room_id';
const MEMBER_KEY = 'room_member';

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}

export async function deleteSetting(key: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', [key]);
}

export async function getMember(): Promise<AuthorId | null> {
  const value = await getSetting(MEMBER_KEY);
  return isAuthorId(value) ? value : null;
}

export async function setMember(member: AuthorId): Promise<void> {
  await setSetting(MEMBER_KEY, member);
}

export async function getRoomConfig(): Promise<RoomConfig | null> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM app_settings WHERE key IN (?, ?)',
    [ROOM_CODE_KEY, ROOM_ID_KEY]
  );
  const code = rows.find((row) => row.key === ROOM_CODE_KEY)?.value;
  const roomId = rows.find((row) => row.key === ROOM_ID_KEY)?.value;
  if (!code || !roomId) {
    return null;
  }
  return { code, roomId };
}

function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export async function saveRoomConfig(config: RoomConfig): Promise<void> {
  const db = await getDatabase();
  const code = normalizeRoomCode(config.code);
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [ROOM_CODE_KEY, code]
    );
    await txn.runAsync(
      'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [ROOM_ID_KEY, config.roomId]
    );
  });
}

export async function clearRoomConfig(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM app_settings WHERE key IN (?, ?)', [ROOM_CODE_KEY, ROOM_ID_KEY]);
}

export async function activateRoom(config: RoomConfig): Promise<void> {
  const db = await getDatabase();
  const current = await getRoomConfig();
  const nextCode = normalizeRoomCode(config.code);

  await db.withExclusiveTransactionAsync(async (txn) => {
    if (current && (current.code !== nextCode || current.roomId !== config.roomId)) {
      await txn.runAsync('DELETE FROM recipes WHERE remote_id IS NOT NULL AND dirty = 0');
      await txn.runAsync(
        'UPDATE recipes SET remote_id = NULL, local_revision = local_revision + 1 WHERE dirty = 1'
      );
    }

    await txn.runAsync(
      'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [ROOM_CODE_KEY, nextCode]
    );
    await txn.runAsync(
      'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [ROOM_ID_KEY, config.roomId]
    );
    await txn.runAsync(
      'UPDATE recipes SET dirty = 1, local_revision = local_revision + 1 WHERE remote_id IS NULL AND deleted = 0'
    );
  });
}
