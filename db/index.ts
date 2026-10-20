import { getDatabase } from './schema';
import { getMember, getRoomConfig } from './settings';
import { Recipe, RecipeInput, Ingredient, Instruction } from '@/types/recipe';
import type { RecipeSyncRecord, RemoteRecipe } from '@/types/sync';
import type { AuthorId } from '@/constants/authors';
import { createRemoteId } from '@/services/syncHelpers';

export * from './settings';

interface RecipeRow {
  id: number;
  remote_id: string | null;
  title: string;
  description: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: string;
  instructions: string;
  image_uri: string | null;
  is_favorite: number;
  author: string;
  dirty: number;
  deleted: number;
  local_revision: number;
  created_at: string;
  updated_at: string;
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapRowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    remoteId: row.remote_id,
    title: row.title,
    description: row.description,
    category: row.category,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    ingredients: safeJsonParse<Ingredient[]>(row.ingredients, []),
    instructions: safeJsonParse<Instruction[]>(row.instructions, []),
    imageUri: row.image_uri,
    isFavorite: row.is_favorite === 1,
    author: row.author ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToSyncRecord(row: RecipeRow): RecipeSyncRecord {
  return {
    id: row.id,
    remoteId: row.remote_id,
    title: row.title,
    description: row.description,
    category: row.category,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    ingredients: row.ingredients,
    instructions: row.instructions,
    imageUri: row.image_uri,
    isFavorite: row.is_favorite === 1,
    author: row.author ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dirty: row.dirty === 1,
    deleted: row.deleted === 1,
    revision: row.local_revision,
  };
}

let hasLoggedFirstRecipeQuery = false;

function beginFirstRecipeQuery(): boolean {
  if (hasLoggedFirstRecipeQuery) {
    return false;
  }
  hasLoggedFirstRecipeQuery = true;
  console.log('[STARTUP] first recipe query started');
  return true;
}

function finishFirstRecipeQuery(isFirst: boolean, error?: unknown): void {
  if (!isFirst) {
    return;
  }
  if (error === undefined) {
    console.log('[STARTUP] first recipe query completed');
  } else {
    console.error('[STARTUP] first recipe query failed', error);
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDatabase();
  const isFirst = beginFirstRecipeQuery();
  try {
    const rows = await db.getAllAsync<RecipeRow>(
      'SELECT * FROM recipes WHERE deleted = 0 ORDER BY created_at DESC'
    );
    finishFirstRecipeQuery(isFirst);
    return rows.map(mapRowToRecipe);
  } catch (error) {
    finishFirstRecipeQuery(isFirst, error);
    throw error;
  }
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE id = ? AND deleted = 0',
    [id]
  );
  return row ? mapRowToRecipe(row) : null;
}

export async function getFavoriteRecipes(): Promise<Recipe[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE is_favorite = 1 AND deleted = 0 ORDER BY created_at DESC'
  );
  return rows.map(mapRowToRecipe);
}

export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE category = ? AND deleted = 0 ORDER BY created_at DESC',
    [category]
  );
  return rows.map(mapRowToRecipe);
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE (title LIKE ? OR description LIKE ? OR category LIKE ?) AND deleted = 0 ORDER BY created_at DESC',
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
  return rows.map(mapRowToRecipe);
}

export async function addRecipe(input: RecipeInput, authorOverride?: AuthorId): Promise<number> {
  const db = await getDatabase();
  const author = authorOverride ?? (await getMember()) ?? '';
  const ingredients = input.ingredients.map((ing, i) => ({
    ...ing,
    id: `ing-${Date.now()}-${i}`,
  }));
  const instructions = input.instructions.map((inst, i) => ({
    ...inst,
    id: `inst-${Date.now()}-${i}`,
    step: i + 1,
  }));

  const result = await db.runAsync(
    `INSERT INTO recipes (remote_id, title, description, category, prep_time, cook_time, servings, ingredients, instructions, image_uri, author, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      createRemoteId(),
      input.title,
      input.description,
      input.category,
      input.prepTime,
      input.cookTime,
      input.servings,
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      input.imageUri,
      author,
    ]
  );
  return result.lastInsertRowId as number;
}

export async function updateRecipe(id: number, input: RecipeInput): Promise<void> {
  const db = await getDatabase();
  const member = await getMember();
  const ingredients = input.ingredients.map((ing, i) => ({
    ...ing,
    id: `ing-${Date.now()}-${i}`,
  }));
  const instructions = input.instructions.map((inst, i) => ({
    ...inst,
    id: `inst-${Date.now()}-${i}`,
    step: i + 1,
  }));

  await db.runAsync(
    `UPDATE recipes SET title = ?, description = ?, category = ?, prep_time = ?, cook_time = ?, servings = ?, ingredients = ?, instructions = ?, image_uri = ?, author = CASE WHEN author = '' THEN ? ELSE author END, dirty = 1, local_revision = local_revision + 1, updated_at = datetime('now') WHERE id = ?`,
    [
      input.title,
      input.description,
      input.category,
      input.prepTime,
      input.cookTime,
      input.servings,
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      input.imageUri,
      member ?? '',
      id,
    ]
  );
}

export async function deleteRecipe(id: number): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ remote_id: string | null }>(
    'SELECT remote_id FROM recipes WHERE id = ?',
    [id]
  );
  const roomConfig = await getRoomConfig();

  if (!row || !roomConfig || !row.remote_id) {
    await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
    return;
  }

  await db.runAsync(
    "UPDATE recipes SET deleted = 1, dirty = 1, local_revision = local_revision + 1, updated_at = datetime('now') WHERE id = ?",
    [id]
  );
}

export async function toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE recipes SET is_favorite = ?, dirty = 1, local_revision = local_revision + 1, updated_at = datetime('now') WHERE id = ?",
    [isFavorite ? 1 : 0, id]
  );
}

export async function getCategories(): Promise<{ category: string; count: number }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ category: string; count: number }>(
    'SELECT category, COUNT(*) as count FROM recipes WHERE deleted = 0 GROUP BY category ORDER BY category'
  );
  return rows;
}

export async function getRecipeCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM recipes WHERE deleted = 0'
  );
  return row?.count ?? 0;
}

export async function getSyncRecords(onlyDirty = false): Promise<RecipeSyncRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecipeRow>(
    onlyDirty ? 'SELECT * FROM recipes WHERE dirty = 1' : 'SELECT * FROM recipes'
  );
  return rows.map(mapRowToSyncRecord);
}

export async function assignRemoteId(id: number, remoteId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE recipes SET remote_id = ? WHERE id = ?', [remoteId, id]);
}

export async function setRecipeImage(
  id: number,
  imageUri: string | null,
  expectedRevision: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE recipes SET image_uri = ? WHERE id = ? AND local_revision = ?', [
    imageUri,
    id,
    expectedRevision,
  ]);
}

export async function markRecipeSynced(id: number, revision: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE recipes SET dirty = 0 WHERE id = ? AND local_revision = ?', [
    id,
    revision,
  ]);
}

export async function hardDeleteRecipe(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}

function toSqliteTimestamp(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString().slice(0, 19).replace('T', ' ');
}

export async function upsertRemoteRecipe(remote: RemoteRecipe): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number; dirty: number }>(
    'SELECT id, dirty FROM recipes WHERE remote_id = ?',
    [remote.id]
  );

  if (existing?.dirty === 1) {
    return;
  }

  const ingredients = JSON.stringify(Array.isArray(remote.ingredients) ? remote.ingredients : []);
  const instructions = JSON.stringify(Array.isArray(remote.instructions) ? remote.instructions : []);
  const title = remote.title?.trim() || 'Untitled';
  const category = remote.category || 'Dinner';
  const fallbackTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const createdAt = toSqliteTimestamp(remote.created_at) ?? fallbackTimestamp;
  const updatedAt = toSqliteTimestamp(remote.updated_at) ?? createdAt;

  if (existing) {
    await db.runAsync(
      `UPDATE recipes SET title = ?, description = ?, category = ?, prep_time = ?, cook_time = ?, servings = ?, ingredients = ?, instructions = ?, image_uri = ?, is_favorite = ?, author = COALESCE(NULLIF(?, ''), author), dirty = 0, deleted = 0, created_at = ?, updated_at = ? WHERE id = ? AND dirty = 0`,
      [
        title,
        remote.description ?? '',
        category,
        remote.prep_time ?? 0,
        remote.cook_time ?? 0,
        remote.servings ?? 1,
        ingredients,
        instructions,
        remote.image_url,
        remote.is_favorite ? 1 : 0,
        remote.author ?? '',
        createdAt,
        updatedAt,
        existing.id,
      ]
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO recipes (remote_id, title, description, category, prep_time, cook_time, servings, ingredients, instructions, image_uri, is_favorite, author, dirty, deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
    [
      remote.id,
      title,
      remote.description ?? '',
      category,
      remote.prep_time ?? 0,
      remote.cook_time ?? 0,
      remote.servings ?? 1,
      ingredients,
      instructions,
      remote.image_url,
      remote.is_favorite ? 1 : 0,
      remote.author ?? '',
      createdAt,
      updatedAt,
    ]
  );
}

export async function deleteSyncedRecipesMissingFromRemote(remoteIds: string[]): Promise<void> {
  const db = await getDatabase();

  if (remoteIds.length === 0) {
    await db.runAsync('DELETE FROM recipes WHERE remote_id IS NOT NULL AND dirty = 0');
    return;
  }

  const placeholders = remoteIds.map(() => '?').join(', ');
  await db.runAsync(
    `DELETE FROM recipes WHERE remote_id IS NOT NULL AND dirty = 0 AND remote_id NOT IN (${placeholders})`,
    remoteIds
  );
}
