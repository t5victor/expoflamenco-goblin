import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '@/components/Sidebar';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { LineChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { authorAnalyticsService, AuthorAnalytics } from '@/services/authorAnalytics';
import { fetchSiteData } from '@/services/api';
import { getDateRangeFromTimeFilter, DASHBOARD_TIME_FILTERS, DashboardTimeFilter } from '@/utils/timeFilters';
import { dataCacheKeys, getCachedData, setCachedData } from '@/services/dataCache';
import { addPrefetchListener } from '@/services/prefetchManager';
import { useRouter } from 'expo-router';

// Using AuthorAnalytics interface from authorAnalytics service
type DashboardData = AuthorAnalytics;

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;


interface TrafficSeriesPoint {
  rawLabel: string;
  visitors: number;
  date: Date | null;
  index: number;
}

interface DisplaySeriesPoint {
  label: string;
  visitors: number;
}

interface ChartDataState {
  rawSeries: TrafficSeriesPoint[];
  displaySeries: DisplaySeriesPoint[];
}

const parseWpDateLabel = (label: string): Date | null => {
  if (!label) return null;

  const now = new Date();
  let parsed = new Date(`${label} ${now.getFullYear()}`);

  if (Number.isNaN(parsed.getTime())) {
    parsed = new Date(label);
  }

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  if (parsed.getTime() - now.getTime() > ninetyDaysMs) {
    parsed.setFullYear(parsed.getFullYear() - 1);
  }

  return parsed;
};

const buildDisplaySeries = (series: TrafficSeriesPoint[], timeFilter: DashboardTimeFilter): DisplaySeriesPoint[] => {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }

  const formatPointLabel = (point: TrafficSeriesPoint): string => {
    if (point.date) {
      return point.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
    return point.rawLabel;
  };

  const formatRangeLabel = (start: TrafficSeriesPoint, end: TrafficSeriesPoint): string => {
    if (!start || !end) return '';

    if (start.date && end.date) {
      const startDay = start.date.getDate();
      const startMonth = start.date.toLocaleDateString('es-ES', { month: 'short' });
      const endDay = end.date.getDate();
      const endMonth = end.date.toLocaleDateString('es-ES', { month: 'short' });

      if (startMonth === endMonth) {
        return `${startDay}-${endDay}\n${startMonth}`;
      }

      return `${startDay} ${startMonth}\n${endDay} ${endMonth}`;
    }

    const startLabel = formatPointLabel(start);
    const endLabel = formatPointLabel(end);
    if (startLabel === endLabel) {
      return startLabel;
    }

    return `${startLabel}\n${endLabel}`;
  };

  const buildBuckets = (bucketCount: number): DisplaySeriesPoint[] => {
    const safeBuckets = Math.max(1, bucketCount);
    const groupSize = Math.ceil(series.length / safeBuckets);
    const buckets: DisplaySeriesPoint[] = [];

    for (let i = 0; i < series.length; i += groupSize) {
      const chunk = series.slice(i, i + groupSize);
      if (chunk.length === 0) continue;

      const avgVisitors = Math.round(
        chunk.reduce((total, point) => total + point.visitors, 0) / chunk.length
      );

      buckets.push({
        label: formatRangeLabel(chunk[0], chunk[chunk.length - 1]),
        visitors: avgVisitors,
      });
    }

    return buckets;
  };

  if (timeFilter === '30d') {
    return buildBuckets(4);
  }

  if (timeFilter === '90d') {
    return buildBuckets(6);
  }

  const maxPoints = timeFilter === '24h' ? Math.min(4, series.length) : Math.min(7, series.length);
  if (series.length <= maxPoints) {
    return series.map((point) => ({
      label: formatPointLabel(point),
      visitors: point.visitors,
    }));
  }

  const step = (series.length - 1) / (Math.max(1, maxPoints - 1));
  const sampled: DisplaySeriesPoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const index = Math.round(i * step);
    const point = series[Math.min(series.length - 1, Math.max(0, index))];
    sampled.push({
      label: formatPointLabel(point),
      visitors: point.visitors,
    });
  }
  return sampled;
};


interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: keyof typeof Feather.glyphMap;
  size?: 'small' | 'medium' | 'large';
  accentColor?: string;
  onPress?: () => void;
}

interface PostsCardProps {
  data: DashboardData;
  timeFilter: DashboardTimeFilter;
  t: any;
}

interface RankingCardProps {
  posts: DashboardData['topPosts'];
  isDark: boolean;
  t: any;
  onSelect: (postId: number) => void;
}

interface RecentActivityCardProps {
  posts: DashboardData['recentPosts'];
  isDark: boolean;
  t: any;
  onSelect: (postId: number) => void;
}

interface StatsSummaryCardProps {
  data: DashboardData;
  isDark: boolean;
  t: any;
}

const getTrendVisuals = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return {
        tint: '#DCFCE7',
        iconColor: '#166534',
        labelColor: '#166534',
        icon: 'trending-up' as keyof typeof Feather.glyphMap,
      };
    case 'down':
      return {
        tint: '#FEE2E2',
        iconColor: '#B91C1C',
        labelColor: '#B91C1C',
        icon: 'trending-down' as keyof typeof Feather.glyphMap,
      };
    default:
      return {
        tint: '#E5E7EB',
        iconColor: '#1F2937',
        labelColor: '#1F2937',
        icon: 'minus' as keyof typeof Feather.glyphMap,
      };
  }
};

const PostsCard: React.FC<PostsCardProps> = ({
  data,
  timeFilter,
  t
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const accentColor = '#8B5CF6';
  const comparison = data.comparison?.posts;
  const trendVisual = comparison ? getTrendVisuals(comparison.trend) : null;
  const iconBackground = isDark ? accentColor + '33' : accentColor + '18';

  return (
    <View style={[
      styles.metricCard,
      styles.mediumCard,
      {
        backgroundColor: isDark ? '#111827' : '#FFFFFF',
        borderColor: accentColor + '26',
        shadowColor: accentColor,
      }
    ]}>
      <View style={[styles.cardAccentBar, { backgroundColor: accentColor + '44' }]} />
      <View style={styles.metricCardBody}>
        <View style={styles.metricHeaderRow}>
          <View style={[styles.metricIcon, { backgroundColor: iconBackground }] }>
            <IconSymbol name="doc" size={18} color={accentColor} />
          </View>
          <Text style={[
            styles.metricTitle,
            { color: isDark ? '#F9FAFB' : '#111827' }
          ]}>
            {`${t(`timePeriods.${timeFilter}`)} ${t('dashboard.postsCount')}`}
          </Text>
          {comparison && trendVisual && (
            <View style={[styles.trendPill, { backgroundColor: trendVisual.tint }]}>
              <Feather name={trendVisual.icon} size={12} color={trendVisual.iconColor} />
              <Text style={[styles.trendLabel, { color: trendVisual.labelColor }]}>
                {comparison.percentage}
              </Text>
            </View>
          )}
        </View>

        <Text style={[
          styles.metricValue,
          { color: isDark ? '#FFFFFF' : '#111827' }
        ]}>
          {data.totalPosts.toString()}
        </Text>

        <Text style={[
          styles.metricSubtitle,
          { color: isDark ? '#9CA3AF' : '#6B7280' }
        ]}>
          {t('dashboard.postsTotalDesc')}
        </Text>
      </View>
    </View>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  size = 'medium',
  accentColor = '#6B7280',
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const trendVisual = trend ? getTrendVisuals(trend) : null;
  const cardBackground = isDark ? '#111827' : '#FFFFFF';
  const iconBackground = isDark ? accentColor + '33' : accentColor + '1F';

  const Container: React.ElementType = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={[
        styles.metricCard,
        styles[`${size}Card`],
        {
          backgroundColor: cardBackground,
          borderColor: accentColor + '25',
          shadowColor: accentColor,
        }
      ]}
    >
      <View style={[styles.cardAccentBar, { backgroundColor: accentColor + '3D' }]} />
      <View style={styles.metricCardBody}>
        <View style={styles.metricHeaderRow}>
          <View style={[styles.metricIcon, { backgroundColor: iconBackground }] }>
            <Feather name={icon} size={18} color={accentColor} />
          </View>
          <Text style={[
            styles.metricTitle,
            { color: isDark ? '#F9FAFB' : '#111827' }
          ]}>
            {title}
          </Text>
          {trendVisual && trendValue && (
            <View style={[styles.trendPill, { backgroundColor: trendVisual.tint }]}>
              <Feather name={trendVisual.icon} size={12} color={trendVisual.iconColor} />
              <Text style={[styles.trendLabel, { color: trendVisual.labelColor }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>

        <Text style={[
          styles.metricValue, 
          { color: isDark ? '#FFFFFF' : '#111827' }
        ]}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>

        {subtitle && (
          <Text style={[
            styles.metricSubtitle, 
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
    </Container>
  );
};

const RankingCard: React.FC<RankingCardProps> = ({ posts, isDark, t, onSelect }) => {
  const topPosts = Array.isArray(posts) ? posts : [];
  const podium = topPosts.slice(0, 3);
  const others = topPosts.slice(3, 7);

  const podiumSlots = [
    { rank: 2, sourceIndex: 1, height: 78, accent: '#6366F1' },
    { rank: 1, sourceIndex: 0, height: 104, accent: '#F97316' },
    { rank: 3, sourceIndex: 2, height: 68, accent: '#14B8A6' },
  ];

  const cardBackground = isDark ? '#111827' : '#FFFFFF';
  const borderColor = isDark ? '#1F2937' : '#E5E7EB';

const renderPodiumColumn = ({ rank, sourceIndex, height, accent }: typeof podiumSlots[number]) => {
  const entry = podium[sourceIndex];
  if (!entry || !entry.post) {
    return (
      <View style={styles.podiumColumnEmpty}>
        <View style={[styles.podiumBar, { height, backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]} />
        <Text style={[styles.podiumLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>#{rank}</Text>
      </View>
    );
  }

    const title = entry.post.title?.rendered || t('dashboard.rankingEmpty');
    const viewsLabel = `${entry.views?.toLocaleString?.() || '0'} ${t('articles.views') || 'views'}`;

    return (
      <View style={styles.podiumColumnInner}>
        <View
          style={[
            styles.podiumBar,
            {
              height,
              backgroundColor: accent,
            },
          ]}
        >
          {rank === 1 && <Feather name="award" size={16} color="#FFFFFF" style={styles.podiumIcon} />}
          <Text style={[styles.podiumRankText, { color: '#FFFFFF' }]}>#{rank}</Text>
        </View>
        <Text
          style={[styles.podiumTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text style={[styles.podiumMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{viewsLabel}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.contentCard, { backgroundColor: cardBackground, borderColor }] }>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={[styles.cardHeadline, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {t('dashboard.rankingTitle')}
          </Text>
          <Text style={[styles.cardDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {t('dashboard.rankingSubtitle')}
          </Text>
        </View>
      </View>

      {podium.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>
            {t('dashboard.topPostViews')}
          </Text>
      <View style={styles.podiumRow}>
        {podiumSlots.map((slot) => {
          const entry = podium[slot.sourceIndex];
          if (!entry || !entry.post) {
            return (
              <View key={`empty-${slot.rank}`} style={styles.podiumColumn}>
                {renderPodiumColumn(slot)}
              </View>
            );
          }
          return (
            <TouchableOpacity
              key={slot.rank}
              style={styles.podiumColumn}
              activeOpacity={0.85}
              onPress={() => onSelect(entry.post.id)}
            >
              {renderPodiumColumn(slot)}
            </TouchableOpacity>
          );
        })}
      </View>

          {others.length > 0 && (
            <View style={styles.rankingList}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>
                {t('dashboard.rankingOthers')}
              </Text>
              {others.map((entry, index) => (
                <TouchableOpacity
                  key={entry.post?.id ?? index}
                  style={styles.rankingRow}
                  activeOpacity={0.85}
                  onPress={() => entry.post?.id && onSelect(entry.post.id)}
                >
                  <View style={[styles.rankingBadge, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                    <Text style={[styles.rankingBadgeText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      #{index + 4}
                    </Text>
                  </View>
                  <View style={styles.rankingBody}>
                    <Text
                      style={[styles.rankingTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}
                      numberOfLines={1}
                    >
                      {entry.post?.title?.rendered || '—'}
                    </Text>
                    <Text style={[styles.rankingMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {(entry.views || 0).toLocaleString()} {t('articles.views') || 'views'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Feather name="bar-chart-2" size={20} color={isDark ? '#4B5563' : '#9CA3AF'} />
          <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {t('dashboard.rankingEmpty')}
          </Text>
        </View>
      )}
    </View>
  );
};

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ posts, isDark, t, onSelect }) => {
  const recent = Array.isArray(posts) ? posts.slice(0, 5) : [];
  const cardBackground = isDark ? '#111827' : '#FFFFFF';
  const borderColor = isDark ? '#1F2937' : '#E5E7EB';

  return (
    <View style={[styles.contentCard, { backgroundColor: cardBackground, borderColor }]}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={[styles.cardHeadline, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {t('dashboard.recentActivityTitle')}
          </Text>
          <Text style={[styles.cardDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {t('dashboard.recentActivitySubtitle')}
          </Text>
        </View>
      </View>

      {recent.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="file-text" size={20} color={isDark ? '#4B5563' : '#9CA3AF'} />
          <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {t('dashboard.recentActivityEmpty')}
          </Text>
        </View>
      ) : (
        <View style={styles.activityList}>
          {recent.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.activityRow}
              activeOpacity={0.85}
              onPress={() => onSelect(post.id)}
            >
              <View
                style={[
                  styles.activityBullet,
                  { backgroundColor: isDark ? '#1F2937' : '#FEE2E2' },
                ]}
              >
                <Feather name="edit-3" size={14} color={isDark ? '#F9FAFB' : '#9F1239'} />
              </View>
              <View style={styles.activityBody}>
                <Text
                  style={[styles.activityTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}
                  numberOfLines={1}
                >
                  {post.title?.rendered || '—'}
                </Text>
                <Text style={[styles.activityMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {new Date(post.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({ data, isDark, t }) => {
  const cardBackground = isDark ? '#111827' : '#FFFFFF';
  const borderColor = isDark ? '#1F2937' : '#E5E7EB';

  const summaryItems = [
    {
      label: t('dashboard.articlesCount'),
      value: data.totalPosts.toLocaleString(),
      color: '#3B82F6',
    },
    {
      label: t('dashboard.totalViewsCount'),
      value: data.totalViews.toLocaleString(),
      color: '#10B981',
    },
    {
      label: t('dashboard.avgViewsPerArticle'),
      value: data.avgViewsPerPost.toFixed(1),
      color: '#F59E0B',
    },
  ];

  return (
    <View style={[styles.contentCard, { backgroundColor: cardBackground, borderColor }]}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={[styles.cardHeadline, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {t('dashboard.statsSummary')}
          </Text>
          <Text style={[styles.cardDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {t('dashboard.rankingSubtitle')}
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        {summaryItems.map((item) => (
          <View key={item.label} style={[styles.summaryChip, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
            <View style={[styles.summaryDot, { backgroundColor: item.color }]} />
            <View style={styles.summaryTextGroup}>
              <Text style={[styles.summaryValue, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                {item.value}
              </Text>
              <Text style={[styles.summaryLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {item.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};


export default function AuthorDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState<DashboardTimeFilter>('30d');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataState | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [hasAuthorError, setHasAuthorError] = useState(false);
  const [hasMetricsError, setHasMetricsError] = useState(false);
  const [selectedSite] = useState('com');
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const isDark = colorScheme === 'dark';
  const userInteractionRef = useRef(false);
  const router = useRouter();

  const avatarUri = useMemo(() => {
    const fallback = user?.avatar ?? '';
    if (!fallback) return '';
    if (Platform.OS === 'web') {
      return fallback;
    }
    try {
      return decodeURI(fallback);
    } catch {
      return fallback;
    }
  }, [user?.avatar]);

  const markUserInteraction = () => {
    userInteractionRef.current = true;
  };

  const handleTimeFilterChange = (nextFilter: DashboardTimeFilter) => {
    if (timeFilter === nextFilter) {
      return;
    }
    markUserInteraction();
    setTimeFilter(nextFilter);
  };

  const applySiteMetricsToChart = useCallback((siteMetrics: any) => {
    const normalizedWeeklyData: TrafficSeriesPoint[] = Array.isArray(siteMetrics?.weeklyData)
      ? siteMetrics.weeklyData.map((item: any, index: number) => {
          const rawLabel = typeof item?.day === 'string' ? item.day : '';
          const visitors = Number(item?.visitors ?? item?.visitor ?? 0) || 0;
          return {
            rawLabel,
            visitors,
            date: parseWpDateLabel(rawLabel),
            index,
          };
        })
      : [];

    setChartData({
      rawSeries: normalizedWeeklyData,
      displaySeries: buildDisplaySeries(normalizedWeeklyData, timeFilter),
    });
  }, [timeFilter]);

  const loadAuthorData = useCallback(
    async ({ allowNetwork = true, silent = false }: { allowNetwork?: boolean; silent?: boolean } = {}) => {
      if (!user) return;

      const cacheKey = dataCacheKeys.authorAnalytics(user.userId, timeFilter);
      const cacheResult = await getCachedData<DashboardData>(cacheKey);
      const cachedData = cacheResult.data;
      const hasCached = !!cachedData;

      if (hasCached) {
        setData(cachedData);
        setHasAuthorError(false);
        setLoading(false);
      } else if (!silent) {
        setLoading(true);
      }

      const needsFetch =
        allowNetwork && (!hasCached || cacheResult.isExpired);

      if (!needsFetch) {
        return;
      }

      try {
        const dateRange = getDateRangeFromTimeFilter(timeFilter);
        const authorData = await authorAnalyticsService.getAuthorAnalytics(
          user.userId,
          timeFilter,
          user.token,
          dateRange
        );
        setData(authorData);
        setHasAuthorError(false);
        await setCachedData(cacheKey, authorData);
        setLoading(false);
      } catch (error) {
        console.error('Author analytics error:', (error as Error).message);
        if (!hasCached) {
          setData(null);
          setHasAuthorError(true);
          setLoading(false);
        }
      }
    },
    [user, timeFilter]
  );

  const loadChartData = useCallback(
    async ({ allowNetwork = true, silent = false }: { allowNetwork?: boolean; silent?: boolean } = {}) => {
      const cacheKey = dataCacheKeys.siteMetrics(selectedSite, timeFilter);
      const cacheResult = await getCachedData<any>(cacheKey);
      const cachedMetrics = cacheResult.data;
      const hasUsableCached = !!cachedMetrics && !cachedMetrics.isError;

      if (hasUsableCached) {
        applySiteMetricsToChart(cachedMetrics);
        setHasMetricsError(false);
        setChartLoading(false);
      } else if (!silent) {
        setChartLoading(true);
      }

      const needsFetch =
        allowNetwork && (!hasUsableCached || cacheResult.isExpired);

      if (!needsFetch) {
        return;
      }

      try {
        const siteMetrics = await fetchSiteData(selectedSite, timeFilter);

        if (siteMetrics?.isError) {
          if (!hasUsableCached) {
            setHasMetricsError(true);
            setChartData(null);
            setChartLoading(false);
          }
        } else {
          applySiteMetricsToChart(siteMetrics);
          setHasMetricsError(false);
          await setCachedData(cacheKey, siteMetrics);
          setChartLoading(false);
        }
      } catch (error) {
        console.error('Chart data fetch error:', error);
        if (!hasUsableCached) {
          setChartData(null);
          setHasMetricsError(true);
          setChartLoading(false);
        }
      }
    },
    [applySiteMetricsToChart, selectedSite, timeFilter]
  );

  useEffect(() => {
    const unsubscribe = addPrefetchListener(() => {
      loadAuthorData({ allowNetwork: false, silent: true });
      loadChartData({ allowNetwork: false, silent: true });
    });

    return unsubscribe;
  }, [loadAuthorData, loadChartData]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fromInteraction = userInteractionRef.current;
    const allowNetwork = !fromInteraction;

    loadAuthorData({ allowNetwork });
    loadChartData({ allowNetwork });

    if (fromInteraction) {
      userInteractionRef.current = false;
    }
  }, [user, timeFilter, selectedSite, loadAuthorData, loadChartData]);

  const onRefresh = useCallback(async () => {
    markUserInteraction();
    setRefreshing(true);
    await Promise.all([
      loadAuthorData({ allowNetwork: false, silent: true }),
      loadChartData({ allowNetwork: false, silent: true })
    ]);
    setRefreshing(false);
    userInteractionRef.current = false;
  }, [loadAuthorData, loadChartData]);

  const timeFilters = DASHBOARD_TIME_FILTERS.map((filter) => ({
    id: filter as DashboardTimeFilter,
    label: filter,
  }));

  const openPostDetails = useCallback(
    (postId: number) => {
      if (!postId) return;
      router.push({
        pathname: '/article/[id]',
        params: { id: String(postId), period: timeFilter },
      });
    },
    [router, timeFilter]
  );

  const showOffline = hasAuthorError || hasMetricsError;

  if (loading) {
    return (
      <SafeAreaView style={[
        styles.container, 
        { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
      ]}>
        <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {t('loading')}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!loading && showOffline) {
    return (
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
      ]}>
        <View style={[styles.offlineContainer, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
          <Feather
            name="wifi-off"
            size={48}
            color={isDark ? '#F9FAFB' : '#111827'}
            style={styles.offlineIcon}
          />
          <Text style={[
            styles.offlineTitle,
            { color: isDark ? '#FFFFFF' : '#111827' }
          ]}>
            {t('dashboard.serverOfflineTitle')}
          </Text>
          <Text style={[
            styles.offlineMessage,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]}>
            {t('dashboard.serverOfflineMessage')}
          </Text>
          <TouchableOpacity
            style={[
              styles.offlineButton,
              {
                backgroundColor: refreshing ? '#9CA3AF' : '#DA2B1F',
                opacity: refreshing ? 0.7 : 1,
              }
            ]}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Text style={styles.offlineButtonText}>
              {refreshing ? t('articles.refreshing') : t('refresh')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={[
        styles.container, 
        { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
      ]}>
        <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            API ERROR - No data available
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const trafficSeries = Array.isArray(chartData?.displaySeries) ? chartData.displaySeries : [];
  const rawSeries = Array.isArray(chartData?.rawSeries) ? chartData.rawSeries : [];
  const formattedLabels = trafficSeries.map((item: DisplaySeriesPoint) => item?.label || '');

  const trafficValues = trafficSeries.map((item: DisplaySeriesPoint) => Number(item.visitors) || 0);
  const rawValues = rawSeries.map((item: TrafficSeriesPoint) => Number(item.visitors) || 0);
  const chartHasData = trafficSeries.length > 0;
  const statsHasData = rawValues.length > 0;

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <View style={styles.layout}>
        {!isMobile && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
        
        <View style={styles.content}>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={[styles.header, isMobile && styles.mobileHeader]}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIdentityRow}>
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.headerAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.headerAvatarFallback,
                        { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' },
                      ]}
                    >
                      <Feather name="user" size={18} color={isDark ? '#F9FAFB' : '#111827'} />
                    </View>
                  )}
                  <View style={styles.headerTextGroup}>
                    <Text style={[
                      styles.headerTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {user?.name || t('dashboard.title')}
                    </Text>
                    <Text style={[
                      styles.headerSubtitle,
                      { color: isDark ? '#9CA3AF' : '#6B7280' }
                    ]}>
                      {t('dashboard.subtitle')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.headerActions, isMobile && styles.mobileHeaderActions]}>
              <View style={[
                styles.timeSelectorContainer,
                isMobile && styles.mobileTimeSelectorContainer,
                { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)' }
              ]}>
                {timeFilters.map((filter, index) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.timeSelectorButton,
                      isMobile && styles.mobileTimeSelectorButton,
                      index === 0 && styles.timeSelectorButtonFirst,
                      index === timeFilters.length - 1 && styles.timeSelectorButtonLast,
                      timeFilter === filter.id && styles.timeSelectorButtonActive,
                      timeFilter === filter.id && {
                        backgroundColor: '#DA2B1F',
                        shadowColor: '#DA2B1F',
                      }
                    ]}
                    onPress={() => handleTimeFilterChange(filter.id as DashboardTimeFilter)}
                  >
                      <Text style={[
                        styles.timeSelectorText,
                        timeFilter === filter.id && styles.timeSelectorTextActive,
                        {
                          color: timeFilter === filter.id
                            ? '#FFFFFF'
                            : (isDark ? '#D1D5DB' : '#374151')
                        }
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.rightActions, isMobile && styles.mobileRightActions]}>
                  {!isMobile && <LanguageDropdown />}

                  {!isMobile && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
                      ]}
                      onPress={logout}
                    >
                      <IconSymbol name="arrow.right.square" size={16} color={isDark ? '#FFFFFF' : '#374151'} />
                      <Text style={[
                        styles.actionButtonText,
                        { color: isDark ? '#FFFFFF' : '#374151' }
                      ]}>
                        {t('logout')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Enhanced Traffic Chart - FIRST THING ON DASHBOARD */}
            <View style={[styles.dashboardGrid, isMobile && styles.mobileDashboardGrid]}>
              {/* Enhanced Traffic Chart */}
              <View style={[
                styles.enhancedChartCard,
                {
                  backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  marginBottom: 32,
                }
              ]}>
                <View style={styles.enhancedChartHeader}>
                  <View style={styles.chartTitleContainer}>
                    <Text style={[
                      styles.enhancedChartTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {t('analytics.trafficAnalytics')}
                    </Text>
                    <Text style={[
                      styles.enhancedChartSubtitle,
                      { color: isDark ? '#9CA3AF' : '#6B7280' }
                    ]}>
                      {t('analytics.realTimeInsights')}
                    </Text>
                  </View>
                  <Feather name="more-horizontal" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </View>


                {/* Enhanced Chart - Always Visible */}
                <View style={styles.chartContainer}>
                  {chartLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={[
                        styles.loadingText,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {t('loading')}...
                      </Text>
                    </View>
                  ) : chartHasData ? (
                    <LineChart
                      data={{
                        labels: formattedLabels,
                        datasets: [
                          {
                            data: trafficValues,
                            color: (opacity = 1) => isDark ? `rgba(218, 43, 31, ${opacity})` : `rgba(218, 43, 31, ${opacity})`,
                            strokeWidth: 3,
                          },
                        ],
                      }}
                      width={screenWidth - 80}
                      height={220}
                      chartConfig={{
                        backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                        backgroundGradientFrom: isDark ? '#1F1F1F' : '#FFFFFF',
                        backgroundGradientTo: isDark ? '#1F1F1F' : '#FFFFFF',
                        decimalPlaces: 0,
                        color: (opacity = 1) => isDark ? `rgba(218, 43, 31, ${opacity})` : `rgba(218, 43, 31, ${opacity})`,
                        labelColor: (opacity = 1) => isDark ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: '5',
                          strokeWidth: '2',
                          stroke: '#DA2B1F',
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: '3,3',
                          stroke: isDark ? '#374151' : '#E5E7EB',
                        },
                      }}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                      withDots={true}
                      withShadow={false}
                      withVerticalLines={false}
                      withHorizontalLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                      formatYLabel={(value) => `${(parseInt(value) / 1000).toFixed(1)}k`}
                    />
                  ) : (
                    <View style={styles.loadingContainer}>
                      <Text style={[
                        styles.loadingText,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {t('analytics.noData') || 'No data available'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Chart Stats - Always Visible */}
                <View style={[styles.chartStats, { borderTopColor: isDark ? '#374151' : '#E5E7EB' }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {statsHasData
                        ? Math.max(...rawValues).toLocaleString()
                        : '0'
                      }
                    </Text>
                    <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {t('analytics.peakVisitors')}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {statsHasData
                        ? Math.round(rawValues.reduce((sum: number, value: number) => sum + value, 0) / rawValues.length).toLocaleString()
                        : '0'
                      }
                    </Text>
                    <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {t('analytics.dailyAverage')}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {statsHasData
                        ? rawValues.reduce((sum: number, value: number) => sum + value, 0).toLocaleString()
                        : '0'
                      }
                    </Text>
                    <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {t('analytics.totalPeriod')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Key Metrics Row */}
              <View style={[styles.metricsRow, isMobile && styles.mobileMetricsRow]}>
                <MetricCard
                  title={t('dashboard.postsCount')}
                  value={data.totalPosts.toString()}
                  subtitle={`${t('dashboard.postsTotal')} (${t(`timePeriods.${timeFilter}`)})`}
                  trend={data.comparison?.posts.trend || 'neutral'}
                  trendValue={data.comparison?.posts.percentage || '0%'}
                  icon="file-text"
                  size="medium"
                  accentColor="#3B82F6"
                />

                <PostsCard
                  data={data}
                  timeFilter={timeFilter}
                  t={t}
                />

                <MetricCard
                  title={t('dashboard.avgViewsPerPost')}
                  value={data.avgViewsPerPost.toFixed(1)}
                  subtitle={t('dashboard.avgViewsDesc')}
                  trend={data.comparison?.engagement.trend || 'neutral'}
                  trendValue={data.comparison?.engagement.percentage || '0%'}
                  icon="trending-up"
                  size="medium"
                  accentColor="#10B981"
                />

                <MetricCard
                  title={t('dashboard.topPostViews')}
                  value={data.topPosts.length > 0 ? data.topPosts[0].views.toLocaleString() : '0'}
                  subtitle={t('dashboard.topPostDesc')}
                  trend="up"
                  trendValue="N/A"
                  icon="star"
                  size="medium"
                  accentColor="#D97706"
                  onPress={data.topPosts.length > 0 ? () => openPostDetails(data.topPosts[0].post.id) : undefined}
                />
              </View>

              {/* Chart and Secondary Metrics */}
              <View style={[styles.contentRow, isMobile && styles.mobileContentRow]}>
                <View style={[styles.leftColumn, isMobile && styles.mobileLeftColumn]}>
                  <RankingCard posts={data.topPosts} isDark={isDark} t={t} onSelect={openPostDetails} />
                </View>

                <View style={[styles.rightColumn, isMobile && styles.mobileRightColumn]}>
                  <RecentActivityCard posts={data.recentPosts} isDark={isDark} t={t} onSelect={openPostDetails} />
                  <StatsSummaryCard data={data} isDark={isDark} t={t} />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layout: {
    flex: 1,
    flexDirection: isMobile ? 'column' : 'row',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  offlineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  offlineIcon: {
    marginBottom: 16,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  offlineMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  offlineButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  offlineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerLeft: {
    flex: 1,
    gap: 12,
  },
  headerIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  headerAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  siteSection: {
    marginTop: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeSelectorButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  timeSelectorButtonFirst: {
    marginLeft: 0,
  },
  timeSelectorButtonLast: {
    marginRight: 0,
  },
  timeSelectorButtonActive: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timeSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timeSelectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dashboardGrid: {
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 24,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
    gap: 16,
  },
  metricCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  mediumCard: {
    flex: 1,
  },
  smallCard: {
    minWidth: 160,
  },
  largeCard: {
    flex: 2,
  },
  metricCardBody: {
    padding: 20,
    gap: 12,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  metricSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardAccentBar: {
    height: 4,
    width: '100%',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  contentCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeadline: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  podiumColumnInner: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  podiumColumnEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  podiumBar: {
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    position: 'relative',
  },
  podiumIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  podiumRankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  podiumLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  podiumTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  podiumMeta: {
    fontSize: 12,
  },
  rankingList: {
    gap: 12,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankingBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rankingBody: {
    flex: 1,
    gap: 2,
  },
  rankingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rankingMeta: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 13,
    textAlign: 'center',
  },
  activityList: {
    gap: 16,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  activityBullet: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBody: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityMeta: {
    fontSize: 12,
  },
  summaryGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
  },
  postRank: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  postRankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subscriptionFilterContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  subscriptionFilterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  subscriptionFilterText: {
    fontSize: 10,
    fontWeight: '500',
  },
  metricHeader: {
    marginBottom: 8,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  // Mobile Styles
  mobileHeader: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 16,
    paddingHorizontal: 16,
  },
  mobileHeaderActions: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  mobileFilterRow: {
    justifyContent: 'center',
  },
  mobileFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mobileRightActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mobileTimeSelectorContainer: {
    marginHorizontal: 16,
  },
  mobileTimeSelectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
  },
  mobileDashboardGrid: {
    paddingHorizontal: 16,
  },
  mobileMetricsRow: {
    flexDirection: 'column',
    gap: 12,
  },
  mobileContentRow: {
    flexDirection: 'column',
    gap: 16,
  },
  mobileLeftColumn: {
    flex: 1,
  },
  mobileRightColumn: {
    flex: 1,
    gap: 16,
  },

  // Enhanced Chart Styles
  enhancedChartCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  enhancedChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flex: 1,
  },
  enhancedChartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  enhancedChartSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  timePeriodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  timePeriodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minWidth: 60,
    justifyContent: 'center',
  },
  timePeriodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 14,
    maxWidth: 100,
  },
});
