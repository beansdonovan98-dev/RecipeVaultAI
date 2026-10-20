import type { RecipeInput } from '../types/recipe';

interface RecipeTemplate {
  category: RecipeInput['category'];
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Array<{ name: string; amount: string; unit: string }>;
  instructions: string[];
}

const RECIPE_TEMPLATES: Record<string, RecipeTemplate> = {
  'pancakes': {
    category: 'Breakfast',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    ingredients: [
      { name: 'all-purpose flour', amount: '1.5', unit: 'cups' },
      { name: 'baking powder', amount: '2', unit: 'tsp' },
      { name: 'sugar', amount: '2', unit: 'tbsp' },
      { name: 'salt', amount: '0.5', unit: 'tsp' },
      { name: 'milk', amount: '1.25', unit: 'cups' },
      { name: 'egg', amount: '1', unit: '' },
      { name: 'melted butter', amount: '3', unit: 'tbsp' },
      { name: 'vanilla extract', amount: '1', unit: 'tsp' },
    ],
    instructions: [
      'Whisk flour, baking powder, sugar, and salt in a large bowl.',
      'Whisk milk, egg, melted butter, and vanilla in a second bowl.',
      'Pour the wet ingredients into the dry ingredients and stir until just combined.',
      'Heat a lightly greased skillet over medium heat.',
      'Pour 1/4 cup batter per pancake and cook until bubbles form, about 2 minutes.',
      'Flip and cook 1-2 minutes more until golden. Serve warm.',
    ],
  },
  'french toast': {
    category: 'Breakfast',
    prepTime: 10,
    cookTime: 10,
    servings: 4,
    ingredients: [
      { name: 'bread slices', amount: '8', unit: '' },
      { name: 'eggs', amount: '4', unit: '' },
      { name: 'milk', amount: '0.5', unit: 'cup' },
      { name: 'vanilla extract', amount: '1', unit: 'tsp' },
      { name: 'cinnamon', amount: '0.5', unit: 'tsp' },
      { name: 'butter', amount: '2', unit: 'tbsp' },
      { name: 'maple syrup', amount: '0.5', unit: 'cup' },
    ],
    instructions: [
      'Whisk eggs, milk, vanilla, and cinnamon in a shallow dish.',
      'Heat butter in a skillet over medium heat.',
      'Dip each bread slice in the egg mixture for 15-20 seconds per side.',
      'Cook 2-3 minutes per side until golden brown.',
      'Serve warm with maple syrup.',
    ],
  },
  'scrambled eggs': {
    category: 'Breakfast',
    prepTime: 5,
    cookTime: 5,
    servings: 2,
    ingredients: [
      { name: 'eggs', amount: '4', unit: '' },
      { name: 'butter', amount: '1', unit: 'tbsp' },
      { name: 'milk', amount: '2', unit: 'tbsp' },
      { name: 'salt', amount: '0.25', unit: 'tsp' },
      { name: 'black pepper', amount: '0.25', unit: 'tsp' },
    ],
    instructions: [
      'Whisk eggs, milk, salt, and pepper until blended.',
      'Melt butter in a nonstick skillet over medium-low heat.',
      'Pour in the eggs and cook without stirring for 30 seconds.',
      'Gently push the eggs from the edges toward the center.',
      'Cook until just set but still soft. Serve immediately.',
    ],
  },
  'spaghetti carbonara': {
    category: 'Dinner',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    ingredients: [
      { name: 'spaghetti', amount: '12', unit: 'oz' },
      { name: 'bacon', amount: '6', unit: 'oz' },
      { name: 'eggs', amount: '4', unit: '' },
      { name: 'parmesan cheese', amount: '1', unit: 'cup' },
      { name: 'black pepper', amount: '1', unit: 'tsp' },
      { name: 'garlic', amount: '2', unit: 'cloves' },
      { name: 'olive oil', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      'Bring a large pot of salted water to a boil and cook spaghetti until al dente.',
      'While the pasta cooks, crisp bacon in a skillet and drain on paper towels.',
      'Whisk eggs, parmesan, and pepper in a bowl.',
      'Reserve 1 cup pasta water, then drain the spaghetti.',
      'Toss hot spaghetti with bacon and a little olive oil and garlic.',
      'Remove from heat, quickly stir in the egg mixture with a splash of pasta water.',
      'Serve immediately with extra parmesan and pepper.',
    ],
  },
  'mac and cheese': {
    category: 'Comfort Food',
    prepTime: 10,
    cookTime: 25,
    servings: 6,
    ingredients: [
      { name: 'elbow macaroni', amount: '12', unit: 'oz' },
      { name: 'butter', amount: '4', unit: 'tbsp' },
      { name: 'all-purpose flour', amount: '0.25', unit: 'cup' },
      { name: 'milk', amount: '3', unit: 'cups' },
      { name: 'heavy cream', amount: '0.5', unit: 'cup' },
      { name: 'sharp cheddar', amount: '3', unit: 'cups' },
      { name: 'salt', amount: '1', unit: 'tsp' },
      { name: 'black pepper', amount: '0.5', unit: 'tsp' },
    ],
    instructions: [
      'Cook macaroni in salted boiling water until just al dente and drain.',
      'Melt butter in a saucepan over medium heat and whisk in flour for 1 minute.',
      'Slowly whisk in milk and cream until smooth and thickened.',
      'Remove from heat and stir in cheddar, salt, and pepper until melted.',
      'Fold in the macaroni and serve hot.',
    ],
  },
  'chicken stir fry': {
    category: 'Quick & Easy',
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    ingredients: [
      { name: 'chicken breast', amount: '1.5', unit: 'lb' },
      { name: 'broccoli florets', amount: '3', unit: 'cups' },
      { name: 'bell peppers', amount: '2', unit: '' },
      { name: 'soy sauce', amount: '0.25', unit: 'cup' },
      { name: 'honey', amount: '2', unit: 'tbsp' },
      { name: 'garlic', amount: '3', unit: 'cloves' },
      { name: 'ginger', amount: '1', unit: 'tbsp' },
      { name: 'sesame oil', amount: '1', unit: 'tbsp' },
      { name: 'cornstarch', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      'Slice chicken and vegetables into bite-sized pieces.',
      'Whisk soy sauce, honey, garlic, ginger, sesame oil, and cornstarch with 1/4 cup water.',
      'Heat oil in a wok or large skillet over high heat.',
      'Cook chicken until browned, about 4-5 minutes, then remove.',
      'Add vegetables and stir-fry for 3-4 minutes until crisp-tender.',
      'Return chicken to the pan and pour in the sauce.',
      'Cook 2 minutes until the sauce thickens. Serve over rice.',
    ],
  },
  'fried rice': {
    category: 'Quick & Easy',
    prepTime: 10,
    cookTime: 10,
    servings: 4,
    ingredients: [
      { name: 'cold cooked rice', amount: '4', unit: 'cups' },
      { name: 'eggs', amount: '3', unit: '' },
      { name: 'mixed vegetables', amount: '1.5', unit: 'cups' },
      { name: 'soy sauce', amount: '3', unit: 'tbsp' },
      { name: 'sesame oil', amount: '1', unit: 'tbsp' },
      { name: 'green onions', amount: '3', unit: '' },
      { name: 'garlic', amount: '2', unit: 'cloves' },
    ],
    instructions: [
      'Scramble the eggs in a hot oiled skillet and set aside.',
      'Add garlic and mixed vegetables and cook for 2-3 minutes.',
      'Add cold rice and break up any clumps.',
      'Stir in soy sauce and sesame oil and cook 3-4 minutes.',
      'Return eggs to the pan, add green onions, and toss to combine.',
    ],
  },
  'chicken curry': {
    category: 'Dinner',
    prepTime: 15,
    cookTime: 35,
    servings: 4,
    ingredients: [
      { name: 'chicken thighs', amount: '1.5', unit: 'lb' },
      { name: 'onion', amount: '1', unit: '' },
      { name: 'garlic', amount: '3', unit: 'cloves' },
      { name: 'ginger', amount: '1', unit: 'tbsp' },
      { name: 'curry powder', amount: '2', unit: 'tbsp' },
      { name: 'coconut milk', amount: '14', unit: 'oz' },
      { name: 'chicken broth', amount: '0.5', unit: 'cup' },
      { name: 'lime juice', amount: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Brown chicken pieces in a large pot and set aside.',
      'Sauté onion, garlic, and ginger until softened and fragrant.',
      'Add curry powder and cook for 1 minute.',
      'Pour in coconut milk and broth and return chicken to the pot.',
      'Simmer 25-30 minutes until chicken is cooked through and sauce thickens.',
      'Stir in lime juice and season to taste. Serve over rice.',
    ],
  },
  'chili': {
    category: 'Comfort Food',
    prepTime: 15,
    cookTime: 45,
    servings: 6,
    ingredients: [
      { name: 'ground beef', amount: '1.5', unit: 'lb' },
      { name: 'onion', amount: '1', unit: '' },
      { name: 'bell pepper', amount: '1', unit: '' },
      { name: 'kidney beans', amount: '15', unit: 'oz' },
      { name: 'diced tomatoes', amount: '28', unit: 'oz' },
      { name: 'chili powder', amount: '2', unit: 'tbsp' },
      { name: 'cumin', amount: '1', unit: 'tbsp' },
      { name: 'garlic', amount: '3', unit: 'cloves' },
    ],
    instructions: [
      'Brown ground beef in a large pot and drain excess fat.',
      'Add onion, bell pepper, and garlic and cook until softened.',
      'Stir in chili powder and cumin and cook for 1 minute.',
      'Add tomatoes, beans, and 1 cup water.',
      'Simmer 35-45 minutes until thickened. Season to taste.',
      'Serve with shredded cheese, sour cream, or green onions.',
    ],
  },
  'tomato soup': {
    category: 'Soup',
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    ingredients: [
      { name: 'canned crushed tomatoes', amount: '28', unit: 'oz' },
      { name: 'onion', amount: '1', unit: '' },
      { name: 'garlic', amount: '3', unit: 'cloves' },
      { name: 'butter', amount: '2', unit: 'tbsp' },
      { name: 'chicken broth', amount: '2', unit: 'cups' },
      { name: 'heavy cream', amount: '0.5', unit: 'cup' },
      { name: 'basil', amount: '1', unit: 'tsp' },
    ],
    instructions: [
      'Sauté onion and garlic in butter until soft.',
      'Add crushed tomatoes, broth, and basil and bring to a simmer.',
      'Cook 20 minutes, then blend until smooth.',
      'Stir in cream and warm through. Season with salt and pepper.',
      'Serve with grilled cheese or crusty bread.',
    ],
  },
  'tacos': {
    category: 'Dinner',
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    ingredients: [
      { name: 'ground beef', amount: '1', unit: 'lb' },
      { name: 'taco seasoning', amount: '2', unit: 'tbsp' },
      { name: 'taco shells', amount: '12', unit: '' },
      { name: 'shredded lettuce', amount: '2', unit: 'cups' },
      { name: 'cheddar cheese', amount: '1', unit: 'cup' },
      { name: 'salsa', amount: '1', unit: 'cup' },
      { name: 'sour cream', amount: '0.5', unit: 'cup' },
    ],
    instructions: [
      'Brown ground beef in a skillet and drain fat.',
      'Add taco seasoning and 1/4 cup water, then simmer 5 minutes.',
      'Warm taco shells according to package directions.',
      'Fill shells with beef, lettuce, cheese, salsa, and sour cream.',
      'Serve immediately with lime wedges.',
    ],
  },
  'caesar salad': {
    category: 'Salad',
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    ingredients: [
      { name: 'romaine lettuce', amount: '2', unit: 'hearts' },
      { name: 'croutons', amount: '1.5', unit: 'cups' },
      { name: 'parmesan cheese', amount: '0.75', unit: 'cup' },
      { name: 'chicken breast', amount: '1', unit: 'lb' },
      { name: 'caesar dressing', amount: '0.5', unit: 'cup' },
      { name: 'lemon juice', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      'Season and cook chicken until it reaches 165°F, then slice.',
      'Chop romaine and place in a large bowl.',
      'Add croutons, parmesan, and chicken.',
      'Drizzle with dressing and lemon juice and toss to coat.',
      'Serve chilled with extra parmesan.',
    ],
  },
  'smoothie': {
    category: 'Drink',
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    ingredients: [
      { name: 'frozen banana', amount: '1', unit: '' },
      { name: 'mixed berries', amount: '1.5', unit: 'cups' },
      { name: 'greek yogurt', amount: '0.75', unit: 'cup' },
      { name: 'milk', amount: '0.75', unit: 'cup' },
      { name: 'honey', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      'Add milk and yogurt to the blender first.',
      'Add banana, berries, and honey.',
      'Blend on high until smooth, adding milk if needed.',
      'Pour into glasses and serve immediately.',
    ],
  },
  'banana bread': {
    category: 'Baking',
    prepTime: 15,
    cookTime: 55,
    servings: 10,
    ingredients: [
      { name: 'ripe bananas', amount: '3', unit: '' },
      { name: 'all-purpose flour', amount: '2', unit: 'cups' },
      { name: 'sugar', amount: '0.75', unit: 'cup' },
      { name: 'butter', amount: '0.5', unit: 'cup' },
      { name: 'eggs', amount: '2', unit: '' },
      { name: 'baking soda', amount: '1', unit: 'tsp' },
      { name: 'vanilla extract', amount: '1', unit: 'tsp' },
      { name: 'salt', amount: '0.5', unit: 'tsp' },
    ],
    instructions: [
      'Preheat oven to 350°F and grease a 9x5-inch loaf pan.',
      'Mash bananas and whisk in melted butter, sugar, eggs, and vanilla.',
      'Fold in flour, baking soda, and salt until just combined.',
      'Pour into the pan and bake 50-60 minutes until a toothpick comes out clean.',
      'Cool 10 minutes in the pan, then transfer to a rack.',
    ],
  },
  'chocolate chip cookies': {
    category: 'Dessert',
    prepTime: 15,
    cookTime: 12,
    servings: 24,
    ingredients: [
      { name: 'butter', amount: '1', unit: 'cup' },
      { name: 'brown sugar', amount: '1', unit: 'cup' },
      { name: 'sugar', amount: '0.5', unit: 'cup' },
      { name: 'eggs', amount: '2', unit: '' },
      { name: 'vanilla extract', amount: '2', unit: 'tsp' },
      { name: 'all-purpose flour', amount: '2.25', unit: 'cups' },
      { name: 'baking soda', amount: '1', unit: 'tsp' },
      { name: 'chocolate chips', amount: '2', unit: 'cups' },
    ],
    instructions: [
      'Preheat oven to 350°F and line baking sheets with parchment.',
      'Cream butter and both sugars, then beat in eggs and vanilla.',
      'Whisk flour, baking soda, and salt, then stir into the butter mixture.',
      'Fold in chocolate chips.',
      'Scoop rounded tablespoons onto the sheets and bake 9-12 minutes.',
      'Cool on the sheets for 5 minutes before transferring.',
    ],
  },
  'grilled cheese': {
    category: 'Quick & Easy',
    prepTime: 5,
    cookTime: 8,
    servings: 2,
    ingredients: [
      { name: 'bread slices', amount: '4', unit: '' },
      { name: 'cheddar cheese', amount: '4', unit: 'oz' },
      { name: 'butter', amount: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Butter one side of each bread slice.',
      'Place bread butter-side down in a skillet over medium-low heat.',
      'Add cheese, top with another slice butter-side up.',
      'Cook 3-4 minutes per side until golden and the cheese is melted.',
    ],
  },
  'hamburger': {
    category: 'Dinner',
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    ingredients: [
      { name: 'ground beef', amount: '1.5', unit: 'lb' },
      { name: 'burger buns', amount: '4', unit: '' },
      { name: 'salt', amount: '1', unit: 'tsp' },
      { name: 'black pepper', amount: '0.5', unit: 'tsp' },
      { name: 'cheddar cheese', amount: '4', unit: 'slices' },
      { name: 'lettuce', amount: '4', unit: 'leaves' },
      { name: 'tomato', amount: '1', unit: '' },
    ],
    instructions: [
      'Divide ground beef into 4 patties and season with salt and pepper.',
      'Cook patties in a hot skillet or grill 3-4 minutes per side.',
      'Add cheese in the last minute and cover to melt.',
      'Toast buns if desired.',
      'Assemble with lettuce, tomato, and your favorite toppings.',
    ],
  },
  'mashed potatoes': {
    category: 'Comfort Food',
    prepTime: 15,
    cookTime: 20,
    servings: 6,
    ingredients: [
      { name: 'russet potatoes', amount: '2.5', unit: 'lb' },
      { name: 'butter', amount: '0.5', unit: 'cup' },
      { name: 'milk', amount: '0.75', unit: 'cup' },
      { name: 'garlic', amount: '3', unit: 'cloves' },
      { name: 'salt', amount: '1.5', unit: 'tsp' },
      { name: 'black pepper', amount: '0.5', unit: 'tsp' },
      { name: 'sour cream', amount: '0.5', unit: 'cup' },
    ],
    instructions: [
      'Peel and cut potatoes into large chunks.',
      'Boil in salted water for 15-20 minutes until very tender.',
      'Warm milk, butter, and garlic in a small saucepan.',
      'Drain potatoes and return them to the pot to dry for 1 minute.',
      'Mash in butter, warm milk, sour cream, salt, and pepper until smooth.',
      'Taste and adjust seasoning. Serve hot.',
    ],
  },
  'pizza': {
    category: 'Dinner',
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    ingredients: [
      { name: 'pizza dough', amount: '1', unit: 'lb' },
      { name: 'pizza sauce', amount: '0.75', unit: 'cup' },
      { name: 'mozzarella cheese', amount: '2', unit: 'cups' },
      { name: 'pepperoni', amount: '4', unit: 'oz' },
      { name: 'olive oil', amount: '1', unit: 'tbsp' },
      { name: 'italian seasoning', amount: '1', unit: 'tsp' },
    ],
    instructions: [
      'Preheat oven to 475°F and place a pizza stone or inverted baking sheet inside.',
      'Stretch or roll the dough on a floured surface to your desired thickness.',
      'Transfer dough to parchment and spread sauce, leaving a 1-inch border.',
      'Top with mozzarella, pepperoni, and Italian seasoning.',
      'Bake 12-15 minutes until the crust is golden and cheese is bubbly.',
      'Rest 3 minutes, slice, and serve.',
    ],
  },
  'roast chicken': {
    category: 'Dinner',
    prepTime: 15,
    cookTime: 65,
    servings: 4,
    ingredients: [
      { name: 'whole chicken', amount: '4', unit: 'lb' },
      { name: 'butter', amount: '4', unit: 'tbsp' },
      { name: 'lemon', amount: '1', unit: '' },
      { name: 'garlic', amount: '4', unit: 'cloves' },
      { name: 'rosemary', amount: '2', unit: 'sprigs' },
      { name: 'salt', amount: '2', unit: 'tsp' },
      { name: 'black pepper', amount: '1', unit: 'tsp' },
    ],
    instructions: [
      'Preheat oven to 425°F and pat the chicken dry.',
      'Rub butter, salt, pepper, garlic, and rosemary under and over the skin.',
      'Place lemon and garlic inside the cavity.',
      'Roast 55-65 minutes until the thickest part reaches 165°F.',
      'Rest 10 minutes before carving.',
    ],
  },
  'baked salmon': {
    category: 'Healthy',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    ingredients: [
      { name: 'salmon fillets', amount: '4', unit: '' },
      { name: 'olive oil', amount: '2', unit: 'tbsp' },
      { name: 'lemon', amount: '1', unit: '' },
      { name: 'garlic powder', amount: '1', unit: 'tsp' },
      { name: 'dill', amount: '1', unit: 'tsp' },
      { name: 'salt', amount: '0.75', unit: 'tsp' },
    ],
    instructions: [
      'Preheat oven to 400°F and line a baking sheet with foil.',
      'Brush salmon with olive oil and season with garlic, dill, and salt.',
      'Add lemon slices on top.',
      'Bake 12-15 minutes until the fish flakes easily and reaches 145°F.',
      'Serve with lemon and fresh herbs.',
    ],
  },
};

const KEYWORD_TEMPLATES: Array<{ keywords: string[]; template: string }> = [
  { keywords: ['pancake', 'french toast', 'waffle', 'omelet'], template: 'pancakes' },
  { keywords: ['soup', 'broth', 'chowder'], template: 'tomato soup' },
  { keywords: ['salad', 'greens'], template: 'caesar salad' },
  { keywords: ['chili'], template: 'chili' },
  { keywords: ['stir fry', 'stir-fry', 'noodles'], template: 'chicken stir fry' },
  { keywords: ['curry'], template: 'chicken curry' },
  { keywords: ['pasta', 'spaghetti', 'mac'], template: 'spaghetti carbonara' },
  { keywords: ['taco', 'burrito', 'quesadilla'], template: 'tacos' },
  { keywords: ['burger', 'hamburger', 'sandwich', 'grilled cheese'], template: 'hamburger' },
  { keywords: ['smoothie', 'shake'], template: 'smoothie' },
  { keywords: ['pizza'], template: 'pizza' },
  { keywords: ['mashed potato', 'potato'], template: 'mashed potatoes' },
  { keywords: ['bread', 'muffin', 'cake', 'cookie', 'brownie'], template: 'banana bread' },
  { keywords: ['chicken', 'turkey'], template: 'roast chicken' },
  { keywords: ['salmon', 'fish', 'shrimp', 'seafood'], template: 'baked salmon' },
];

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(value: string): string {
  return value
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function toRecipeInput(template: RecipeTemplate, requestedName: string): RecipeInput {
  const title = titleCase(requestedName);
  return {
    title,
    description: `A ${template.category.toLowerCase()} method for making ${requestedName}.`,
    category: template.category,
    prepTime: template.prepTime,
    cookTime: template.cookTime,
    servings: template.servings,
    ingredients: template.ingredients,
    instructions: template.instructions.map((text) => ({ text })),
    imageUri: null,
  };
}

export async function generateRecipeFromName(recipeName: string): Promise<RecipeInput> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const requestedName = recipeName.trim();
  const key = normalizeName(requestedName);
  const exactTemplate = RECIPE_TEMPLATES[key];
  if (exactTemplate) {
    return toRecipeInput(exactTemplate, requestedName);
  }

  const keywordMatch = KEYWORD_TEMPLATES.find((entry) =>
    entry.keywords.some((keyword) => key.includes(keyword))
  );
  const fallbackTemplate = keywordMatch
    ? RECIPE_TEMPLATES[keywordMatch.template]
    : RECIPE_TEMPLATES['chicken stir fry'];

  return toRecipeInput(fallbackTemplate, requestedName);
}
