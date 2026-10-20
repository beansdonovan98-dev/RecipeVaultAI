export type SyncState = 'idle' | 'syncing' | 'connected' | 'offline' | 'error';

export interface SyncStatus {
  state: SyncState;
  lastSyncedAt: number | null;
  message: string | null;
}

type SyncStatusListener = (status: SyncStatus) => void;

let currentStatus: SyncStatus = {
  state: 'idle',
  lastSyncedAt: null,
  message: null,
};

const listeners = new Set<SyncStatusListener>();

export function getSyncStatus(): SyncStatus {
  return currentStatus;
}

export function updateSyncStatus(patch: Partial<SyncStatus>): void {
  currentStatus = { ...currentStatus, ...patch };
  listeners.forEach((listener) => {
    try {
      listener(currentStatus);
    } catch (error) {
      console.error('[SYNC] status listener failed', error);
    }
  });
}

export function subscribeToSyncStatus(listener: SyncStatusListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
