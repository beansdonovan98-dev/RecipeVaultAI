import type { Category, RecipeInput } from '../types/recipe';
import { DEFAULT_ASSISTANT_NAME } from '../constants/assistant.ts';
import { geminiGenerateTextWithFallback, type GeminiChatMessage } from './gemini.ts';

export interface CreatorMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CreatorPersona {
  /** What the assistant calls itself, e.g. "BMO". */
  name: string;
  /** Personality direction for the model. */
  instructions: string;
}

export interface CreatorReply {
  /** Short in-character line shown above the recipe card. May be empty. */
  reply: string;
  recipe: RecipeInput;
}

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
 * Builds the system prompt for the recipe assistant. The personality lives in
 * the "reply" field only, so it can never distort a cooking time or quantity.
 */
export function buildCreatorSystemPrompt(persona: CreatorPersona): string {
  const name = persona.name.trim() || DEFAULT_ASSISTANT_NAME;
  const instructions = persona.instructions.trim();

  return [
    `You are ${name}, the recipe assistant inside a shared recipe app used by two people.`,
    '',
    'PERSONALITY',
    instructions || 'Be warm, clear, and encouraging.',
    '',
    'Stay fully in character, but only inside the "reply" field.',
    `Always refer to yourself in the third person by your name, for example "${name} thinks this will be delicious." Never use "I" or "me" about yourself.`,
    "Use the personality's catchphrases and verbal tics freely, but never let them crowd out the recipe itself.",
    'Accuracy always wins: never let the personality change cooking times, temperatures, quantities, or food-safety advice.',
    '',
    'TASK',
    'The user describes what they want to cook in everyday language, for example "baked chicken over rice recipe", "chicken marsala recipe", or "healthy milkshake recipe".',
    'They may also ask you to revise the recipe you just gave, for example "make it without curry", "make it vegan", or "spicier".',
    '',
    'Reply with a single JSON object and nothing else, using exactly these fields:',
    '{',
    '  "reply": string,',
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
    '"reply" is required and never empty: 1-2 short sentences in character, under 220 characters.',
    '',
    'Rules:',
    '- Answer the request directly and specifically. Never fall back to a generic template when the user names a dish.',
    '- If the user asks to remove or avoid an ingredient, leave it out and adjust the other ingredients and steps accordingly.',
    '- Keep ingredients and instructions realistic, ordered, and complete.',
    '- Output ONLY the JSON object. No markdown fences, no commentary, no trailing text.',
  ].join('\n');
}

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

/**
 * Guarantees every assistant turn has a short third-person line, even if the
 * model forgets one. Pure helper, exported for deterministic testing.
 */
export function ensureThirdPersonReply(reply: string, name: string): string {
  const personaName = name.trim() || DEFAULT_ASSISTANT_NAME;
  const trimmed = (reply ?? '').trim();
  if (!trimmed) {
    return `${personaName} thinks this one looks delicious!`;
  }
  if (trimmed.toLowerCase().includes(personaName.toLowerCase())) {
    return trimmed;
  }
  return `${personaName} says: ${trimmed}`;
}

/**
 * Turns a raw model payload into the reply line plus a validated recipe, or
 * null when there is no usable recipe. Exported for deterministic testing.
 */
export function normalizeCreatorReply(
  raw: unknown,
  assistantName = DEFAULT_ASSISTANT_NAME,
): CreatorReply | null {
  const recipe = normalizeRecipe(raw);
  if (!recipe) {
    return null;
  }
  const rawReply = raw && typeof raw === 'object'
    ? asString((raw as Record<string, unknown>).reply)
    : '';
  return {
    reply: ensureThirdPersonReply(rawReply, assistantName).slice(0, 400),
    recipe,
  };
}

export function toGeminiMessages(history: CreatorMessage[]): GeminiChatMessage[] {
  return history.map((message) => ({ role: message.role, content: message.content }));
}

/**
 * Sends the conversation to Gemini and returns the in-character reply plus a
 * validated recipe. The model sees the whole chat, so a follow-up like "make it
 * without curry" revises the current recipe instead of starting over.
 */
export async function createRecipeFromChat(
  history: CreatorMessage[],
  persona: CreatorPersona,
  signal?: AbortSignal,
): Promise<CreatorReply> {
  if (history.length === 0) {
    throw new Error('Ask for a recipe first.');
  }

  const text = await geminiGenerateTextWithFallback(toGeminiMessages(history), {
    systemInstruction: buildCreatorSystemPrompt(persona),
    responseMimeType: 'application/json',
    temperature: 0.65,
    signal,
  });

  const reply = normalizeCreatorReply(extractRecipeJson(text), persona.name);
  if (!reply) {
    throw new Error('The model did not return a usable recipe. Please try again.');
  }
  return reply;
}
