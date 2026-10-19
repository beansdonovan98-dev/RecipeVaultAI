import { getDatabase } from './schema';
import { Recipe, RecipeInput, Ingredient, Instruction } from '@/types/recipe';

interface RecipeRow {
  id: number;
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function throwDbUnavailable(): never {
  throw new Error('Database unavailable');
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  const rows = await db.getAllAsync<RecipeRow>('SELECT * FROM recipes ORDER BY created_at DESC');
  return rows.map(mapRowToRecipe);
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  const row = await db.getFirstAsync<RecipeRow>('SELECT * FROM recipes WHERE id = ?', [id]);
  return row ? mapRowToRecipe(row) : null;
}

export async function getFavoriteRecipes(): Promise<Recipe[]> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  const rows = await db.getAllAsync<RecipeRow>('SELECT * FROM recipes WHERE is_favorite = 1 ORDER BY created_at DESC');
  return rows.map(mapRowToRecipe);
}

export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  const rows = await db.getAllAsync<RecipeRow>('SELECT * FROM recipes WHERE category = ? ORDER BY created_at DESC', [category]);
  return rows.map(mapRowToRecipe);
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  const rows = await db.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE title LIKE ? OR description LIKE ? OR category LIKE ? ORDER BY created_at DESC',
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
  return rows.map(mapRowToRecipe);
}

export async function addRecipe(input: RecipeInput): Promise<number> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
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
    `INSERT INTO recipes (title, description, category, prep_time, cook_time, servings, ingredients, instructions, image_uri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ]
  );
  return result.lastInsertRowId as number;
}

export async function updateRecipe(id: number, input: RecipeInput): Promise<void> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
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
    `UPDATE recipes SET title = ?, description = ?, category = ?, prep_time = ?, cook_time = ?, servings = ?, ingredients = ?, instructions = ?, image_uri = ?, updated_at = datetime('now') WHERE id = ?`,
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
      id,
    ]
  );
}

export async function deleteRecipe(id: number): Promise<void> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}

export async function toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  await db.runAsync('UPDATE recipes SET is_favorite = ?, updated_at = datetime(\'now\') WHERE id = ?', [isFavorite ? 1 : 0, id]);
}

export async function getCategories(): Promise<{ category: string; count: number }[]> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  const rows = await db.getAllAsync<{ category: string; count: number }>(
    'SELECT category, COUNT(*) as count FROM recipes GROUP BY category ORDER BY category'
  );
  return rows;
}

export async function getRecipeCount(): Promise<number> {
  const db = await getDatabase();
  if (!db) throwDbUnavailable();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM recipes');
  return row?.count ?? 0;
}
