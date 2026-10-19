import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (db) return db;
  try {
    db = await SQLite.openDatabaseAsync('recipevault.db');
    await db.execAsync(`
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
    `);
    return db;
  } catch (err) {
    console.error('[DB] Failed to open or initialize database:', err);
    db = null;
    return null;
  }
}

export async function initializeDatabase(): Promise<void> {
  await getDatabase();
}
