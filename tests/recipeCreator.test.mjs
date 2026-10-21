import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCreatorSystemPrompt,
  ensureThirdPersonReply,
  extractRecipeJson,
  normalizeCreatorReply,
  normalizeRecipe,
  toGeminiMessages,
} from '../services/recipeCreator.ts';
import { rankGeminiModels } from '../services/gemini.ts';
import {
  ASSISTANT_PERSONAS,
  DEFAULT_ASSISTANT_NAME,
  DEFAULT_ASSISTANT_PERSONA_ID,
  getAssistantPersona,
  isAssistantPersonaId,
  normalizeAssistantName,
} from '../constants/assistant.ts';

const VALID_RECIPE_JSON = JSON.stringify({
  reply: 'BMO is very excited about this one!',
  title: 'Baked Chicken Over Rice',
  description: 'A cozy one-pan dinner.',
  category: 'Dinner',
  tags: ['Dinner', 'Chicken'],
  prepTime: 10,
  cookTime: 35,
  servings: 4,
  ingredients: [{ name: 'Chicken thighs', amount: '4', unit: 'pieces' }],
  instructions: [{ text: 'Heat the oven to 200C.' }],
});

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

test('normalizeCreatorReply keeps the in-character line and the recipe', () => {
  const result = normalizeCreatorReply(extractRecipeJson(VALID_RECIPE_JSON));

  assert.ok(result);
  assert.equal(result.reply, 'BMO is very excited about this one!');
  assert.equal(result.recipe.title, 'Baked Chicken Over Rice');
  assert.equal(result.recipe.cookTime, 35);
});

test('normalizeCreatorReply fills in a third-person line when the model omits one', () => {
  const result = normalizeCreatorReply({
    title: 'Toast',
    description: 'Bread, toasted.',
    ingredients: [{ name: 'Bread', amount: '2', unit: 'slices' }],
    instructions: [{ text: 'Toast the bread.' }],
  });

  assert.ok(result);
  assert.equal(result.reply, 'BMO thinks this one looks delicious!');
});

test('ensureThirdPersonReply always names the assistant', () => {
  assert.equal(ensureThirdPersonReply('', 'BMO'), 'BMO thinks this one looks delicious!');
  assert.equal(ensureThirdPersonReply('   ', 'Nana'), 'Nana thinks this one looks delicious!');
  assert.equal(ensureThirdPersonReply('BMO loves this soup!', 'BMO'), 'BMO loves this soup!');
  assert.equal(
    ensureThirdPersonReply('This soup is great!', 'BMO'),
    'BMO says: This soup is great!'
  );
  assert.equal(
    ensureThirdPersonReply('BMO is ready!', 'BMO'),
    'BMO is ready!'
  );
});

test('normalizeCreatorReply rejects payloads without a usable recipe', () => {
  assert.equal(normalizeCreatorReply(null), null);
  assert.equal(normalizeCreatorReply({ reply: 'hello there' }), null);
});

test('buildCreatorSystemPrompt carries the name, personality, and json contract', () => {
  const prompt = buildCreatorSystemPrompt({
    name: 'BMO',
    instructions: 'Speak like a cheerful little robot.',
  });

  assert.ok(prompt.includes('BMO'));
  assert.ok(prompt.includes('Speak like a cheerful little robot.'));
  assert.ok(prompt.includes('"reply"'));
  assert.ok(prompt.includes('"ingredients"'));
  assert.ok(prompt.includes('without curry'));
  assert.ok(prompt.includes('JSON'));
});

test('buildCreatorSystemPrompt falls back to the default name', () => {
  const prompt = buildCreatorSystemPrompt({ name: '   ', instructions: '' });
  assert.ok(prompt.includes(DEFAULT_ASSISTANT_NAME));
  assert.ok(prompt.includes('Be warm, clear, and encouraging.'));
});

test('persona presets include a default and validate ids', () => {
  assert.equal(DEFAULT_ASSISTANT_PERSONA_ID, 'bmo');
  assert.equal(getAssistantPersona(DEFAULT_ASSISTANT_PERSONA_ID).label, 'BMO');
  assert.ok(ASSISTANT_PERSONAS.some((persona) => persona.id === 'bmo'));
  assert.ok(ASSISTANT_PERSONAS.some((persona) => persona.id === 'sous-chef'));
  assert.equal(getAssistantPersona('nope').id, DEFAULT_ASSISTANT_PERSONA_ID);
  assert.equal(isAssistantPersonaId('bmo'), true);
  assert.equal(isAssistantPersonaId('wizard'), false);
  assert.equal(isAssistantPersonaId(null), false);
});

test('normalizeAssistantName cleans input and falls back when empty', () => {
  assert.equal(normalizeAssistantName('  Chef   Boy '), 'Chef Boy');
  assert.equal(normalizeAssistantName(''), DEFAULT_ASSISTANT_NAME);
  assert.equal(normalizeAssistantName(null), DEFAULT_ASSISTANT_NAME);
  assert.equal(normalizeAssistantName('   ', 'Nana'), 'Nana');
  assert.equal(normalizeAssistantName('x'.repeat(40)).length, 24);
});

test('rankGeminiModels prefers newest general-purpose flash models', () => {
  const ranked = rankGeminiModels([
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.8-flash-image',
    'embedding-001',
    'gemini-2.5-pro',
    'gemini-3.8-flash-preview',
  ]);

  assert.deepEqual(ranked, [
    'gemini-3.8-flash',
    'gemini-3.8-flash-preview',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
  ]);
});

test('rankGeminiModels handles an empty or unhelpful model list', () => {
  assert.deepEqual(rankGeminiModels([]), []);
  assert.deepEqual(rankGeminiModels(['embedding-001', 'gemini-2.5-pro']), []);
});
