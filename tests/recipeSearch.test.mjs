import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSearchTerms,
  mapCategory,
  mealToRecipe,
  parseMeasure,
  splitInstructions,
} from '../services/recipeSearch.ts';

const MEAL = {
  idMeal: '52795',
  strMeal: 'Chicken Handi',
  strCategory: 'Chicken',
  strArea: 'India',
  strMealThumb: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
  strInstructions: '1. Brown the chicken.\r\n2. Add spices and simmer until tender.\nServe hot.',
  strIngredient1: 'Chicken',
  strMeasure1: '1.2 kg',
  strIngredient2: 'Onion',
  strMeasure2: '2 large',
  strIngredient3: '',
  strMeasure3: '',
  strIngredient4: 'Cumin',
  strMeasure4: 'to taste',
};

test('meal maps to a complete RecipeInput', () => {
  const recipe = mealToRecipe(MEAL);

  assert.equal(recipe.title, 'Chicken Handi');
  assert.equal(recipe.category, 'Dinner');
  assert.deepEqual(recipe.tags, ['Dinner']);
  assert.equal(typeof recipe.prepTime, 'number');
  assert.equal(typeof recipe.cookTime, 'number');
  assert.ok(recipe.servings > 0);
  assert.equal(recipe.imageUri, MEAL.strMealThumb);
  assert.ok(recipe.description.toLowerCase().includes('chicken'));
  assert.ok(recipe.description.includes('India'));
  assert.ok(recipe.ingredients.length > 0);
  assert.ok(recipe.instructions.length > 0);
});

test('empty ingredient slots are skipped', () => {
  const recipe = mealToRecipe(MEAL);
  const names = recipe.ingredients.map((ingredient) => ingredient.name);

  assert.deepEqual(names, ['Chicken', 'Onion', 'Cumin']);
  assert.ok(!names.includes(''));
});

test('measure strings split into amount and unit', () => {
  assert.deepEqual(parseMeasure('1.2 kg'), { amount: '1.2', unit: 'kg' });
  assert.deepEqual(parseMeasure('2 large'), { amount: '2', unit: 'large' });
  assert.deepEqual(parseMeasure('to taste'), { amount: 'to taste', unit: '' });
  assert.deepEqual(parseMeasure('1 1/2 cups'), { amount: '1 1/2', unit: 'cups' });
  assert.deepEqual(parseMeasure(''), { amount: '', unit: '' });
});

test('instructions split into steps and drop numbering', () => {
  const steps = splitInstructions(
    '1. Brown the chicken.\r\n2. Add spices and simmer until tender.\nServe hot.'
  );

  assert.equal(steps.length, 3);
  assert.equal(steps[0], 'Brown the chicken.');
  assert.equal(steps[1], 'Add spices and simmer until tender.');
  assert.equal(steps[2], 'Serve hot.');
  assert.ok(steps.every((step) => !/^\d+\./.test(step)));
});

test('paragraph instructions split into sentence steps', () => {
  const steps = splitInstructions(
    'Preheat the oven to 375°F. Mix the dry ingredients together. Bake until golden brown.'
  );

  assert.ok(steps.length >= 2);
  assert.ok(steps.join(' ').includes('Preheat the oven'));
});

test('unknown categories fall back to Dinner', () => {
  assert.equal(mapCategory('Chicken'), 'Dinner');
  assert.equal(mapCategory('Dessert'), 'Dessert');
  assert.equal(mapCategory('Vegan'), 'Vegan');
  assert.equal(mapCategory('Something Weird'), 'Dinner');
  assert.equal(mapCategory(null), 'Dinner');
});

test('search terms drop stop words and short words', () => {
  assert.deepEqual(buildSearchTerms('baked chicken and rice'), ['baked', 'chicken', 'rice']);
  assert.deepEqual(buildSearchTerms('the best easy recipe'), []);
  assert.deepEqual(buildSearchTerms('  Chicken   Handi  '), ['chicken', 'handi']);
  assert.deepEqual(buildSearchTerms('ab cd'), []);
  assert.deepEqual(buildSearchTerms(''), []);
});
