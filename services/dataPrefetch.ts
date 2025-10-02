import { fetchSiteData } from '@/services/api';
import { authorAnalyticsService } from '@/services/authorAnalytics';
import { CACHE_TTL_MS, dataCacheKeys, getCachedData, setCachedData } from '@/services/dataCache';
import { DashboardTimeFilter, DASHBOARD_TIME_FILTERS, getDateRangeFromTimeFilter } from '@/utils/timeFilters';

interface PrefetchContext {
  userId: number;
  token: string;
  siteId?: string;
}

const DEFAULT_SITE_ID = 'com';

let ongoingPrefetch: Promise<void> | null = null;

const shouldRefetch = (exists: boolean, isExpired: boolean) => !exists || isExpired;

async function prefetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  predicate?: (data: T) => boolean
): Promise<void> {
  try {
    const cached = await getCachedData<T>(key, CACHE_TTL_MS);
    const needsFetch = shouldRefetch(cached.exists, cached.isExpired);

    if (!needsFetch) {
      return;
    }

    const data = await fetcher();
    if (!predicate || predicate(data)) {
      await setCachedData(key, data);
    }
  } catch (error) {
    console.error('Prefetch error:', key, error);
  }
}

export async function prefetchDashboardAndArticles(
  context: PrefetchContext
): Promise<void> {
  if (!context?.userId || !context?.token) {
    return;
  }

  if (ongoingPrefetch) {
    return ongoingPrefetch;
  }

  const siteId = context.siteId ?? DEFAULT_SITE_ID;
  const { userId, token } = context;

  ongoingPrefetch = (async () => {
    const tasks: Array<Promise<void>> = [];

    const periods: DashboardTimeFilter[] = [...DASHBOARD_TIME_FILTERS];

    periods.forEach((period) => {
      const metricsKey = dataCacheKeys.siteMetrics(siteId, period);
      tasks.push(
        prefetchWithCache(metricsKey, () => fetchSiteData(siteId, period), (data) => !data?.isError)
      );

      const authorKey = dataCacheKeys.authorAnalytics(userId, period);
      tasks.push(
        prefetchWithCache(authorKey, () => {
          const dateRange = getDateRangeFromTimeFilter(period);
          return authorAnalyticsService.getAuthorAnalytics(userId, period, token, dateRange);
        })
      );
    });

    const articlesKey = dataCacheKeys.authorArticles(userId);
    tasks.push(
      prefetchWithCache(articlesKey, () =>
        authorAnalyticsService.getAuthorPostsWithAnalytics(userId, token)
      )
    );

    await Promise.all(tasks);
  })().finally(() => {
    ongoingPrefetch = null;
  });

  return ongoingPrefetch;
}

