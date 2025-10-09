import { authorAnalyticsService, type AuthorAnalytics } from '@/services/authorAnalytics';
import type { SiteKey } from '@/services/apiUsers';
import { getDateRangeFromTimeFilter, type DashboardTimeFilter } from '@/utils/timeFilters';

const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_SITE: SiteKey = 'revista';
const DEFAULT_ROLES = ['author', 'contributor', 'editor'];

const BASE_URLS: Record<SiteKey, string> = {
  root: 'https://expoflamenco.com',
  revista: 'https://expoflamenco.com/revista',
  academia: 'https://expoflamenco.com/academia',
  espacio: 'https://expoflamenco.com/espacio',
  agenda: 'https://expoflamenco.com/agenda',
  comunidad: 'https://expoflamenco.com/comunidad',
  podcast: 'https://expoflamenco.com/podcast',
};

interface WpUserResponse {
  id: number;
  name: string;
  slug: string;
  email?: string;
  roles?: string[];
  description?: string;
  link?: string;
  url?: string;
  registered_date?: string;
  avatar_urls?: Record<string, string>;
  simple_local_avatar?: {
    full?: string;
    [key: string]: unknown;
  };
}

export interface AdminUserProfile {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  roles: string[];
  description: string | null;
  link: string | null;
  url: string | null;
  avatar: string | null;
  registeredAt: string | null;
  siteId: SiteKey;
}

export interface AdminAuthorInsights {
  profile: AdminUserProfile;
  analytics: AuthorAnalytics | null;
  error?: string;
}

export interface AdminPostLeaderboardEntry {
  postId: number;
  postTitle: string;
  views: number;
  engagement: number;
  postSlug: string;
  link: string;
  author: AdminUserProfile;
}

export interface AdminDashboardSummary {
  generatedAt: string;
  siteId: SiteKey;
  timePeriod: DashboardTimeFilter;
  totals: {
    authorsWithData: number;
    totalAuthors: number;
    totalViews: number;
    totalPosts: number;
    avgViewsPerAuthor: number;
    avgViewsPerPost: number;
    avgPostsPerAuthor: number;
  };
  topAuthors: AdminAuthorInsights[];
  topPosts: AdminPostLeaderboardEntry[];
  authors: AdminAuthorInsights[];
  errors: Array<{ userId: number; reason: string }>;
}

const ADMIN_ROLE_KEYS = new Set(['administrator', 'super_admin', 'super admin']);

const sanitizeRoles = (roles?: string[]): string[] =>
  Array.isArray(roles) ? roles.filter((role) => typeof role === 'string') : [];

const isAdminRole = (roles?: string[]): boolean =>
  sanitizeRoles(roles).some((role) => ADMIN_ROLE_KEYS.has(role.toLowerCase()));

const extractAvatar = (user: WpUserResponse): string | null => {
  const avatars = user.avatar_urls ?? {};
  const fromAvatarUrls = avatars['96'] || avatars['72'] || avatars['48'] || avatars['24'] || null;

  const simple = user.simple_local_avatar ?? {};
  const simpleFull = typeof simple['96'] === 'string' ? (simple['96'] as string) : undefined;
  const fromSimple = typeof simple.full === 'string' ? simple.full : simpleFull;

  return fromAvatarUrls || (fromSimple ?? null);
};

const stripHtml = (value: string | undefined | null): string => {
  if (!value) return '';
  return value.replace(/<[^>]*>?/g, '').trim();
};

interface FetchJsonOptions {
  method?: 'GET' | 'POST' | 'HEAD';
  body?: unknown;
  token: string;
  siteId: SiteKey;
  path: string;
  timeoutMs?: number;
}

const fetchJson = async <T>({
  method = 'GET',
  body,
  token,
  siteId,
  path,
  timeoutMs = REQUEST_TIMEOUT_MS,
}: FetchJsonOptions): Promise<{ data: T; headers: Headers }> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URLS[siteId]}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let payload: T | undefined;

    if (text) {
      try {
        payload = JSON.parse(text) as T;
      } catch (parseError) {
        throw new Error(
          `Failed to parse response from ${path}: ${(parseError as Error).message}`
        );
      }
    }

    if (!response.ok) {
      const message =
        (payload as any)?.message ||
        (payload as any)?.error ||
        `HTTP ${response.status} while requesting ${path}`;
      throw new Error(message);
    }

    return { data: payload as T, headers: response.headers };
  } finally {
    clearTimeout(timeout);
  }
};

interface FetchAdminAuthorsOptions {
  token: string;
  siteId?: SiteKey;
  roles?: string[];
  perPage?: number;
}

export const fetchAdminAuthorProfiles = async ({
  token,
  siteId = DEFAULT_SITE,
  roles = DEFAULT_ROLES,
  perPage = 100,
}: FetchAdminAuthorsOptions): Promise<AdminUserProfile[]> => {
  const normalizedRoles = roles.filter(Boolean);
  const constrainedPerPage = Math.max(1, Math.min(perPage, 100));
  const authors: AdminUserProfile[] = [];

  let page = 1;
  while (true) {
    const params = new URLSearchParams({
      context: 'edit',
      per_page: String(constrainedPerPage),
      page: String(page),
      orderby: 'name',
      order: 'asc',
    });

    if (normalizedRoles.length > 0) {
      params.set('roles', normalizedRoles.join(','));
    }

    const { data } = await fetchJson<WpUserResponse[]>({
      token,
      siteId,
      path: `/wp-json/wp/v2/users?${params.toString()}`,
    });

    if (!Array.isArray(data)) {
      break;
    }

    data.forEach((user) => {
      const profile: AdminUserProfile = {
        id: user.id,
        name: user.name,
        slug: user.slug,
        email: user.email ?? null,
        roles: sanitizeRoles(user.roles),
        description: user.description ?? null,
        link: user.link ?? null,
        url: user.url ?? null,
        avatar: extractAvatar(user),
        registeredAt: user.registered_date ?? null,
        siteId,
      };
      authors.push(profile);
    });

    if (data.length < constrainedPerPage) {
      break;
    }

    page += 1;
  }

  return authors;
};

interface FetchAdminAnalyticsOptions {
  token: string;
  siteId?: SiteKey;
  timePeriod: DashboardTimeFilter;
  roles?: string[];
  concurrency?: number;
}

const chunkItems = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const buildPostLeaderboard = (
  authorEntries: AdminAuthorInsights[],
  limit = 20
): AdminPostLeaderboardEntry[] => {
  const leaderboard: AdminPostLeaderboardEntry[] = [];

  authorEntries.forEach(({ analytics, profile }) => {
    if (!analytics) return;

    analytics.topPosts.forEach((entry) => {
      leaderboard.push({
        postId: entry.post.id,
        postTitle: stripHtml(entry.post.title.rendered) || `Post ${entry.post.id}`,
        postSlug: entry.post.slug,
        link: entry.post.link,
        views: entry.views,
        engagement: entry.engagement,
        author: profile,
      });
    });
  });

  return leaderboard
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

export const fetchAdminDashboardSummary = async ({
  token,
  siteId = DEFAULT_SITE,
  timePeriod,
  roles = DEFAULT_ROLES,
  concurrency = 2,
}: FetchAdminAnalyticsOptions): Promise<AdminDashboardSummary> => {
  const profiles = await fetchAdminAuthorProfiles({ token, siteId, roles });
  const dateRange = getDateRangeFromTimeFilter(timePeriod);
  const safeConcurrency = Math.max(1, Math.min(concurrency, 10));
  const authorChunks = chunkItems(profiles, safeConcurrency);

  const authors: AdminAuthorInsights[] = [];
  const errors: Array<{ userId: number; reason: string }> = [];

  for (const chunk of authorChunks) {
    const results = await Promise.all(
      chunk.map(async (profile) => {
        try {
          const analytics = await authorAnalyticsService.getAuthorAnalytics(
            profile.id,
            timePeriod,
            token,
            dateRange
          );
          return { profile, analytics } as AdminAuthorInsights;
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'Unknown error';
          return { profile, analytics: null, error: reason } as AdminAuthorInsights;
        }
      })
    );

    results.forEach((entry) => {
      if (!entry.analytics && entry.error) {
        errors.push({ userId: entry.profile.id, reason: entry.error });
      }
      authors.push(entry);
    });
  }

  const totals = authors.reduce(
    (acc, entry) => {
      if (!entry.analytics) {
        acc.totalAuthors += 1;
        return acc;
      }

      acc.totalAuthors += 1;
      acc.authorsWithData += 1;
      acc.totalViews += entry.analytics.totalViews;
      acc.totalPosts += entry.analytics.totalPosts;
      return acc;
    },
    {
      authorsWithData: 0,
      totalAuthors: 0,
      totalViews: 0,
      totalPosts: 0,
      avgViewsPerAuthor: 0,
      avgViewsPerPost: 0,
      avgPostsPerAuthor: 0,
    }
  );

  if (totals.authorsWithData > 0) {
    totals.avgViewsPerAuthor = totals.totalViews / totals.authorsWithData;
    totals.avgPostsPerAuthor = totals.totalPosts / totals.authorsWithData;
  }

  if (totals.totalPosts > 0) {
    totals.avgViewsPerPost = totals.totalViews / totals.totalPosts;
  }

  const topAuthors = [...authors]
    .filter((entry) => entry.analytics)
    .sort((a, b) => (b.analytics?.totalViews ?? 0) - (a.analytics?.totalViews ?? 0))
    .slice(0, 10);

  const topPosts = buildPostLeaderboard(topAuthors, 25);

  return {
    generatedAt: new Date().toISOString(),
    siteId,
    timePeriod,
    totals,
    topAuthors,
    topPosts,
    authors,
    errors,
  };
};

export const adminRoleUtils = {
  isAdminRole,
};

export const adminApi = {
  fetchAuthorProfiles: fetchAdminAuthorProfiles,
  fetchDashboardSummary: fetchAdminDashboardSummary,
  isAdminRole,
};

export type { DashboardTimeFilter } from '@/utils/timeFilters';
