import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractRecipeJson,
  normalizeRecipe,
  toGeminiMessages,
  RECIPE_CREATOR_SYSTEM_PROMPT,
} from '../services/recipeCreator.ts';

test('extracts a plain json object', () => {
  const json = '{"title":"Chicken Marsala","description":"A classic."}';
  assert.deepEqual(extractRecipeJson(json), { title: 'Chicken Marsala', description: 'A classic.' });
});

test('extracts json from markdown fences', () => {
  const text = 'Here you go:\n```json\n{"title":"X","description":"Y"}\n```\nEnjoy!';
  assert.deepEqual(extractRecipeJson(text), { title: 'X', description: 'Y' });
});

test('extracts json embedded in prose', () => {
  const text = 'Sure! {"title":"Baked chicken","description":"Over rice"} hope that helps';
  assert.deepEqual(extractRecipeJson(text), { title: 'Baked chicken', description: 'Over rice' });
});

test('returns null for non-json text', () => {
  assert.equal(extractRecipeJson('no json here'), null);
  assert.equal(extractRecipeJson(''), null);
  assert.equal(extractRecipeJson(null), null);
});

test('normalizeRecipe accepts a valid recipe', () => {
  const recipe = normalizeRecipe({
    title: 'Chicken Marsala',
    description: 'A classic Italian-American dish.',
    category: 'Dinner',
    tags: ['Dinner', 'Chicken'],
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    ingredients: [{ name: 'Chicken', amount: '2', unit: 'breasts' }],
    instructions: [{ text: 'Sear the chicken.' }],
  });

  assert.ok(recipe);
  assert.equal(recipe.title, 'Chicken Marsala');
  assert.equal(recipe.category, 'Dinner');
  assert.deepEqual(recipe.tags, ['Dinner', 'Chicken']);
  assert.equal(recipe.prepTime, 15);
  assert.equal(recipe.cookTime, 25);
  assert.equal(recipe.servings, 4);
  assert.equal(recipe.imageUri, null);
});

test('normalizeRecipe falls back on bad category and messy fields', () => {
  const recipe = normalizeRecipe({
    title: 'Mystery',
    description: 'Something',
    category: 'Not A Category',
    tags: [1, 'Vegan', null],
    prepTime: '10',
    cookTime: 'oops',
    servings: 0,
    ingredients: [{ name: 'Rice', amount: '1', unit: 'cup' }, { name: '' }],
    instructions: [{ text: 'Cook it.' }, 'Stir.'],
  });

  assert.ok(recipe);
  assert.equal(recipe.category, 'Quick & Easy');
  assert.deepEqual(recipe.tags, ['Vegan']);
  assert.equal(recipe.prepTime, 10);
  assert.equal(recipe.cookTime, 20);
  assert.equal(recipe.servings, 1);
  assert.equal(recipe.ingredients.length, 1);
  assert.equal(recipe.instructions.length, 2);
});

test('normalizeRecipe rejects unusable payloads', () => {
  assert.equal(normalizeRecipe(null), null);
  assert.equal(normalizeRecipe({}), null);
  assert.equal(normalizeRecipe({ title: 'No description' }), null);
  assert.equal(
    normalizeRecipe({ title: 'X', description: 'Y', ingredients: [], instructions: [] }),
    null
  );
});

test('toGeminiMessages maps roles straight through', () => {
  const messages = toGeminiMessages([
    { role: 'user', content: 'hi' },
    { role: 'model', content: '{"title":"X"}' },
  ]);

  assert.deepEqual(messages, [
    { role: 'user', content: 'hi' },
    { role: 'model', content: '{"title":"X"}' },
  ]);
});

test('system prompt requests json only and handles refinements', () => {
  assert.ok(RECIPE_CREATOR_SYSTEM_PROMPT.includes('JSON'));
  assert.ok(RECIPE_CREATOR_SYSTEM_PROMPT.includes('without curry'));
});
