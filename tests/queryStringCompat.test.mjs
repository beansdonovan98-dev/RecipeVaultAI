import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const queryString = require('query-string');
const { getPathFromState } = require('@react-navigation/core');

test('query-string exposes the stringify function Expo Router calls', () => {
  assert.equal(typeof queryString.stringify, 'function');
});

test('Expo Router import-star interop sees stringify', () => {
  function importStar(module) {
    if (module && module.__esModule) {
      return module;
    }
    const result = {};
    for (const key of Object.keys(module)) {
      result[key] = module[key];
    }
    result.default = module;
    return result;
  }

  const queryStringStar = importStar(require('query-string'));
  assert.equal(typeof queryStringStar.stringify, 'function');
});

test('recipe routes with params build a path without crashing', () => {
  const state = {
    stale: false,
    type: 'stack',
    key: 'stack',
    index: 0,
    routeNames: ['Home', 'Recipe'],
    routes: [{ name: 'Recipe', params: { id: '1' }, key: 'recipe-1' }],
  };
  const config = {
    screens: {
      Home: '',
      Recipe: 'recipe/:id',
    },
  };

  assert.equal(getPathFromState(state, config), '/recipe/1');
});
