import { RecipeInput, Ingredient } from '@/types/recipe';

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

const RECIPE_TEMPLATES: Record<string, { name: string; prepTime: number; cookTime: number; instructions: string[] }> = {
  stirFry: {
    name: 'Quick Stir-Fry',
    prepTime: 10,
    cookTime: 15,
    instructions: [
      'Prep all ingredients: wash, peel, and chop vegetables and protein into bite-sized pieces.',
      'Heat a large wok or skillet over high heat with 1-2 tablespoons of oil.',
      'Add protein first and cook until golden brown, about 3-4 minutes. Remove and set aside.',
      'Add vegetables in order of cooking time - start with the hardest (carrots, broccoli) first.',
      'Return protein to the pan. Add sauce ingredients and toss everything together.',
      'Cook for 2-3 more minutes until sauce thickens and coats everything evenly.',
      'Serve immediately over rice or noodles. Garnish with fresh herbs or sesame seeds.',
    ],
  },
  roasted: {
    name: 'Roasted Medley',
    prepTime: 15,
    cookTime: 30,
    instructions: [
      'Preheat oven to 400°F (200°C).',
      'Chop all vegetables into uniform pieces for even cooking.',
      'Toss vegetables with olive oil, salt, pepper, and your choice of herbs.',
      'Spread on a baking sheet in a single layer - do not overcrowd.',
      'Roast for 25-30 minutes, flipping halfway through, until golden and tender.',
      'In the last 5 minutes, add any quick-cooking ingredients like protein or cheese.',
      'Remove from oven, finish with fresh herbs or a squeeze of lemon. Serve warm.',
    ],
  },
  salad: {
    name: 'Fresh Garden Salad',
    prepTime: 15,
    cookTime: 0,
    instructions: [
      'Wash and dry all vegetables and greens thoroughly.',
      'Chop vegetables into bite-sized pieces. Tear greens by hand for better texture.',
      'Prepare the dressing: whisk together oil, vinegar, mustard, salt, and pepper.',
      'Combine greens and vegetables in a large bowl.',
      'Drizzle dressing over the salad and toss gently to coat.',
      'Add protein, cheese, nuts, or seeds as desired.',
      'Serve immediately or chill for 15 minutes for a refreshing cold salad.',
    ],
  },
  soup: {
    name: 'Hearty Soup',
    prepTime: 15,
    cookTime: 40,
    instructions: [
      'Dice onion, garlic, and all vegetables.',
      'Heat oil in a large pot over medium heat. Sauté onion until translucent, about 5 minutes.',
      'Add garlic and cook for 1 minute until fragrant.',
      'Add remaining vegetables and cook for 5 minutes, stirring occasionally.',
      'Pour in broth and bring to a boil. Reduce heat and simmer for 20-25 minutes.',
      'Season with salt, pepper, and herbs. Blend partially if desired for creaminess.',
      'Adjust seasoning to taste. Serve hot with crusty bread or garnish of choice.',
    ],
  },
  pasta: {
    name: 'Simple Pasta',
    prepTime: 10,
    cookTime: 20,
    instructions: [
      'Bring a large pot of salted water to a boil.',
      'Cook pasta according to package directions until al dente. Reserve 1 cup pasta water.',
      'While pasta cooks, heat olive oil in a large skillet over medium heat.',
      'Sauté garlic and any quick-cooking vegetables for 2-3 minutes.',
      'Add cooked pasta to the skillet with a splash of pasta water.',
      'Toss everything together. Add cheese, herbs, and seasonings.',
      'Finish with a drizzle of olive oil. Serve immediately with extra cheese.',
    ],
  },
  smoothie: {
    name: 'Blended Smoothie',
    prepTime: 5,
    cookTime: 0,
    instructions: [
      'Add liquid base to the blender first.',
      'Add soft fruits and vegetables next.',
      'Add frozen ingredients last for best blending.',
      'Blend on low for 10 seconds, then increase to high for 30-60 seconds.',
      'If too thick, add more liquid 1 tablespoon at a time.',
      'Taste and adjust sweetness or flavor as needed.',
      'Pour into a glass and enjoy immediately.',
    ],
  },
  curry: {
    name: 'Fragrant Curry',
    prepTime: 15,
    cookTime: 35,
    instructions: [
      'Dice onion and mince garlic and ginger.',
      'Heat oil in a large pot over medium heat. Sauté onion until golden, about 8 minutes.',
      'Add garlic, ginger, and curry paste. Cook for 2 minutes until fragrant.',
      'Add protein and sear on all sides, about 3-4 minutes.',
      'Add coconut milk and vegetables. Bring to a simmer.',
      'Cook for 20-25 minutes until vegetables are tender and flavors meld.',
      'Season with salt, pepper, and fresh lime juice. Serve over rice.',
    ],
  },
  baked: {
    name: 'Oven-Baked Dish',
    prepTime: 20,
    cookTime: 45,
    instructions: [
      'Preheat oven to 375°F (190°C). Prepare a baking dish with oil or parchment.',
      'Mix dry ingredients in a large bowl.',
      'In a separate bowl, whisk wet ingredients together.',
      'Combine wet and dry ingredients, stirring until just combined.',
      'Fold in any add-ins like vegetables, cheese, or protein.',
      'Transfer to baking dish and spread evenly.',
      'Bake for 40-50 minutes until golden brown and a toothpick comes out clean.',
      'Cool for 5-10 minutes before serving.',
    ],
  },
};

function detectRecipeType(ingredients: Ingredient[]): string {
  const names = ingredients.map(i => i.name.toLowerCase()).join(' ');
  if (names.includes('banana') || names.includes('berry') || names.includes('milk') || names.includes('yogurt')) {
    return 'smoothie';
  }
  if (names.includes('curry') || names.includes('coconut milk')) {
    return 'curry';
  }
  if (names.includes('flour') || names.includes('baking powder') || names.includes('egg')) {
    return 'baked';
  }
  if (names.includes('pasta') || names.includes('spaghetti')) {
    return 'pasta';
  }
  if (names.includes('lettuce') || names.includes('spinach') || names.includes('salad')) {
    return 'salad';
  }
  if (names.includes('broth') || names.includes('stock') || names.includes('soup')) {
    return 'soup';
  }
  if (names.includes('pepper') && names.includes('onion') && names.includes('oil')) {
    return 'stirFry';
  }
  if (names.includes('vegetable') || names.includes('potato') || names.includes('carrot')) {
    return 'roasted';
  }
  return 'stirFry';
}

function generateRecipeName(ingredients: Ingredient[], template: string): string {
  const mainIngredients = ingredients.slice(0, 3).map(i => i.name.toLowerCase());
  const names = mainIngredients.join(' & ');
  const templateNames: Record<string, string> = {
    stirFry: 'Stir-Fry',
    roasted: 'Roasted Medley',
    salad: 'Garden Salad',
    soup: 'Hearty Soup',
    pasta: 'Pasta',
    smoothie: 'Smoothie',
    curry: 'Curry',
    baked: 'Baked Dish',
  };
  return `${names.charAt(0).toUpperCase() + names.slice(1)} ${templateNames[template] || 'Dish'}`;
}

export async function generateRecipeFromIngredients(ingredients: Ingredient[]): Promise<RecipeInput> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const type = detectRecipeType(ingredients);
  const template = RECIPE_TEMPLATES[type];
  const name = generateRecipeName(ingredients, type);

  return {
    title: name,
    description: `A delicious ${template.name.toLowerCase()} recipe generated from your ingredients: ${ingredients.map(i => i.name).join(', ')}.`,
    category: type === 'smoothie' ? 'Drink' : type === 'salad' ? 'Salad' : type === 'soup' ? 'Soup' : 'Quick & Easy',
    prepTime: template.prepTime,
    cookTime: template.cookTime,
    servings: 2,
    ingredients: ingredients.map(i => ({
      name: i.name,
      amount: i.amount,
      unit: i.unit,
    })),
    instructions: template.instructions.map(text => ({ text })),
    imageUri: null,
  };
}

export async function getIngredientSubstitution(ingredient: string): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const key = ingredient.toLowerCase().trim();
  return SUBSTITUTIONS[key] || [
    `Try replacing ${ingredient} with a similar ingredient of your choice`,
    `Use ${ingredient} in a smaller amount or omit entirely`,
    'Check specialty stores for alternatives',
  ];
}

export async function getAllSubstitutions(): Promise<Record<string, string[]>> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return SUBSTITUTIONS;
}
