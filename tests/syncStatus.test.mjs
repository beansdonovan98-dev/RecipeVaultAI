import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSyncStatus,
  subscribeToSyncStatus,
  updateSyncStatus,
} from '../services/syncStatus.ts';
import { getSyncStatusDisplay } from '../utils/syncStatusDisplay.ts';

test('sync status notifies subscribers and stops after unsubscribe', () => {
  updateSyncStatus({ state: 'idle', lastSyncedAt: null, message: null });

  const states = [];
  const unsubscribe = subscribeToSyncStatus((status) => {
    states.push(status.state);
  });

  updateSyncStatus({ state: 'syncing' });
  updateSyncStatus({ state: 'connected', lastSyncedAt: 1234, message: null });

  assert.deepEqual(states, ['syncing', 'connected']);
  assert.equal(getSyncStatus().lastSyncedAt, 1234);

  unsubscribe();
  updateSyncStatus({ state: 'offline' });
  assert.deepEqual(states, ['syncing', 'connected']);
});

test('connection labels reflect room and sync state', () => {
  assert.equal(getSyncStatusDisplay('connected', false).label, 'Not connected');
  assert.equal(getSyncStatusDisplay('connected', false).tone, 'muted');
  assert.equal(getSyncStatusDisplay('idle', true).label, 'Not connected');
  assert.equal(getSyncStatusDisplay('syncing', true).label, 'Connecting…');
  assert.equal(getSyncStatusDisplay('syncing', true).tone, 'warning');
  assert.equal(getSyncStatusDisplay('connected', true).label, 'Connected');
  assert.equal(getSyncStatusDisplay('connected', true).tone, 'success');
  assert.equal(getSyncStatusDisplay('offline', true).label, 'Offline');
  assert.equal(getSyncStatusDisplay('error', true).label, 'Sync issue');
  assert.equal(getSyncStatusDisplay('error', true).tone, 'error');
});
