import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import React, { useState, useEffect } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '@/components/Sidebar';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { Feather } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { authorAnalyticsService, AuthorAnalytics } from '@/services/authorAnalytics';

// Using AuthorAnalytics interface from authorAnalytics service
type DashboardData = AuthorAnalytics;

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;


interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: keyof typeof Feather.glyphMap;
  size?: 'small' | 'medium' | 'large';
  accentColor?: string;
}

interface PostsCardProps {
  data: DashboardData;
  timeFilter: string;
  t: any;
}

const PostsCard: React.FC<PostsCardProps> = ({
  data,
  timeFilter,
  t
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[
      styles.metricCard,
      styles.mediumCard,
      {
        backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
        borderColor: isDark ? '#374151' : '#E5E7EB'
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <IconSymbol name="doc" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[
            styles.cardTitle,
            { color: isDark ? '#D1D5DB' : '#374151' }
          ]}>
            {`${t(`timePeriods.${timeFilter}`)} ${t('dashboard.postsCount')}`}
          </Text>
        </View>
      </View>

      <Text style={[
        styles.cardValue,
        { color: isDark ? '#FFFFFF' : '#111827' }
      ]}>
        {data.totalPosts.toLocaleString()}
      </Text>

      <Text style={[
        styles.cardSubtitle,
        { color: isDark ? '#9CA3AF' : '#6B7280' }
      ]}>
        {t('dashboard.postsTotalDesc')}
      </Text>

      {data.comparison?.posts && (
        <View style={[
          styles.trendBadge,
          {
            backgroundColor: data.comparison.posts.trend === 'up' ? '#10B981' :
                           data.comparison.posts.trend === 'down' ? '#EF4444' : '#6B7280'
          }
        ]}>
          <Text style={[styles.trendText, { color: '#FFFFFF' }]}>
            {data.comparison.posts.trend === 'up' ? '↗' :
             data.comparison.posts.trend === 'down' ? '↘' : '→'} {data.comparison.posts.percentage}
          </Text>
        </View>
      )}
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
  accentColor = '#6B7280'
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTrendColor = () => {
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return '#6B7280';
  };

  return (
    <View style={[
      styles.metricCard,
      styles[`${size}Card`],
      {
        backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
        borderColor: accentColor + '20',
        shadowColor: accentColor,
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: accentColor + '15' }
          ]}>
            <IconSymbol name={icon} size={18} color={accentColor} />
          </View>
          <Text style={[
            styles.cardTitle,
            { color: isDark ? '#D1D5DB' : '#374151' }
          ]}>
            {title}
          </Text>
        </View>
      </View>
      
      <Text style={[
        styles.cardValue, 
        { color: isDark ? '#FFFFFF' : '#111827' }
      ]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      
      {subtitle && (
        <Text style={[
          styles.cardSubtitle, 
          { color: isDark ? '#9CA3AF' : '#6B7280' }
        ]}>
          {subtitle}
        </Text>
      )}
      
      {trend && trendValue && (
        <View style={[
          styles.trendBadge,
          { backgroundColor: getTrendColor() }
        ]}>
          <Feather 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'minus'} 
            size={12} 
            color="white" 
          />
          <Text style={styles.trendText}>
            {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
};


// Helper function to get appropriate labels based on time period
const getTimePeriodLabels = (timePeriod: string, t: any) => {
  const labels = {
    '24h': {
      visitors: t('todayVisitors'),
      subscriptions: t('todaySubscriptions'), 
      revenue: t('todayRevenue')
    },
    '7d': {
      visitors: t('weeklyVisitors'),
      subscriptions: t('weeklySubscriptions'),
      revenue: t('weeklyRevenue')  
    },
    '30d': {
      visitors: t('monthlyVisitors'),
      subscriptions: t('monthlySubscriptions'),
      revenue: t('monthlyRevenue')
    },
    '90d': {
      visitors: t('quarterlyVisitors'),
      subscriptions: t('quarterlySubscriptions'), 
      revenue: t('quarterlyRevenue')
    }
  };
  return labels[timePeriod as keyof typeof labels] || labels['30d'];
};

export default function AuthorDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('30d');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const isDark = colorScheme === 'dark';
  const isDesktop = screenWidth >= 768;

  useEffect(() => {
    if (user) {
      loadAuthorData();
    }
  }, [user, timeFilter]);

  const loadAuthorData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🚀 Fetching analytics for author:', user.userId);
      const authorData = await authorAnalyticsService.getAuthorAnalytics(
        user.userId,
        timeFilter,
        user.token
      );
      console.log('✅ Author analytics loaded:', authorData);
      setData(authorData);
    } catch (error) {
      console.error('❌ Author analytics error:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        userId: user.userId
      });
      // Set data to null on error - will show ERROR in UI
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadAuthorData();
    setRefreshing(false);
  }, [user, timeFilter]);

  const timeFilters = [
    { id: '24h', label: '24h' },
    { id: '7d', label: '7d' },
    { id: '30d', label: '30d' },
    { id: '90d', label: '90d' },
  ];

  const subscriptionFilters = [
    { id: 'all', label: t('allSubscriptions') },
    { id: 'free', label: t('fanSubscriptions') },
    { id: 'paid', label: t('vipSubscriptions') },
  ];

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
                    onPress={() => setTimeFilter(filter.id)}
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

            {/* Main Dashboard Grid */}
            <View style={[styles.dashboardGrid, isMobile && styles.mobileDashboardGrid]}>
              {/* Key Metrics Row */}
              <View style={[styles.metricsRow, isMobile && styles.mobileMetricsRow]}>
                <MetricCard
                  title={t('dashboard.totalViews')}
                  value={data.totalViews.toLocaleString()}
                  subtitle={`${t('dashboard.viewsTotal')} (${t(`timePeriods.${timeFilter}`)})`}
                  trend={data.comparison?.views.trend || 'neutral'}
                  trendValue={data.comparison?.views.percentage || '0%'}
                  icon="eye"
                  size="medium"
                  accentColor="#DA2B1F"
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
                  icon="arrow.up.circle"
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
                  accentColor="#F59E0B"
                />
              </View>

              {/* Chart and Secondary Metrics */}
              <View style={[styles.contentRow, isMobile && styles.mobileContentRow]}>
                <View style={[styles.leftColumn, isMobile && styles.mobileLeftColumn]}>
                  {/* Top Posts List */}
                  <View style={[
                    styles.chartCard,
                    { backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF' }
                  ]}>
                    <Text style={[
                      styles.chartTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      Artículos Más Vistos
                    </Text>
                    {data.topPosts.slice(0, 5).map((post, index) => (
                      <View key={post.post.id} style={styles.postItem}>
                        <View style={styles.postInfo}>
                          <Text style={[
                            styles.postTitle,
                            { color: isDark ? '#D1D5DB' : '#374151' }
                          ]} numberOfLines={1}>
                            {post.post.title.rendered}
                          </Text>
                          <Text style={[
                            styles.postViews,
                            { color: isDark ? '#9CA3AF' : '#6B7280' }
                          ]}>
                            {post.views.toLocaleString()} vistas
                          </Text>
                        </View>
                        <View style={[
                          styles.postRank,
                          { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                        ]}>
                          <Text style={[
                            styles.postRankText,
                            { color: isDark ? '#FFFFFF' : '#374151' }
                          ]}>
                            #{index + 1}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                </View>
                
                <View style={[styles.rightColumn, isMobile && styles.mobileRightColumn]}>
                  <View style={styles.rightMetrics}>
                    <MetricCard
                      title={t('dashboard.articlesRecentTitle')}
                      value={data.recentPosts.length.toString()}
                      subtitle={t('dashboard.articlesRecentSubtitle')}
                      trend="neutral"
                      trendValue="N/A"
                      icon="clock"
                      size="small"
                    />
                    <MetricCard
                      title={t('dashboard.topPositionTitle')}
                      value={data.topPosts.length > 0 ? "1" : "N/A"}
                      subtitle={t('dashboard.topPositionSubtitle')}
                      trend="up"
                      trendValue="Top"
                      icon="star.fill"
                      size="small"
                    />
                  </View>

                  <View style={[
                    styles.topCountriesCard,
                    {
                      backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E5E7EB'
                    }
                  ]}>
                    <Text style={[
                      styles.sideCardTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {t('dashboard.articlesRecent')}
                    </Text>
                    {data.recentPosts.slice(0, 5).map((post, index) => (
                      <View key={post.id} style={styles.postItem}>
                        <View style={styles.postInfo}>
                          <Text style={[
                            styles.postTitle,
                            { color: isDark ? '#D1D5DB' : '#374151' }
                          ]} numberOfLines={2}>
                            {post.title.rendered}
                          </Text>
                          <Text style={[
                            styles.postViews,
                            { color: isDark ? '#9CA3AF' : '#6B7280' }
                          ]}>
                            {new Date(post.date).toLocaleDateString('es-ES')}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={[
                    styles.alertsCard,
                    {
                      backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E5E7EB'
                    }
                  ]}>
                    <Text style={[
                      styles.sideCardTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {t('dashboard.statsSummary')}
                    </Text>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
                      <Text style={[
                        styles.activityText,
                        { color: isDark ? '#D1D5DB' : '#374151' }
                      ]}>
                        {data.totalPosts} {t('dashboard.articlesCount')}
                      </Text>
                    </View>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#DA2B1F' }]} />
                      <Text style={[
                        styles.activityText,
                        { color: isDark ? '#D1D5DB' : '#374151' }
                      ]}>
                        {data.totalViews.toLocaleString()} {t('dashboard.totalViewsCount')}
                      </Text>
                    </View>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={[
                        styles.activityText,
                        { color: isDark ? '#D1D5DB' : '#374151' }
                      ]}>
                        {data.avgViewsPerPost.toFixed(1)} {t('dashboard.avgViewsPerArticle')}
                      </Text>
                    </View>
                  </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
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
  rightMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    borderRightColor: 'rgba(0, 0, 0, 0.15)',
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
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  trendText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  chartCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 0,
    marginBottom: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    borderRightColor: 'rgba(0, 0, 0, 0.15)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartAction: {
    padding: 4,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginVertical: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },
  barValue: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '500',
  },
  secondaryMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  topCountriesCard: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  alertsCard: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  sideCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  countryVisits: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activityText: {
    fontSize: 12,
    flex: 1,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  postInfo: {
    flex: 1,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  postViews: {
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
  },
});