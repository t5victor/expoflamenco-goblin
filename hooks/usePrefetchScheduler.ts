import { useEffect } from 'react';
import { AppState } from 'react-native';
import { maybePrefetch } from '@/services/prefetchManager';
import { CACHE_TTL_MS } from '@/services/dataCache';

interface PrefetchSchedulerContext {
  userId: number;
  token: string;
  siteId?: string;
}

export const usePrefetchScheduler = (context: PrefetchSchedulerContext | null | undefined) => {
  useEffect(() => {
    if (!context?.userId || !context?.token) {
      return;
    }

    let isMounted = true;

    const kickoff = async () => {
      await maybePrefetch(context, { force: true });
    };

    kickoff();

    const interval = setInterval(() => {
      if (!isMounted) {
        return;
      }
      maybePrefetch(context);
    }, CACHE_TTL_MS);

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        maybePrefetch(context);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [context?.siteId, context?.token, context?.userId]);
};

