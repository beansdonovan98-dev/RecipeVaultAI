import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFingerprint,
  diagnoseCrash,
  formatCrashTime,
  getErrorMessage,
  getErrorName,
  getErrorStack,
  getTopStackFrame,
} from '../utils/crashDiagnostics.ts';

test('extracts readable details from error objects', () => {
  const error = new TypeError('Cannot read properties of undefined (reading id)');

  assert.equal(getErrorMessage(error), 'Cannot read properties of undefined (reading id)');
  assert.equal(getErrorName(error), 'TypeError');
  assert.match(getErrorStack(error), /TypeError/);
});

test('handles unprintable thrown values without throwing', () => {
  const unprintable = {
    toString() {
      throw new Error('cannot stringify');
    },
  };

  assert.equal(getErrorMessage(unprintable), 'Unprintable error');
  assert.equal(getErrorStack(unprintable), 'Unprintable error');
  assert.equal(getErrorMessage(42), '42');
});

test('fingerprints identical crashes together and different crashes apart', () => {
  const base = {
    source: 'react-error-boundary',
    name: 'TypeError',
    message: 'Cannot read properties of undefined (reading id)',
    stack: 'TypeError: Cannot read properties of undefined\n    at RecipeCard (components/RecipeCard.tsx:42:11)\n    at renderRoot',
  };

  const first = createFingerprint(base);
  const second = createFingerprint({ ...base, message: 'Cannot read properties of undefined (reading id)' });
  const differentFrame = createFingerprint({
    ...base,
    stack: 'TypeError: Cannot read properties of undefined\n    at HomeScreen (app/index.tsx:20:5)',
  });
  const differentSource = createFingerprint({ ...base, source: 'global-error' });

  assert.equal(first, second);
  assert.notEqual(first, differentFrame);
  assert.notEqual(first, differentSource);
});

test('fingerprint normalizes changing numbers in messages', () => {
  const a = createFingerprint({
    source: 'global-error',
    name: 'Error',
    message: 'Recipe 12 not found',
    stack: 'Error: Recipe 12 not found\n    at load (db/index.ts:10:1)',
  });
  const b = createFingerprint({
    source: 'global-error',
    name: 'Error',
    message: 'Recipe 99 not found',
    stack: 'Error: Recipe 99 not found\n    at load (db/index.ts:10:1)',
  });

  assert.equal(a, b);
});

test('gets the top app stack frame without line numbers', () => {
  assert.equal(
    getTopStackFrame('Error: boom\n    at doThing (C:\\app\\src\\file.ts:12:4)\n    at other'),
    'doThing'
  );
  assert.equal(getTopStackFrame(null), 'no-stack');
});

test('diagnoses database schema crashes', () => {
  const diagnosis = diagnoseCrash('no such table: recipes');
  assert.match(diagnosis.likelyCause, /schema/i);
  assert.match(diagnosis.suggestedFix, /migration/i);
});

test('diagnoses null property access crashes', () => {
  const diagnosis = diagnoseCrash("Cannot read properties of null (reading 'title')");
  assert.match(diagnosis.likelyCause, /null or undefined/i);
  assert.match(diagnosis.suggestedFix, /guard/i);
});

test('diagnoses unhandled promise rejections with network failures', () => {
  const diagnosis = diagnoseCrash('Network request failed');
  assert.match(diagnosis.likelyCause, /network/i);
  assert.match(diagnosis.suggestedFix, /retry/i);
});

test('diagnoses update loops', () => {
  const diagnosis = diagnoseCrash('Maximum update depth exceeded');
  assert.match(diagnosis.likelyCause, /loop/i);
  assert.match(diagnosis.suggestedFix, /effect/i);
});

test('falls back to a useful generic diagnosis', () => {
  const diagnosis = diagnoseCrash('Something unusual happened');
  assert.match(diagnosis.likelyCause, /did not recognize/i);
  assert.match(diagnosis.suggestedFix, /stack/i);
});

test('formats valid times and leaves invalid times untouched', () => {
  assert.equal(formatCrashTime('not-a-date'), 'not-a-date');
  assert.notEqual(formatCrashTime('2026-10-19T12:00:00.000Z'), '2026-10-19T12:00:00.000Z');
});
