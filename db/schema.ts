import * as SQLite from 'expo-sqlite';
import { createDatabaseInitializer } from './databaseInitializer';

const DATABASE_NAME = 'recipevault.db';

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL,
    prep_time INTEGER DEFAULT 0,
    cook_time INTEGER DEFAULT 0,
    servings INTEGER DEFAULT 1,
    ingredients TEXT NOT NULL DEFAULT '[]',
    instructions TEXT NOT NULL DEFAULT '[]',
    image_uri TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`;

async function openAndInitializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    console.log('[STARTUP] database open started');
    const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    console.log('[STARTUP] database open completed');

    await database.execAsync(SCHEMA);
    console.log('[STARTUP] schema initialization completed');

    return database;
  } catch (error) {
    console.error('[STARTUP] database initialization failed', error);
    throw error;
  }
}

const databaseInitializer = createDatabaseInitializer(openAndInitializeDatabase);

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return databaseInitializer.get();
}

export async function initializeDatabase(): Promise<void> {
  await getDatabase();
}
