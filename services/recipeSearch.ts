import type { RecipeInput } from '../types/recipe';

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RESULTS = 12;
const MAX_TERM_SEARCHES = 4;

// Words that carry little meaning for a recipe-name lookup. They are skipped
// when falling back to per-word searches so "baked chicken and rice" becomes
// ["chicken", "baked", "rice"] instead of matching nothing.
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'best', 'but', 'by', 'can', 'do',
  'does', 'easy', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'its', 'made',
  'make', 'me', 'my', 'of', 'on', 'or', 'quick', 'recipe', 'recipes', 'simple',
  'some', 'that', 'the', 'this', 'to', 'very', 'with', 'you', 'your',
]);

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

async function fetchMeals(path: string, signal?: AbortSignal): Promise<MealDbMeal[]> {
  const payload = await fetchJson(path, signal);
  return readMeals(payload);
}

/**
 * Breaks a free-text query into meaningful search terms, dropping stop words
 * and short words. Exported for deterministic testing.
 */
export function buildSearchTerms(query: string): string[] {
  const words = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const word of words) {
    if (word.length < 3 || STOP_WORDS.has(word) || seen.has(word)) {
      continue;
    }
    seen.add(word);
    terms.push(word);
  }
  return terms;
}

export async function searchRecipes(
  query: string,
  signal?: AbortSignal
): Promise<RecipeSearchResult[]> {
  const trimmed = query.trim();
  const primary = await fetchMeals(`/search.php?s=${encodeURIComponent(trimmed)}`, signal);
  if (primary.length > 0) {
    return primary.slice(0, MAX_RESULTS).map(toSearchResult);
  }

  // The free database has a small catalogue, so a long phrase like
  // "baked chicken and rice" returns nothing even though "chicken" and "rice"
  // are well covered. Fall back to searching each meaningful word and merging
  // the unique hits, most distinctive term first.
  const terms = buildSearchTerms(trimmed);
  if (terms.length === 0) {
    return [];
  }

  const ordered = [...terms].sort((a, b) => b.length - a.length).slice(0, MAX_TERM_SEARCHES);
  const merged = new Map<string, RecipeSearchResult>();

  await Promise.all(
    ordered.map(async (term) => {
      try {
        const meals = await fetchMeals(`/search.php?s=${encodeURIComponent(term)}`, signal);
        for (const meal of meals) {
          const result = toSearchResult(meal);
          if (!merged.has(result.id)) {
            merged.set(result.id, result);
          }
        }
      } catch (error) {
        if (signal?.aborted) {
          throw error;
        }
        // A single term failing should not discard the other matches.
      }
    })
  );

  return [...merged.values()].slice(0, MAX_RESULTS);
}

export async function getRecipeById(
  id: string,
  signal?: AbortSignal
): Promise<RecipeInput | null> {
  const payload = await fetchJson(`/lookup.php?i=${encodeURIComponent(id)}`, signal);
  const meals = readMeals(payload);
  return meals.length > 0 ? mealToRecipe(meals[0]) : null;
}
