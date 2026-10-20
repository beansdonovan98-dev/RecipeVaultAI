import * as db from '@/db';
import type { RecipeSyncRecord, RoomConfig } from '@/types/sync';
import { recordBreadcrumb } from './crashTracker';
import { notifyDataChanged } from './dataEvents';
import {
  createRemoteId,
  isRemoteImageUri,
  toRemoteRecipeInput,
} from './syncHelpers';
import {
  deleteRecipe as deleteRemoteRecipe,
  isRemoteConfigured,
  listRecipes,
  uploadPhoto,
  upsertRecipe,
} from './remote';
import { updateSyncStatus } from './syncStatus';

export interface SyncSummary {
  pushed: number;
  pulled: number;
  failed: number;
  skipped: boolean;
}

let syncInFlight: Promise<SyncSummary> | null = null;
let syncInFlightKey: string | null = null;

class RoomChangedError extends Error {
  constructor() {
    super('The shared room changed while syncing.');
    this.name = 'RoomChangedError';
  }
}

function isSameRoom(config: RoomConfig, current: RoomConfig | null): boolean {
  return (
    current !== null &&
    current.code === config.code &&
    current.roomId === config.roomId
  );
}

async function assertSameRoom(config: RoomConfig): Promise<void> {
  if (!isSameRoom(config, await db.getRoomConfig())) {
    throw new RoomChangedError();
  }
}

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
      /could not reach|network request failed|failed to fetch|timed out|aborted/i.test(
        error.message
      ))
  );
}

export async function syncRecipes(): Promise<SyncSummary> {
  const config = await db.getRoomConfig();
  const key = config ? `${config.code}:${config.roomId}` : null;

  if (!config) {
    updateSyncStatus({ state: 'idle', lastSyncedAt: null, message: null });
    return { pushed: 0, pulled: 0, failed: 0, skipped: true };
  }

  if (syncInFlight) {
    if (syncInFlightKey === key) {
      return syncInFlight;
    }
    try {
      await syncInFlight;
    } catch {
      // The next sync gets a fresh attempt.
    }
    return syncRecipes();
  }

  syncInFlightKey = key;
  updateSyncStatus({ state: 'syncing', message: null });
  syncInFlight = runSync()
    .then((summary) => {
      if (summary.skipped) {
        updateSyncStatus({ state: 'idle', message: null });
      } else {
        updateSyncStatus({
          state: 'connected',
          lastSyncedAt: Date.now(),
          message:
            summary.failed > 0
              ? `${summary.failed} item${summary.failed === 1 ? '' : 's'} waiting to sync`
              : null,
        });
      }
      return summary;
    })
    .catch((error: unknown) => {
      updateSyncStatus({
        state: isNetworkError(error) ? 'offline' : 'error',
        message: error instanceof Error ? error.message : 'Sync failed',
      });
      throw error;
    })
    .finally(() => {
      syncInFlight = null;
      syncInFlightKey = null;
    });
  return syncInFlight;
}

async function pushRecord(config: RoomConfig, record: RecipeSyncRecord): Promise<void> {
  const remoteId = record.remoteId ?? createRemoteId();
  if (!record.remoteId) {
    await db.assignRemoteId(record.id, remoteId);
  }
  await assertSameRoom(config);

  if (record.deleted) {
    await deleteRemoteRecipe(config.code, remoteId);
    await db.hardDeleteRecipe(record.id);
    return;
  }

  let imageUrl = record.imageUri;
  if (imageUrl && !isRemoteImageUri(imageUrl)) {
    imageUrl = await uploadPhoto(config.roomId, remoteId, imageUrl);
    await assertSameRoom(config);
    await db.setRecipeImage(record.id, imageUrl, record.revision);
  }

  await assertSameRoom(config);
  await upsertRecipe(config.code, toRemoteRecipeInput(record, remoteId, imageUrl));
  await db.markRecipeSynced(record.id, record.revision);
}

async function runSync(): Promise<SyncSummary> {
  if (!isRemoteConfigured()) {
    return { pushed: 0, pulled: 0, failed: 0, skipped: true };
  }

  const config = await db.getRoomConfig();
  if (!config) {
    return { pushed: 0, pulled: 0, failed: 0, skipped: true };
  }

  recordBreadcrumb('sync:started');
  const dirtyRecords = await db.getSyncRecords(true);
  let pushed = 0;
  let failed = 0;
  let roomChanged = false;

  for (const record of dirtyRecords) {
    try {
      await pushRecord(config, record);
      pushed += 1;
    } catch (error) {
      if (error instanceof RoomChangedError) {
        roomChanged = true;
        break;
      }
      failed += 1;
      console.warn('[SYNC] push failed', record.id, error);
      recordBreadcrumb(`sync:push-failed:${record.id}`);
    }
  }

  if (roomChanged) {
    return { pushed, pulled: 0, failed, skipped: true };
  }

  const latestConfig = await db.getRoomConfig();
  if (!isSameRoom(config, latestConfig)) {
    return { pushed, pulled: 0, failed, skipped: false };
  }

  const remoteRecipes = await listRecipes(config.code);
  if (!remoteRecipes) {
    throw new Error('The shared room returned an unexpected empty response.');
  }

  const roomAfterFetch = await db.getRoomConfig();
  if (!isSameRoom(config, roomAfterFetch)) {
    return { pushed, pulled: 0, failed, skipped: false };
  }

  for (const remoteRecipe of remoteRecipes) {
    await db.upsertRemoteRecipe(remoteRecipe);
  }

  if (!isSameRoom(config, await db.getRoomConfig())) {
    return { pushed, pulled: 0, failed, skipped: false };
  }

  await db.deleteSyncedRecipesMissingFromRemote(remoteRecipes.map((recipe) => recipe.id));
  notifyDataChanged();
  recordBreadcrumb(`sync:finished:pushed=${pushed}:pulled=${remoteRecipes.length}:failed=${failed}`);

  return { pushed, pulled: remoteRecipes.length, failed, skipped: false };
}
