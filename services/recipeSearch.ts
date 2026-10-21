import type { RecipeInput } from '../types/recipe';

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';
const DEFAULT_TIMEOUT_MS = 8000;

export interface RecipeSearchResult {
  id: string;
  title: string;
  category: string;
  area: string | null;
  thumbnail: string | null;
}

interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strCategory?: string | null;
  strArea?: string | null;
  strInstructions?: string | null;
  strMealThumb?: string | null;
  strTags?: string | null;
  [key: string]: string | null | undefined;
}

const CATEGORY_MAP: Record<string, RecipeInput['category']> = {
  Beef: 'Dinner',
  Breakfast: 'Breakfast',
  Chicken: 'Dinner',
  Dessert: 'Dessert',
  Goat: 'Dinner',
  Lamb: 'Dinner',
  Miscellaneous: 'Quick & Easy',
  Pasta: 'Dinner',
  Pork: 'Dinner',
  Seafood: 'Healthy',
  Side: 'Appetizer',
  Starter: 'Appetizer',
  Vegan: 'Vegan',
  Vegetarian: 'Vegetarian',
};

const TIME_HINTS: Record<string, { prep: number; cook: number }> = {
  Breakfast: { prep: 10, cook: 15 },
  Dessert: { prep: 20, cook: 35 },
  Baking: { prep: 20, cook: 35 },
  Salad: { prep: 15, cook: 0 },
  Side: { prep: 10, cook: 20 },
  Soup: { prep: 15, cook: 40 },
  Drink: { prep: 5, cook: 0 },
  Starter: { prep: 10, cook: 15 },
};

export function mapCategory(raw: string | null | undefined): RecipeInput['category'] {
  const key = (raw ?? '').trim();
  return CATEGORY_MAP[key] ?? 'Dinner';
}

export function parseMeasure(measure: string | null | undefined): { amount: string; unit: string } {
  const value = (measure ?? '').trim();
  if (!value) {
    return { amount: '', unit: '' };
  }
  const match = value.match(/^([\d/.,]+(?:\s+\d+\/\d+)?)\s*(.*)$/);
  if (match) {
    return { amount: match[1].trim(), unit: match[2].trim() };
  }
  return { amount: value, unit: '' };
}

export function splitInstructions(raw: string | null | undefined): string[] {
  const normalized = (raw ?? '').replace(/\r\n?/g, '\n').trim();
  if (!normalized) {
    return [];
  }

  let parts = normalized.split('\n').map((line) => line.trim()).filter(Boolean);

  if (parts.length <= 1) {
    const sentences = normalized.match(/[^.!?]+[.!?]*/g) ?? [normalized];
    parts = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const chunk = sentences.slice(i, i + 2).join(' ').trim();
      if (chunk) {
        parts.push(chunk);
      }
    }
  }

  const cleaned = parts
    .map((part) => part.replace(/^\s*(?:step\s*)?\d+\s*[.)-]?\s*/i, '').trim())
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned : [normalized];
}

function estimateTimes(category: string | null | undefined): { prep: number; cook: number } {
  const hint = TIME_HINTS[(category ?? '').trim()];
  if (hint) {
    return hint;
  }
  return { prep: 15, cook: 30 };
}

export function mealToRecipe(meal: MealDbMeal): RecipeInput {
  const ingredients: RecipeInput['ingredients'] = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = (meal[`strIngredient${i}`] ?? '').trim();
    if (!name) {
      continue;
    }
    const { amount, unit } = parseMeasure(meal[`strMeasure${i}`]);
    ingredients.push({ name, amount, unit });
  }

  const instructions = splitInstructions(meal.strInstructions).map((text) => ({ text }));
  const category = mapCategory(meal.strCategory);
  const { prep, cook } = estimateTimes(meal.strCategory);
  const area = (meal.strArea ?? '').trim();

  const description =
    `A ${meal.strCategory ? meal.strCategory.toLowerCase() : 'homemade'} recipe` +
    `${area ? ` from ${area}` : ''} with ingredients and step-by-step instructions.`;

  return {
    title: meal.strMeal,
    description,
    category,
    tags: [category],
    prepTime: prep,
    cookTime: cook,
    servings: 4,
    ingredients,
    instructions,
    imageUri: meal.strMealThumb ?? null,
  };
}

function toSearchResult(meal: MealDbMeal): RecipeSearchResult {
  return {
    id: meal.idMeal,
    title: meal.strMeal,
    category: (meal.strCategory ?? '').trim(),
    area: (meal.strArea ?? '').trim() || null,
    thumbnail: meal.strMealThumb ?? null,
  };
}

async function fetchJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(`${MEALDB_BASE}${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Recipe search failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

function readMeals(payload: unknown): MealDbMeal[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const meals = (payload as { meals?: unknown }).meals;
  return Array.isArray(meals) ? (meals as MealDbMeal[]) : [];
}

export async function searchRecipes(
  query: string,
  signal?: AbortSignal
): Promise<RecipeSearchResult[]> {
  const trimmed = query.trim();
  const payload = await fetchJson(`/search.php?s=${encodeURIComponent(trimmed)}`, signal);
  return readMeals(payload).map(toSearchResult);
}

export async function getRecipeById(
  id: string,
  signal?: AbortSignal
): Promise<RecipeInput | null> {
  const payload = await fetchJson(`/lookup.php?i=${encodeURIComponent(id)}`, signal);
  const meals = readMeals(payload);
  return meals.length > 0 ? mealToRecipe(meals[0]) : null;
}
