import * as SQLite from 'expo-sqlite';
import { createDatabaseInitializer } from './databaseInitializer';

const DATABASE_NAME = 'recipevault.db';

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    prep_time INTEGER DEFAULT 0,
    cook_time INTEGER DEFAULT 0,
    servings INTEGER DEFAULT 1,
    ingredients TEXT NOT NULL DEFAULT '[]',
    instructions TEXT NOT NULL DEFAULT '[]',
    image_uri TEXT,
    is_favorite INTEGER DEFAULT 0,
    author TEXT NOT NULL DEFAULT '',
    dirty INTEGER NOT NULL DEFAULT 0,
    deleted INTEGER NOT NULL DEFAULT 0,
    local_revision INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`;

async function migrateDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(recipes)');
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('remote_id')) {
    await database.execAsync('ALTER TABLE recipes ADD COLUMN remote_id TEXT');
  }
  if (!columnNames.has('dirty')) {
    await database.execAsync('ALTER TABLE recipes ADD COLUMN dirty INTEGER NOT NULL DEFAULT 0');
  }
  if (!columnNames.has('deleted')) {
    await database.execAsync('ALTER TABLE recipes ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0');
  }
  if (!columnNames.has('local_revision')) {
    await database.execAsync(
      'ALTER TABLE recipes ADD COLUMN local_revision INTEGER NOT NULL DEFAULT 1'
    );
  }
  if (!columnNames.has('author')) {
    await database.execAsync("ALTER TABLE recipes ADD COLUMN author TEXT NOT NULL DEFAULT ''");
  }
  if (!columnNames.has('tags')) {
    await database.execAsync("ALTER TABLE recipes ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'");
  }

  await database.execAsync(
    'CREATE UNIQUE INDEX IF NOT EXISTS recipes_remote_id_idx ON recipes(remote_id) WHERE remote_id IS NOT NULL'
  );
  await database.execAsync(
    'CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)'
  );
}

async function openAndInitializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    console.log('[STARTUP] database open started');
    const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    console.log('[STARTUP] database open completed');

    await database.execAsync(SCHEMA);
    await migrateDatabase(database);
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
