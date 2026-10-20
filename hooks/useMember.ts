import { useCallback, useEffect, useState } from 'react';
import * as db from '@/db';
import type { AuthorId } from '@/constants/authors';
import { captureException } from '@/services/crashTracker';
import { subscribeToDataChanges } from '@/services/dataEvents';

export function useMember(): AuthorId | null {
  const [member, setMember] = useState<AuthorId | null>(null);

  const loadMember = useCallback(async () => {
    try {
      setMember(await db.getMember());
    } catch (error) {
      captureException(error, { source: 'useMember.load' });
    }
  }, []);

  useEffect(() => {
    loadMember();
    return subscribeToDataChanges(loadMember);
  }, [loadMember]);

  return member;
}
