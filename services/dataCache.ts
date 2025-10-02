import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@ef-cache:';

export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface CacheLookupResult<T> {
  data: T | null;
  exists: boolean;
  isExpired: boolean;
  timestamp?: number;
}

const buildStorageKey = (key: string) => `${CACHE_PREFIX}${key}`;

export const dataCacheKeys = {
  siteMetrics: (siteId: string, period: string) => `site-metrics:${siteId}:${period}`,
  authorAnalytics: (userId: number, period: string) => `author-analytics:${userId}:${period}`,
  authorArticles: (userId: number) => `author-articles:${userId}`,
};

export async function getCachedData<T>(
  key: string,
  ttlMs: number = CACHE_TTL_MS
): Promise<CacheLookupResult<T>> {
  try {
    const stored = await AsyncStorage.getItem(buildStorageKey(key));
    if (!stored) {
      return { data: null, exists: false, isExpired: true };
    }

    const parsed = JSON.parse(stored) as { data: T; timestamp: number } | null;
    if (!parsed || typeof parsed.timestamp !== 'number') {
      return { data: null, exists: false, isExpired: true };
    }

    const age = Date.now() - parsed.timestamp;
    const isExpired = age > ttlMs;

    return {
      data: parsed.data,
      exists: true,
      isExpired,
      timestamp: parsed.timestamp,
    };
  } catch (error) {
    console.error('Cache read error:', error);
    return { data: null, exists: false, isExpired: true };
  }
}

export async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const payload = JSON.stringify({ data, timestamp: Date.now() });
    await AsyncStorage.setItem(buildStorageKey(key), payload);
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export async function clearCachedData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(buildStorageKey(key));
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

