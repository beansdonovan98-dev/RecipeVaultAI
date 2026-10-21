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

test('cookies and chocolate chip cookies are different recipes', async () => {
  const cookies = await generateRecipeFromName('cookies');
  const chocolateChip = await generateRecipeFromName('chocolate chip cookies');

  assert.equal(cookies.title, 'Cookies');
  assert.equal(chocolateChip.title, 'Chocolate Chip Cookies');
  assert.notDeepEqual(
    cookies.ingredients.map((ingredient) => ingredient.name),
    chocolateChip.ingredients.map((ingredient) => ingredient.name)
  );
  assert.ok(chocolateChip.ingredients.some((ingredient) => ingredient.name.includes('chocolate')));
  assert.ok(cookies.ingredients.every((ingredient) => !ingredient.name.includes('chocolate')));
});

test('specific cookie variants do not collapse into one recipe', async () => {
  const sugar = await generateRecipeFromName('sugar cookies');
  const oatmeal = await generateRecipeFromName('oatmeal cookies');
  const peanutButter = await generateRecipeFromName('peanut butter cookies');
  const snickerdoodle = await generateRecipeFromName('snickerdoodles');

  const ingredientSets = [sugar, oatmeal, peanutButter, snickerdoodle].map((recipe) =>
    recipe.ingredients.map((ingredient) => ingredient.name).join('|')
  );

  assert.equal(new Set(ingredientSets).size, ingredientSets.length);
});
