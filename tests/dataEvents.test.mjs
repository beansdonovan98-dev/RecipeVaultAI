import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notifyDataChanged, subscribeToDataChanges } from '../services/dataEvents.ts';

test('data change listeners are notified and can unsubscribe', () => {
  let first = 0;
  let second = 0;
  const unsubscribeFirst = subscribeToDataChanges(() => {
    first += 1;
  });
  const unsubscribeSecond = subscribeToDataChanges(() => {
    second += 1;
  });

  notifyDataChanged();
  assert.equal(first, 1);
  assert.equal(second, 1);

  unsubscribeFirst();
  notifyDataChanged();
  assert.equal(first, 1);
  assert.equal(second, 2);

  unsubscribeSecond();
  notifyDataChanged();
  assert.equal(second, 2);
});

test('one failing listener does not stop the others', () => {
  const originalError = console.error;
  console.error = () => {};
  let called = 0;
  const unsubscribeBad = subscribeToDataChanges(() => {
    throw new Error('listener failed');
  });
  const unsubscribeGood = subscribeToDataChanges(() => {
    called += 1;
  });

  try {
    assert.doesNotThrow(() => notifyDataChanged());
    assert.equal(called, 1);
  } finally {
    unsubscribeBad();
    unsubscribeGood();
    console.error = originalError;
  }
});
