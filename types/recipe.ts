export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface Instruction {
  id: string;
  step: number;
  text: string;
  tip?: string;
}

export interface Recipe {
  id: number;
  remoteId: string | null;
  title: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  imageUri: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeInput {
  title: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Omit<Ingredient, 'id'>[];
  instructions: Omit<Instruction, 'id' | 'step'>[];
  imageUri: string | null;
}

export type Category =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Appetizer'
  | 'Dessert'
  | 'Snack'
  | 'Drink'
  | 'Salad'
  | 'Soup'
  | 'Baking'
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Quick & Easy'
  | 'Healthy'
  | 'Comfort Food';

export const ALL_CATEGORIES: Category[] = [
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
