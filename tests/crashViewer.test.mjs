import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestCrashViewer, subscribeToCrashViewer } from '../services/crashViewer.ts';

test('opens the crash viewer through the shared listener', () => {
  let opened = 0;
  const unsubscribe = subscribeToCrashViewer(() => {
    opened += 1;
  });

  requestCrashViewer();
  assert.equal(opened, 1);

  unsubscribe();
  requestCrashViewer();
  assert.equal(opened, 1);
});

test('requesting the crash viewer without a listener never throws', () => {
  assert.doesNotThrow(() => requestCrashViewer());
});
