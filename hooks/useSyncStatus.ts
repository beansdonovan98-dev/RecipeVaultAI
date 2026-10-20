import { useSyncExternalStore } from 'react';
import {
  getSyncStatus,
  subscribeToSyncStatus,
  type SyncStatus,
} from '@/services/syncStatus';

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeToSyncStatus, getSyncStatus, getSyncStatus);
}
