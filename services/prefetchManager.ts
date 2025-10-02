import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_TTL_MS } from '@/services/dataCache';
import { prefetchDashboardAndArticles } from '@/services/dataPrefetch';

interface PrefetchContext {
  userId: number;
  token: string;
  siteId?: string;
}

interface PrefetchOptions {
  force?: boolean;
}

const PREFETCH_TIMESTAMP_KEY = '@ef-prefetch:last';

let lastPrefetchMemory = 0;
let ongoingPrefetch: Promise<boolean> | null = null;
type PrefetchListener = () => void;
const listeners = new Set<PrefetchListener>();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('Prefetch listener error:', error);
    }
  });
};

const readLastPrefetch = async () => {
  if (lastPrefetchMemory > 0) {
    return lastPrefetchMemory;
  }

  try {
    const stored = await AsyncStorage.getItem(PREFETCH_TIMESTAMP_KEY);
    const parsed = stored ? Number(stored) : 0;
    if (Number.isFinite(parsed) && parsed > 0) {
      lastPrefetchMemory = parsed;
      return parsed;
    }
  } catch (error) {
    console.error('Prefetch timestamp read error:', error);
  }

  return 0;
};

const writeLastPrefetch = async (timestamp: number) => {
  lastPrefetchMemory = timestamp;
  try {
    await AsyncStorage.setItem(PREFETCH_TIMESTAMP_KEY, String(timestamp));
  } catch (error) {
    console.error('Prefetch timestamp write error:', error);
  }
};

export const addPrefetchListener = (listener: PrefetchListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const maybePrefetch = async (
  context: PrefetchContext | null | undefined,
  options: PrefetchOptions = {}
): Promise<boolean> => {
  if (!context?.userId || !context?.token) {
    return false;
  }

  if (ongoingPrefetch) {
    return ongoingPrefetch;
  }

  const now = Date.now();
  const lastPrefetch = options.force ? 0 : await readLastPrefetch();
  const ttlElapsed = now - lastPrefetch;

  if (!options.force && lastPrefetch > 0 && ttlElapsed < CACHE_TTL_MS) {
    return false;
  }

  ongoingPrefetch = (async () => {
    try {
      await prefetchDashboardAndArticles({
        userId: context.userId,
        token: context.token,
        siteId: context.siteId,
      });
      await writeLastPrefetch(Date.now());
      notifyListeners();
      return true;
    } catch (error) {
      console.error('Prefetch error:', error);
      return false;
    } finally {
      ongoingPrefetch = null;
    }
  })();

  return ongoingPrefetch;
};

export const getLastPrefetchTime = async () => {
  return readLastPrefetch();
};

