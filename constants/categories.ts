import { Category } from '@/types/recipe';

export interface CategoryInfo {
  name: Category;
  icon: string;
  color: string;
}

export const CATEGORY_META: Record<Category, CategoryInfo> = {
  Breakfast: { name: 'Breakfast', icon: 'sunny', color: '#D69E2E' },
  Lunch: { name: 'Lunch', icon: 'partly-sunny', color: '#38A169' },
  Dinner: { name: 'Dinner', icon: 'moon', color: '#1B2A4A' },
  Appetizer: { name: 'Appetizer', icon: 'restaurant', color: '#8B6F47' },
  Dessert: { name: 'Dessert', icon: 'ice-cream', color: '#E53E3E' },
  Snack: { name: 'Snack', icon: 'fast-food', color: '#DD6B20' },
  Drink: { name: 'Drink', icon: 'wine', color: '#3182CE' },
  Salad: { name: 'Salad', icon: 'leaf', color: '#38A169' },
  Soup: { name: 'Soup', icon: 'flame', color: '#DD6B20' },
  Baking: { name: 'Baking', icon: 'pizza', color: '#D69E2E' },
  Vegetarian: { name: 'Vegetarian', icon: 'nutrition', color: '#38A169' },
  Vegan: { name: 'Vegan', icon: 'leaf', color: '#2F855A' },
  'Gluten-Free': { name: 'Gluten-Free', icon: 'checkmark-circle', color: '#3182CE' },
  'Quick & Easy': { name: 'Quick & Easy', icon: 'flash', color: '#D69E2E' },
  Healthy: { name: 'Healthy', icon: 'heart', color: '#E53E3E' },
  'Comfort Food': { name: 'Comfort Food', icon: 'home', color: '#8B6F47' },
};

export function getCategoryInfo(category: Category): CategoryInfo {
  return CATEGORY_META[category] || { name: category, icon: 'restaurant', color: '#718096' };
}
