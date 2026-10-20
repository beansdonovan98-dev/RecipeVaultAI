import { useCallback, useEffect, useState } from 'react';
import * as db from '@/db';
import type { RoomConfig } from '@/types/sync';
import { captureException } from '@/services/crashTracker';
import { subscribeToDataChanges } from '@/services/dataEvents';

export function useRoomConfig() {
  const [config, setConfig] = useState<RoomConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    try {
      const next = await db.getRoomConfig();
      setConfig(next);
    } catch (error) {
      captureException(error, { source: 'useRoomConfig.loadConfig' });
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    return subscribeToDataChanges(loadConfig);
  }, [loadConfig]);

  return { config, loading, reload: loadConfig };
}
