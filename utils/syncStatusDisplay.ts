import type { SyncState } from '../services/syncStatus';

export type SyncTone = 'muted' | 'warning' | 'success' | 'error';

export function getSyncStatusDisplay(
  state: SyncState,
  hasRoom: boolean
): { label: string; tone: SyncTone } {
  if (!hasRoom) {
    return { label: 'Not connected', tone: 'muted' };
  }

  switch (state) {
    case 'syncing':
      return { label: 'Connecting…', tone: 'warning' };
    case 'connected':
      return { label: 'Connected', tone: 'success' };
    case 'offline':
      return { label: 'Offline', tone: 'warning' };
    case 'error':
      return { label: 'Sync issue', tone: 'error' };
    case 'idle':
    default:
      return { label: 'Not connected', tone: 'muted' };
  }
}
