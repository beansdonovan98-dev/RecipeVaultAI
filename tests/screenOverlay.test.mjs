import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  closeScreenOverlay,
  getScreenOverlay,
  openScreenOverlay,
  subscribeToScreenOverlay,
} from '../services/screenOverlay.ts';

test('screen overlay store handles open, close, replay, and unsubscribe', () => {
  closeScreenOverlay();
  assert.equal(getScreenOverlay(), null);

  const seen = [];
  const unsubscribeFirst = subscribeToScreenOverlay((screen) => seen.push(screen));

  assert.deepEqual(seen, [null]);
  openScreenOverlay('add');
  assert.equal(getScreenOverlay(), 'add');
  assert.deepEqual(seen, [null, 'add']);

  openScreenOverlay('ai-generate');
  assert.equal(getScreenOverlay(), 'ai-generate');
  assert.deepEqual(seen, [null, 'add', 'ai-generate']);

  closeScreenOverlay();
  assert.equal(getScreenOverlay(), null);
  assert.deepEqual(seen, [null, 'add', 'ai-generate', null]);

  unsubscribeFirst();
  closeScreenOverlay();
  assert.equal(getScreenOverlay(), null);
});

test('a new subscriber receives the current overlay and stale listeners are ignored', () => {
  closeScreenOverlay();
  openScreenOverlay('ai-substitute');

  const first = [];
  const second = [];
  const unsubscribeFirst = subscribeToScreenOverlay((screen) => first.push(screen));
  const unsubscribeSecond = subscribeToScreenOverlay((screen) => second.push(screen));

  assert.deepEqual(first, ['ai-substitute']);
  assert.deepEqual(second, ['ai-substitute']);

  unsubscribeFirst();
  openScreenOverlay('add');

  assert.deepEqual(first, ['ai-substitute']);
  assert.deepEqual(second, ['ai-substitute', 'add']);

  unsubscribeSecond();
  assert.doesNotThrow(() => openScreenOverlay('ai-generate'));
  assert.doesNotThrow(() => closeScreenOverlay());
  assert.equal(getScreenOverlay(), null);
});
