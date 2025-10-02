const getWPStatsUrl = (siteId: string) => {
  if (siteId === 'com') {
    return 'https://expoflamenco.com/wp-json/wpstatistics/v1';
  }
  return `https://expoflamenco.com/${siteId}/wp-json/wpstatistics/v1`;
};

const AUTH_TOKEN = '1805';

import { Platform } from 'react-native';

// Simple historical data storage - only use localStorage on web
const getComparisonData = async (siteId: string, timePeriod: string, currentMetrics: any) => {
  try {
    // Skip localStorage on native platforms to avoid errors
    if (Platform.OS !== 'web') {
      return {
        visitors: { percentage: '0%', trend: 'neutral' },
        subscriptions: { percentage: '0%', trend: 'neutral' },
        revenue: { percentage: '0%', trend: 'neutral' }
      };
    }

    const key = `historical_${siteId}_${timePeriod}`;
    const stored = localStorage.getItem(key);
    const previous = stored ? JSON.parse(stored) : { visitors: 0, subscriptions: 0, revenue: 0 };
    
    // Calculate percentage changes
    const calculatePercentage = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - prev) / prev) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    };
    
    const comparison = {
      visitors: {
        percentage: calculatePercentage(currentMetrics.visitors, previous.visitors),
        trend: currentMetrics.visitors > previous.visitors ? 'up' : 
               currentMetrics.visitors < previous.visitors ? 'down' : 'neutral'
      },
      subscriptions: {
        percentage: calculatePercentage(currentMetrics.subscriptions, previous.subscriptions),
        trend: currentMetrics.subscriptions > previous.subscriptions ? 'up' : 
               currentMetrics.subscriptions < previous.subscriptions ? 'down' : 'neutral'
      },
      revenue: {
        percentage: calculatePercentage(currentMetrics.revenue, previous.revenue),
        trend: currentMetrics.revenue > previous.revenue ? 'up' : 
               currentMetrics.revenue < previous.revenue ? 'down' : 'neutral'
      }
    };
    
    // Store current data for next comparison (only on web)
    localStorage.setItem(key, JSON.stringify(currentMetrics));
    
    console.log(`📊 Comparison for ${siteId} (${timePeriod}):`, comparison);
    return comparison;
    
  } catch (error) {
    console.error('📊 Comparison error:', error);
    return {
      visitors: { percentage: '0%', trend: 'neutral' },
      subscriptions: { percentage: '0%', trend: 'neutral' },
      revenue: { percentage: '0%', trend: 'neutral' }
    };
  }
};

interface ApiConfig {
  headers: {
    'Authorization': string;
    'Content-Type': string;
    'User-Agent': string;
    'X-Requested-With': string;
    'Accept': string;
  };
}

// WPStatistics API config
export const wpStatsConfig = {
  method: 'GET',
  mode: 'cors' as RequestMode,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'ExpoflamencoAdmin/1.0',
  },
};

const getWPStatsEndpoints = (siteId: string, timePeriod: string) => {
  const baseUrl = getWPStatsUrl(siteId);
  const token = `token_auth=${AUTH_TOKEN}`;
  
  // Convert time period to days parameter
  let daysParam = '';
  switch (timePeriod) {
    case '24h':
      daysParam = '&days=1';
      break;
    case '7d':
      daysParam = '&days=7';
      break;
    case '30d':
      daysParam = '&days=30';
      break;
    case '90d':
      daysParam = '&days=90';
      break;
    default:
      daysParam = '&days=1';
  }
  
  return {
    summary: `${baseUrl}/summary?${token}${daysParam}`,
    visitors: `${baseUrl}/visitors?${token}${daysParam}`,
    pages: `${baseUrl}/pages?${token}${daysParam}`,
    browsers: `${baseUrl}/browsers?${token}${daysParam}`,
    referrers: `${baseUrl}/referrers?${token}${daysParam}`,
    hits: `${baseUrl}/hits?${token}${daysParam}`,
  };
};

// Error data when API fails
const getErrorData = (rawError: unknown = 'Unknown error') => {
  const errorMessage = typeof rawError === 'string' ? rawError : (rawError as Error)?.message || 'Unknown error';

  console.warn('[WPStats] returning error dataset:', errorMessage);
  return {
    isError: true,
    errorMessage,
    todayVisitors: 'ERROR',
    yesterdayVisitors: 'ERROR',
    newSubscriptions: 'ERROR',
    totalSubscriptions: 'ERROR',
    monthlyRevenue: 'ERROR',
    activeMembers: 'ERROR',
    conversionRate: 'ERROR',
    avgSessionTime: 'ERROR',
    weeklyData: [],
    topCountries: [],
    previousWeekData: [],
    browsers: {},
    referrers: [],
    comparison: {
      visitors: { percentage: 'ERROR', trend: 'neutral' },
      subscriptions: { percentage: 'ERROR', trend: 'neutral' },
      revenue: { percentage: 'ERROR', trend: 'neutral' }
    }
  };
};

// Fetch with timeout
const fetchWithTimeout = (url: string, config: any, timeout = 5000): Promise<Response> => {
  return Promise.race([
    fetch(url, config),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// Parse countries from visitors data
const parseCountriesFromVisitors = (visitors: any[]) => {
  const countryCount: { [key: string]: { name: string; flag: string; visits: number } } = {};
  
  visitors.forEach(visitor => {
    if (visitor.location && visitor.location.code && visitor.location.name) {
      const code = visitor.location.code;
      if (!countryCount[code]) {
        countryCount[code] = {
          name: visitor.location.name,
          flag: visitor.location.flag || `🏳️`,
          visits: 0
        };
      }
      countryCount[code].visits++;
    }
  });
  
  return Object.values(countryCount)
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);
};

// ExpoFlamenco User data types
export interface ExpoFlamencoBlogInfo {
  blog_id: number;
}

export interface ExpoFlamencoAvatarUrls {
  '24': string;
  '48': string;
  '96': string;
}

export interface ExpoFlamencoAvatar {
  media_id: number;
  full: string;
  blog_id: number;
  [key: string]: string | number;
}

export interface ExpoFlamencoUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: ExpoFlamencoAvatarUrls;
  meta: any[];
  simple_local_avatar: ExpoFlamencoAvatar;
}

// PMPro Membership data types
export interface PMProMembership {
  id: number;
  user_id: number;
  membership_id: number;
  code_id: number;
  initial_payment: string;
  billing_amount: string;
  cycle_number: number;
  cycle_period: string;
  billing_limit: number;
  trial_amount: string;
  trial_limit: number;
  startdate: string;
  enddate: string;
  status: string;
}

export interface PMProLevel {
  id: number;
  name: string;
  description: string;
  confirmation: string;
  initial_payment: string;
  billing_amount: string;
  cycle_number: number;
  cycle_period: string;
  billing_limit: number;
  trial_amount: string;
  trial_limit: number;
  allow_signups: number;
}

// Processed user data for the app
export interface ProcessedUser {
  id: number;
  name: string;
  description: string;
  url: string;
  link: string;
  slug: string;
  avatar: string;
  joinDate: string;
  status: 'active' | 'inactive';
  articlesCount?: number;
  membershipLevel?: string;
  membershipStatus?: string;
  isVIP?: boolean;
  role?: string;
}

// Fetch PMPro membership levels
export const fetchPMProLevels = async (): Promise<PMProLevel[]> => {
  try {
    const response = await fetchWithTimeout(
      'https://expoflamenco.com/wp-json/pmpro/v1/membership_levels',
      {
        method: 'GET',
        mode: 'cors' as RequestMode,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ExpoflamencoAdmin/1.0',
        },
      },
      10000
    );

    if (!response.ok) {
      console.warn(`PMPro Levels API Warning: ${response.status} - PMPro plugin may not be installed or accessible`);
      return [];
    }

    const levels = await response.json();
    
    // Ensure we have a valid array
    if (!Array.isArray(levels)) {
      console.warn('PMPro Levels API returned invalid data format');
      return [];
    }
    
    console.log(`📊 Fetched ${levels.length} PMPro levels`);
    return levels as PMProLevel[];

  } catch (error: any) {
    console.warn('🚨 PMPro Levels API Warning:', error?.message || error, '- Using fallback membership logic');
    return [];
  }
};

// Fetch PMPro memberships for a user
export const fetchUserMembership = async (userId: number): Promise<PMProMembership | null> => {
  try {
    const response = await fetchWithTimeout(
      `https://expoflamenco.com/wp-json/pmpro/v1/memberships_for_user?user_id=${userId}`,
      {
        method: 'GET',
        mode: 'cors' as RequestMode,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ExpoflamencoAdmin/1.0',
        },
      },
      5000
    );

    if (!response.ok) {
      return null;
    }

    const memberships: PMProMembership[] = await response.json();
    return memberships.length > 0 ? memberships[0] : null;

  } catch (error: any) {
    return null;
  }
};


// Get user's real article count from WordPress API
export const fetchUserPostCount = async (userId: number): Promise<number> => {
  try {
    const response = await fetchWithTimeout(
      `https://expoflamenco.com/wp-json/wp/v2/posts?author=${userId}&per_page=1`,
      {
        method: 'HEAD', // Only get headers to check total count
        mode: 'cors' as RequestMode,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ExpoflamencoAdmin/1.0',
        },
      },
      5000
    );

    if (!response.ok) {
      return 0;
    }

    const totalHeader = response.headers.get('X-WP-Total');
    return totalHeader ? parseInt(totalHeader, 10) : 0;

  } catch (error) {
    console.warn(`Could not fetch post count for user ${userId}`);
    return 0;
  }
};

// Fetch ExpoFlamenco users - simple version that works
export const fetchExpoFlamencoUsers = async (): Promise<ProcessedUser[]> => {
  console.log('👥 Fetching ExpoFlamenco users...');
  
  try {
    const response = await fetchWithTimeout(
      'https://expoflamenco.com/wp-json/wp/v2/users',
      {
        method: 'GET',
        mode: 'cors' as RequestMode,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ExpoflamencoAdmin/1.0',
        },
      },
      10000
    );

    if (!response.ok) {
      throw new Error(`ExpoFlamenco Users API Error: ${response.status}`);
    }

    const users: ExpoFlamencoUser[] = await response.json();
    console.log(`📊 Fetched ${users.length} users from ExpoFlamenco`);

    // Process and sort users alphabetically
    const processedUsers: ProcessedUser[] = users
      .map(user => ({
        id: user.id,
        name: user.name,
        description: user.description || 'Sin descripción disponible',
        url: user.url,
        link: user.link,
        slug: user.slug,
        avatar: (user.simple_local_avatar?.['96'] as string) || user.avatar_urls['96'] || (user.simple_local_avatar?.full as string) || '',
        joinDate: '2024',
        status: 'active' as const,
        articlesCount: Math.floor(Math.random() * 50) + 1, // Temporary mock data
        membershipLevel: undefined,
        membershipStatus: undefined,
        isVIP: false,
        role: 'Colaborador', // Default role for now
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    console.log('✅ Users processed and sorted alphabetically');
    return processedUsers;

  } catch (error: any) {
    console.error('🚨 ExpoFlamenco Users API Error:', error?.message || error);
    return [];
  }
};

type TimePeriodKey = '24h' | '7d' | '30d' | '90d';

const PERIOD_DAY_MAP: Record<TimePeriodKey, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const getSummaryFallback = (summaryData: any, period: TimePeriodKey) => {
  switch (period) {
    case '24h':
      return {
        current: Number(summaryData?.visitors?.today) || 0,
        previous: Number(summaryData?.visitors?.yesterday) || 0,
      };
    case '7d':
      return {
        current: Number(summaryData?.visitors?.week) || 0,
        previous: 0,
      };
    case '30d':
      return {
        current: Number(summaryData?.visitors?.month) || 0,
        previous: 0,
      };
    case '90d':
    default:
      return {
        current: 0,
        previous: 0,
      };
  }
};

const safeNumber = (value: any): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sumVisitors = (series: Array<{ visitors: number }>) =>
  series.reduce((total, item) => total + safeNumber(item.visitors), 0);

const normalizeHitsData = (hitsData: any[]): Array<{ day: string; visitors: number }> => {
  if (!Array.isArray(hitsData)) {
    return [];
  }

  const dailyMap = new Map<string, number>();

  hitsData.forEach((hit: any) => {
    const rawDate = typeof hit?.date === 'string' ? hit.date : '';
    if (!rawDate) {
      return;
    }
    const visitors = safeNumber(hit?.visitors ?? hit?.visitor);
    const existing = dailyMap.get(rawDate) ?? 0;
    dailyMap.set(rawDate, existing + visitors);
  });

  return Array.from(dailyMap.entries())
    .map(([day, visitors]) => ({ day, visitors }))
    .sort((a, b) => {
      const aTime = Date.parse(a.day);
      const bTime = Date.parse(b.day);
      if (!Number.isFinite(aTime) || !Number.isFinite(bTime)) {
        return 0;
      }
      return aTime - bTime;
    });
};

const logWpStatsSummary = (siteId: string, timePeriod: TimePeriodKey, data: { todayVisitors: number; yesterdayVisitors: number; newSubscriptions: number; weeklyData: Array<{ day: string; visitors: number }> }) => {
  const seriesCount = Array.isArray(data.weeklyData) ? data.weeklyData.length : 0;
  console.log(`[WPStats] ${siteId}/${timePeriod} visitors=${data.todayVisitors} prev=${data.yesterdayVisitors} subs=${data.newSubscriptions} points=${seriesCount}`);
};

export const fetchSiteData = async (siteId: string, timePeriod: TimePeriodKey = '30d') => {
  try {
    const endpoints = getWPStatsEndpoints(siteId, timePeriod);

    const timeoutMs = timePeriod === '24h' ? 5000 : 10000;

    const [summary, visitors, hits, browsers, referrers] = await Promise.all([
      fetchWithTimeout(endpoints.summary, wpStatsConfig, timeoutMs) as Promise<Response>,
      fetchWithTimeout(endpoints.visitors, wpStatsConfig, timeoutMs) as Promise<Response>,
      fetchWithTimeout(endpoints.hits, wpStatsConfig, timeoutMs) as Promise<Response>,
      fetchWithTimeout(endpoints.browsers, wpStatsConfig, timeoutMs) as Promise<Response>,
      fetchWithTimeout(endpoints.referrers, wpStatsConfig, timeoutMs) as Promise<Response>,
    ]);

    if (!summary.ok || !visitors.ok || !hits.ok) {
      throw new Error(`WPStats API Error: Summary ${summary.status}, Visitors ${visitors.status}, Hits ${hits.status}`);
    }

    const summaryData = await summary.json();
    const visitorsData = await visitors.json();
    const hitsData = await hits.json();
    const browsersData = browsers.ok ? await browsers.json() : {};
    const referrersData = referrers.ok ? await referrers.json() : [];

    // Parse countries from individual visitors
    const topCountries = parseCountriesFromVisitors(visitorsData);

    const normalizedHits = normalizeHitsData(hitsData);
    const periodDays = PERIOD_DAY_MAP[timePeriod] ?? 30;

    const recentSlice = periodDays > 0 ? normalizedHits.slice(-periodDays) : normalizedHits;
    const previousSlice = periodDays > 0 ? normalizedHits.slice(-periodDays * 2, -periodDays) : [];

    const currentFromHits = sumVisitors(recentSlice);
    const previousFromHits = sumVisitors(previousSlice);

    const summaryFallback = getSummaryFallback(summaryData, timePeriod);

    const currentVisitors = currentFromHits > 0 ? currentFromHits : summaryFallback.current;
    const previousVisitors = previousFromHits > 0 ? previousFromHits : summaryFallback.previous;

    const currentMetrics = {
      visitors: currentVisitors,
      subscriptions: safeNumber(summaryData?.subscriptions),
      revenue: 0,
    };

    const dailySeries = recentSlice.map((hit) => ({
      day: hit.day,
      visitors: safeNumber(hit.visitors),
    }));

    const comparison = await getComparisonData(siteId, timePeriod, currentMetrics);

    const calculatedData = {
      isError: false,
      errorMessage: null,
      todayVisitors: currentVisitors,
      yesterdayVisitors: previousVisitors,
      newSubscriptions: safeNumber(summaryData?.subscriptions),
      totalSubscriptions: safeNumber(summaryData?.total_users),
      monthlyRevenue: 0,
      activeMembers: safeNumber(summaryData?.total_users),
      conversionRate:
        currentVisitors > 0 && currentMetrics.subscriptions > 0
          ? ((currentMetrics.subscriptions / currentVisitors) * 100).toFixed(1)
          : '0.0',
      avgSessionTime: 0,
      weeklyData: dailySeries,
      previousWeekData: previousSlice.map((hit) => ({
        day: hit.day,
        visitors: safeNumber(hit.visitors),
      })),
      timePeriod,
      comparison,
      topCountries,
      browsers: browsersData,
      referrers: Array.isArray(referrersData) ? referrersData.slice(0, 5) : [],
    };

    logWpStatsSummary(siteId, timePeriod, calculatedData);

    return calculatedData;
  } catch (error: any) {
    console.error(`[WPStats] ${siteId}/${timePeriod} failed:`, error?.message || error);
    return getErrorData(error);
  }
};
