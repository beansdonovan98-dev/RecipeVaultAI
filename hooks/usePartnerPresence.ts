import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getPartnerAuthor, type AuthorId } from '@/constants/authors';
import type { RoomConfig } from '@/types/sync';
import { isRemoteConfigured, refreshPresence } from '@/services/remote';

const PRESENCE_REFRESH_MS = 30000;

export function usePartnerPresence(
  config: RoomConfig | null,
  member: AuthorId | null
): AuthorId | null {
  const [partner, setPartner] = useState<AuthorId | null>(null);
  const roomCode = config?.code ?? null;
  const roomId = config?.roomId ?? null;

  useEffect(() => {
    if (!roomCode || !roomId || !member || !isRemoteConfigured()) {
      setPartner(null);
      return;
    }

    let cancelled = false;
    let inFlight = false;

    const refresh = async () => {
      if (inFlight) {
        return;
      }
      inFlight = true;
      try {
        const activeMembers = await refreshPresence(roomCode, member);
        if (!cancelled) {
          const partnerId = getPartnerAuthor(member);
          setPartner(activeMembers.includes(partnerId) ? partnerId : null);
        }
      } catch {
        if (!cancelled) {
          setPartner(null);
        }
      } finally {
        inFlight = false;
      }
    };

    refresh();
    const timer = setInterval(refresh, PRESENCE_REFRESH_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });

    return () => {
      cancelled = true;
      clearInterval(timer);
      subscription.remove();
    };
  }, [roomCode, roomId, member]);

  return partner;
}
