import type { Category, RecipeInput } from '../types/recipe';
import { geminiGenerateTextWithFallback, type GeminiChatMessage } from './gemini.ts';

export interface CreatorMessage {
  role: 'user' | 'model';
  content: string;
}

export const RECIPE_CREATOR_SYSTEM_PROMPT = [
  'You are RecipeVault, a friendly recipe assistant inside a recipe app.',
  'The user describes the recipe they want in natural language, for example "baked chicken over rice recipe", "chicken marsala recipe", or "healthy milkshake recipe".',
  'They may also ask you to refine the recipe you just gave them, for example "make it without curry", "make it vegan", or "spicier".',
  '',
  'Reply with a single JSON object and nothing else, using exactly these fields:',
  '{',
  '  "title": string,',
  '  "description": string,',
  '  "category": one of Breakfast, Lunch, Dinner, Appetizer, Dessert, Snack, Drink, Salad, Soup, Baking, Vegetarian, Vegan, Gluten-Free, Quick & Easy, Healthy, Comfort Food,',
  '  "tags": string[],',
  '  "prepTime": number (minutes),',
  '  "cookTime": number (minutes),',
  '  "servings": number,',
  '  "ingredients": [{ "name": string, "amount": string, "unit": string }],',
  '  "instructions": [{ "text": string }]',
  '}',
  '',
  'Rules:',
  '- Answer the request directly and specifically. Never fall back to a generic template when the user names a dish.',
  '- If the user asks to remove or avoid an ingredient, leave it out and adjust the other ingredients and steps accordingly.',
  '- Keep ingredients and instructions realistic, ordered, and complete.',
  '- Output ONLY the JSON object. No markdown fences, no commentary, no trailing text.',
].join('\n');

const VALID_CATEGORIES: Category[] = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Appetizer',
  'Dessert',
  'Snack',
  'Drink',
  'Salad',
  'Soup',
  'Baking',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Quick & Easy',
  'Healthy',
  'Comfort Food',
];

const FALLBACK_CATEGORY: Category = 'Quick & Easy';

/**
 * Pulls the first JSON object out of a model reply, tolerating markdown code
 * fences and surrounding prose. Exported for deterministic testing.
 */
export function extractRecipeJson(text: string): unknown {
  const trimmed = (text ?? '').trim();
  if (!trimmed) {
    return null;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : trimmed).trim();

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall through to brace matching below.
  }

  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

/**
 * Coerces an arbitrary parsed object into a RecipeInput, or returns null when
 * it is not a usable recipe. Exported for deterministic testing.
 */
export function normalizeRecipe(raw: unknown): RecipeInput | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const obj = raw as Record<string, unknown>;

  const title = asString(obj.title);
  const description = asString(obj.description);
  if (!title || !description) {
    return null;
  }

  const rawCategory = asString(obj.category);
  const category: Category = (VALID_CATEGORIES as string[]).includes(rawCategory)
    ? (rawCategory as Category)
    : FALLBACK_CATEGORY;

  const rawTags = Array.isArray(obj.tags) ? obj.tags : [];
  const tags = rawTags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const finalTags = tags.length > 0 ? tags : [category];

  const rawIngredients = Array.isArray(obj.ingredients) ? obj.ingredients : [];
  const ingredients = rawIngredients
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const item = entry as Record<string, unknown>;
      const name = asString(item.name);
      if (!name) {
        return null;
      }
      return { name, amount: asString(item.amount), unit: asString(item.unit) };
    })
    .filter((entry): entry is { name: string; amount: string; unit: string } => entry !== null);

  const rawInstructions = Array.isArray(obj.instructions) ? obj.instructions : [];
  const instructions = rawInstructions
    .map((entry) => {
      if (typeof entry === 'string') {
        return asString(entry);
      }
      if (entry && typeof entry === 'object') {
        return asString((entry as Record<string, unknown>).text);
      }
      return '';
    })
    .map((text) => text.trim())
    .filter(Boolean);

  if (ingredients.length === 0 || instructions.length === 0) {
    return null;
  }

  return {
    title,
    description,
    category,
    tags: finalTags,
    prepTime: asNumber(obj.prepTime, 10),
    cookTime: asNumber(obj.cookTime, 20),
    servings: Math.max(1, Math.round(asNumber(obj.servings, 2))),
    ingredients,
    instructions: instructions.map((text) => ({ text })),
    imageUri: null,
  };
}

export function toGeminiMessages(history: CreatorMessage[]): GeminiChatMessage[] {
  return history.map((message) => ({ role: message.role, content: message.content }));
}

/**
 * Sends the conversation to Gemini and returns a validated recipe. The model
 * sees the whole chat, so a follow-up like "make it without curry" revises the
 * current recipe instead of starting over.
 */
export async function createRecipeFromChat(
  history: CreatorMessage[],
  signal?: AbortSignal,
): Promise<RecipeInput> {
  if (history.length === 0) {
    throw new Error('Ask for a recipe first.');
  }

  const text = await geminiGenerateTextWithFallback(toGeminiMessages(history), {
    systemInstruction: RECIPE_CREATOR_SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    temperature: 0.4,
    signal,
  });

  const recipe = normalizeRecipe(extractRecipeJson(text));
  if (!recipe) {
    throw new Error('The model did not return a usable recipe. Please try again.');
  }
  return recipe;
}
