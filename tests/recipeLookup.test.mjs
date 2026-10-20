import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRecipeFromName } from '../services/recipeLookup.ts';

test('recipe name lookup returns a complete recipe', async () => {
  const recipe = await generateRecipeFromName('Chicken stir fry');
  assert.equal(recipe.title, 'Chicken Stir Fry');
  assert.ok(recipe.ingredients.length > 0);
  assert.ok(recipe.instructions.length > 0);
  assert.equal(typeof recipe.prepTime, 'number');
  assert.equal(typeof recipe.cookTime, 'number');
});

test('recipe name lookup falls back to a usable recipe', async () => {
  const recipe = await generateRecipeFromName('Grandma’s mystery casserole');
  assert.ok(recipe.title.length > 0);
  assert.ok(recipe.ingredients.length > 0);
  assert.ok(recipe.instructions.length > 0);
});
