import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import React, { useState, useEffect } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '@/components/Sidebar';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { SiteSelector } from '@/components/SiteSelector';
import { Feather } from '@expo/vector-icons';
import { fetchSiteData } from '@/services/api';

interface DashboardData {
  todayVisitors: number;
  yesterdayVisitors: number;
  newSubscriptions: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
  activeMembers: number;
  conversionRate: number;
  avgSessionTime: string;
  weeklyData: Array<{ day: string; visitors: number }>;
  previousWeekData: Array<{ day: string; visitors: number }>;
  topCountries: Array<{ name: string; flag: string; visits: number }>;
  timePeriod?: string;
}

const { width: screenWidth } = Dimensions.get('window');

// Fallback mock data for API errors
const getFallbackData = (siteId: string): DashboardData => {
  const baseData = {
    all: { todayVisitors: 0, yesterdayVisitors: 0, newSubscriptions: 0, totalSubscriptions: 0, monthlyRevenue: 0, activeMembers: 0 },
    agenda: { todayVisitors: 0, yesterdayVisitors: 0, newSubscriptions: 0, totalSubscriptions: 0, monthlyRevenue: 0, activeMembers: 0 },
    espacio: { todayVisitors: 0, yesterdayVisitors: 0, newSubscriptions: 0, totalSubscriptions: 0, monthlyRevenue: 0, activeMembers: 0 },
    comunidad: { todayVisitors: 0, yesterdayVisitors: 0, newSubscriptions: 0, totalSubscriptions: 0, monthlyRevenue: 0, activeMembers: 0 },
    revista: { todayVisitors: 0, yesterdayVisitors: 0, newSubscriptions: 0, totalSubscriptions: 0, monthlyRevenue: 0, activeMembers: 0 },
    academia: { todayVisitors: 0, yesterdayVisitors: 0, newSubscriptions: 0, totalSubscriptions: 0, monthlyRevenue: 0, activeMembers: 0 },
    podcast: { todayVisitors: 0, yesterdayVisitors: 0, newSubscriptions: 0, totalSubscriptions: 0, monthlyRevenue: 0, activeMembers: 0 },
    tv: { todayVisitors: 0, yesterdayVisitors: 0, newSubscriptions: 0, totalSubscriptions: 0, monthlyRevenue: 0, activeMembers: 0 },
  };

  const fallbackWeeklyData = [
    { day: 'Mon', visitors: 0 },
    { day: 'Tue', visitors: 0 },
    { day: 'Wed', visitors: 0 },
    { day: 'Thu', visitors: 0 },
    { day: 'Fri', visitors: 0 },
    { day: 'Sat', visitors: 0 },
    { day: 'Sun', visitors: 0 }
  ];

  return {
    ...baseData[siteId as keyof typeof baseData] || baseData.all,
    conversionRate: 0,
    avgSessionTime: '0m 0s',
    topCountries: [],
    weeklyData: fallbackWeeklyData,
    previousWeekData: fallbackWeeklyData
  };
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: keyof typeof Feather.glyphMap;
  size?: 'small' | 'medium' | 'large';
}

interface SubscriptionCardProps {
  data: DashboardData;
  periodLabels: any;
  timeFilter: string;
  subscriptionFilter: string;
  setSubscriptionFilter: (filter: string) => void;
  subscriptionFilters: Array<{ id: string; label: string }>;
  t: any;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  data,
  periodLabels,
  timeFilter,
  subscriptionFilter,
  setSubscriptionFilter,
  subscriptionFilters,
  t
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const getFilteredValue = () => {
    switch (subscriptionFilter) {
      case 'free': return Math.floor(data.newSubscriptions * 0.7); // 70% free
      case 'paid': return Math.floor(data.newSubscriptions * 0.3); // 30% paid
      default: return data.newSubscriptions;
    }
  };

  return (
    <View style={[styles.metricCard, { backgroundColor: isDark ? '#1F2937' : '#EEEFF4' }]}>
      <View style={styles.metricHeader}>
        <View style={styles.metricTitleRow}>
          <Feather name="user-plus" size={20} color={isDark ? '#10B981' : '#059669'} />
          <Text style={[styles.metricTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {periodLabels.subscriptions}
          </Text>
        </View>
        
        {/* Subscription Filter Dropdown */}
        <View style={styles.subscriptionFilterContainer}>
          {subscriptionFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.subscriptionFilterButton,
                {
                  backgroundColor: subscriptionFilter === filter.id 
                    ? (isDark ? '#10B981' : '#059669')
                    : (isDark ? '#374151' : '#F3F4F6'),
                },
              ]}
              onPress={() => setSubscriptionFilter(filter.id)}
            >
              <Text
                style={[
                  styles.subscriptionFilterText,
                  {
                    color: subscriptionFilter === filter.id 
                      ? '#FFFFFF'
                      : (isDark ? '#9CA3AF' : '#6B7280'),
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
        {getFilteredValue().toLocaleString()}
      </Text>
      
      <Text style={[styles.metricSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {`Users subscribed (${timeFilter})`}
      </Text>
      
      <View style={[styles.trendBadge, { backgroundColor: '#7ecc91' }]}>
        <Text style={[styles.trendText, { color: '#FFFFFF' }]}>
          ↗ +8.2%
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
  size = 'medium'
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
        borderColor: isDark ? '#374151' : '#E5E7EB'
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Feather name={icon} size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
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

const ChartCard: React.FC<{data: DashboardData}> = ({data}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const maxValue = Math.max(...data.weeklyData.map(d => d.visitors));

  return (
    <View style={[
      styles.chartCard,
      { 
        backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
        borderColor: isDark ? '#374151' : '#E5E7EB'
      }
    ]}>
      <View style={styles.chartHeader}>
        <Text style={[
          styles.chartTitle,
          { color: isDark ? '#FFFFFF' : '#111827' }
        ]}>
          Weekly Traffic Overview
        </Text>
        <TouchableOpacity style={styles.chartAction}>
          <Feather name="more-horizontal" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.chart}>
        {data.weeklyData.map((item, index) => (
          <View key={index} style={styles.barContainer}>
            <Text style={[
              styles.barValue,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              {(item.visitors / 1000).toFixed(1)}k
            </Text>
            <View 
              style={[
                styles.bar,
                { 
                  height: (item.visitors / maxValue) * 100,
                  backgroundColor: '#3B82F6'
                }
              ]} 
            />
            <Text style={[
              styles.barLabel,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              {item.day}
            </Text>
          </View>
        ))}
      </View>
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

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('30d');
  const [selectedSite, setSelectedSite] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const isDesktop = screenWidth >= 768;
  const periodLabels = getTimePeriodLabels(timeFilter, t);

  useEffect(() => {
    loadSiteData();
  }, [selectedSite, timeFilter]);

  const loadSiteData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching data for site:', selectedSite);
      const siteData = await fetchSiteData(selectedSite, timeFilter);
      console.log('✅ API Response:', siteData);
      setData(siteData);
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        site: selectedSite
      });
      // Fallback to empty data on error
      setData(getFallbackData(selectedSite));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadSiteData();
    setRefreshing(false);
  }, [selectedSite]);

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

  if (loading || !data) {
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

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <View style={styles.layout}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <View style={styles.content}>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[
                  styles.headerTitle, 
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  {t('dashboard.title')}
                </Text>
                <Text style={[
                  styles.headerSubtitle, 
                  { color: isDark ? '#9CA3AF' : '#6B7280' }
                ]}>
                  {t('dashboard.subtitle')}
                </Text>
                <View style={styles.siteSection}>
                  <SiteSelector selectedSite={selectedSite} onSiteChange={setSelectedSite} />
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <View style={styles.filterRow}>
                  {timeFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.id}
                      style={[
                        styles.filterButton,
                        { 
                          backgroundColor: timeFilter === filter.id 
                            ? '#3B82F6' 
                            : 'transparent',
                          borderColor: timeFilter === filter.id 
                            ? '#3B82F6' 
                            : (isDark ? '#374151' : '#D1D5DB')
                        }
                      ]}
                      onPress={() => setTimeFilter(filter.id)}
                    >
                      <Text style={[
                        styles.filterText,
                        { 
                          color: timeFilter === filter.id 
                            ? '#FFFFFF'
                            : (isDark ? '#9CA3AF' : '#6B7280')
                        }
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.rightActions}>
                  <LanguageDropdown />
                  
                  <TouchableOpacity style={[
                    styles.actionButton,
                    { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
                  ]}>
                    <Feather name="download" size={16} color={isDark ? '#FFFFFF' : '#374151'} />
                    <Text style={[
                      styles.actionButtonText,
                      { color: isDark ? '#FFFFFF' : '#374151' }
                    ]}>
                      {t('export')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Main Dashboard Grid */}
            <View style={styles.dashboardGrid}>
              {/* Key Metrics Row */}
              <View style={styles.metricsRow}>
                <MetricCard
                  title={periodLabels.visitors}
                  value={data.todayVisitors}
                  subtitle={`Site traffic (${timeFilter})`}
                  trend="up"
                  trendValue="+12.5%"
                  icon="eye"
                  size="medium"
                />
                
                <SubscriptionCard
                  data={data}
                  periodLabels={periodLabels}
                  timeFilter={timeFilter}
                  subscriptionFilter={subscriptionFilter}
                  setSubscriptionFilter={setSubscriptionFilter}
                  subscriptionFilters={subscriptionFilters}
                  t={t}
                />
                
                <MetricCard
                  title={periodLabels.revenue}
                  value={`€${(data.monthlyRevenue / 1000).toFixed(1)}k`}
                  subtitle={`Revenue (${timeFilter})`}
                  trend="up"
                  trendValue="+15.3%"
                  icon="dollar-sign"
                  size="medium"
                />
                
                <MetricCard
                  title="Conversion"
                  value={`${data.conversionRate}%`}
                  subtitle="Visitor to subscriber"
                  trend="down"
                  trendValue="-2.1%"
                  icon="trending-up"
                  size="medium"
                />
              </View>

              {/* Chart and Secondary Metrics */}
              <View style={styles.contentRow}>
                <View style={styles.leftColumn}>
                  <ChartCard data={data} />
                  
                  <View style={styles.secondaryMetrics}>
                    <MetricCard
                      title="Avg. Session"
                      value={data.avgSessionTime}
                      icon="clock"
                      size="small"
                    />
                    <MetricCard
                      title="Active Members"
                      value={data.activeMembers}
                      icon="users"
                      size="small"
                    />
                  </View>
                </View>
                
                <View style={styles.rightColumn}>
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
                      Top Countries
                    </Text>
                    {data.topCountries.map((country: any, index: number) => (
                      <View key={index} style={styles.countryRow}>
                        <View style={styles.countryLeft}>
                          <Text style={styles.countryFlag}>{country.flag}</Text>
                          <Text style={[
                            styles.countryName,
                            { color: isDark ? '#D1D5DB' : '#374151' }
                          ]}>
                            {country.name}
                          </Text>
                        </View>
                        <Text style={[
                          styles.countryVisits,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          {country.visits.toLocaleString()}
                        </Text>
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
                      Recent Activity
                    </Text>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
                      <Text style={[
                        styles.activityText,
                        { color: isDark ? '#D1D5DB' : '#374151' }
                      ]}>
                        12 new subscribers in last hour
                      </Text>
                    </View>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={[
                        styles.activityText,
                        { color: isDark ? '#D1D5DB' : '#374151' }
                      ]}>
                        High traffic on /courses page
                      </Text>
                    </View>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#3B82F6' }]} />
                      <Text style={[
                        styles.activityText,
                        { color: isDark ? '#D1D5DB' : '#374151' }
                      ]}>
                        Email campaign opened by 234 users
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
    flexDirection: 'row',
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
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
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
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
    gap: 8,
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
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
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
});