import { geminiGenerateTextWithFallback } from './gemini';
import { isGeminiConfigured } from './gemini';
import { DEFAULT_ASSISTANT_NAME } from '../constants/assistant.ts';

const SUBSTITUTIONS: Record<string, string[]> = {
  'butter': ['coconut oil', 'olive oil', 'ghee', 'applesauce (for baking)'],
  'milk': ['almond milk', 'oat milk', 'coconut milk', 'soy milk'],
  'egg': ['flax egg (1 tbsp flax + 3 tbsp water)', 'mashed banana', 'applesauce', 'silken tofu'],
  'flour': ['almond flour', 'oat flour', 'coconut flour', 'gluten-free blend'],
  'sugar': ['honey', 'maple syrup', 'stevia', 'coconut sugar'],
  'cream': ['coconut cream', 'cashew cream', 'evaporated milk'],
  'yogurt': ['coconut yogurt', 'greek yogurt', 'sour cream'],
  'cheese': ['nutritional yeast', 'vegan cheese', 'cashew cheese'],
  'chicken': ['tofu', 'tempeh', 'chickpeas', 'seitan'],
  'beef': ['lentils', 'mushrooms', 'black beans', 'textured vegetable protein'],
  'rice': ['quinoa', 'cauliflower rice', 'barley', 'couscous'],
  'pasta': ['zucchini noodles', 'spaghetti squash', 'chickpea pasta', 'rice noodles'],
  'bread': ['lettuce wraps', 'corn tortillas', 'gluten-free bread', 'portobello caps'],
  'soy sauce': ['tamari', 'coconut aminos', 'liquid aminos'],
  'lemon juice': ['lime juice', 'vinegar', 'white wine vinegar'],
  'onion': ['shallots', 'leeks', 'green onions', 'onion powder'],
  'garlic': ['garlic powder', 'shallots', 'garlic-infused oil'],
  'tomato': ['red bell pepper', 'pumpkin puree', 'tamarind paste'],
  'potato': ['sweet potato', 'cauliflower', 'turnip', 'butternut squash'],
  'cream cheese': ['cashew cream cheese', 'ricotta', 'mashed avocado'],
  'mayonnaise': ['mashed avocado', 'greek yogurt', 'hummus'],
  'sour cream': ['greek yogurt', 'coconut cream', 'cashew cream'],
  'heavy cream': ['coconut cream', 'evaporated milk', 'milk + butter'],
  'vanilla extract': ['vanilla bean paste', 'vanilla powder', 'almond extract (different flavor)'],
  'baking powder': ['baking soda + cream of tartar', 'self-rising flour'],
  'cornstarch': ['arrowroot powder', 'tapioca starch', 'flour (double the amount)'],
  'brown sugar': ['white sugar + molasses', 'coconut sugar', 'maple sugar'],
  'honey': ['maple syrup', 'agave nectar', 'date syrup'],
  'nuts': ['seeds (sunflower, pumpkin)', 'oats', 'coconut flakes'],
  'chickpeas': ['white beans', 'lentils', 'black beans'],
  'spinach': ['kale', 'swiss chard', 'arugula', 'collard greens'],
  'broccoli': ['cauliflower', 'green beans', 'asparagus', 'zucchini'],
  'mushrooms': ['eggplant', 'zucchini', 'tofu', 'tempeh'],
  'bacon': ['turkey bacon', 'smoked tofu', 'mushroom bacon', 'coconut bacon'],
  'shrimp': ['chicken', 'tofu', 'hearts of palm', 'artichoke hearts'],
  'salmon': ['trout', 'arctic char', 'mackerel', 'sardines'],
  'tuna': ['chickpeas', 'hearts of palm', 'jackfruit', 'chicken'],
};

function extractSubstitutions(text: string): string[] {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
    }
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      const subs = obj.substitutions ?? obj.results ?? obj.items;
      if (Array.isArray(subs)) {
        return subs.filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
      }
    }
  } catch {
    // Not JSON — fall through to line parsing.
  }
  return trimmed
    .split('\n')
    .map((line) => line.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 8);
}

export async function getIngredientSubstitution(
  ingredient: string,
  assistantName?: string,
): Promise<string[]> {
  const key = ingredient.toLowerCase().trim();
  if (!key) return [];

  if (!isGeminiConfigured()) {
    return SUBSTITUTIONS[key] || [
      `Try replacing ${ingredient} with a similar ingredient of your choice`,
      `Use ${ingredient} in a smaller amount or omit entirely`,
      'Check specialty stores for alternatives',
    ];
  }

  const name = (assistantName ?? DEFAULT_ASSISTANT_NAME).trim() || DEFAULT_ASSISTANT_NAME;
  try {
    const text = await geminiGenerateTextWithFallback([
      {
        role: 'user',
        content: `You are ${name}, a helpful recipe assistant. Suggest practical culinary substitutions for "${ingredient}". Reply with a JSON array of 4-6 short strings, each one a substitution or a brief note (e.g. "coconut oil (use 3/4 the amount)"). No other text.`,
      },
    ]);
    const results = extractSubstitutions(text);
    if (results.length > 0) return results;
  } catch {
    // Fall through to the offline table.
  }

  return SUBSTITUTIONS[key] || [
    `Try replacing ${ingredient} with a similar ingredient of your choice`,
    `Use ${ingredient} in a smaller amount or omit entirely`,
    'Check specialty stores for alternatives',
  ];
}

export async function getAllSubstitutions(): Promise<Record<string, string[]>> {
  return SUBSTITUTIONS;
}
