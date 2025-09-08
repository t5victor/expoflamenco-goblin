import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import React, { useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '@/components/Sidebar';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { SiteSelector } from '@/components/SiteSelector';
import { Feather } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// Mock data that changes based on selected site
const getSiteData = (siteId: string) => {
  const baseData = {
    all: {
      todayVisitors: 24247,
      yesterdayVisitors: 18923,
      newSubscriptions: 127,
      totalSubscriptions: 15438,
      monthlyRevenue: 34290,
      activeMembers: 8923,
    },
    agenda: {
      todayVisitors: 4523,
      yesterdayVisitors: 3891,
      newSubscriptions: 23,
      totalSubscriptions: 3247,
      monthlyRevenue: 5670,
      activeMembers: 2184,
    },
    espacio: {
      todayVisitors: 3891,
      yesterdayVisitors: 3456,
      newSubscriptions: 18,
      totalSubscriptions: 2891,
      monthlyRevenue: 4230,
      activeMembers: 1947,
    },
    comunidad: {
      todayVisitors: 6234,
      yesterdayVisitors: 5891,
      newSubscriptions: 34,
      totalSubscriptions: 4523,
      monthlyRevenue: 8450,
      activeMembers: 3201,
    },
    revista: {
      todayVisitors: 3456,
      yesterdayVisitors: 2987,
      newSubscriptions: 15,
      totalSubscriptions: 2156,
      monthlyRevenue: 3890,
      activeMembers: 1543,
    },
    academia: {
      todayVisitors: 2891,
      yesterdayVisitors: 2456,
      newSubscriptions: 21,
      totalSubscriptions: 1893,
      monthlyRevenue: 6750,
      activeMembers: 1289,
    },
    podcast: {
      todayVisitors: 1567,
      yesterdayVisitors: 1234,
      newSubscriptions: 8,
      totalSubscriptions: 967,
      monthlyRevenue: 2340,
      activeMembers: 678,
    },
    tv: {
      todayVisitors: 1234,
      yesterdayVisitors: 987,
      newSubscriptions: 6,
      totalSubscriptions: 761,
      monthlyRevenue: 1890,
      activeMembers: 456,
    },
  };

  return {
    ...baseData[siteId as keyof typeof baseData] || baseData.all,
    conversionRate: 3.2,
    avgSessionTime: '4m 32s',
    topCountries: [
      { name: 'Spain', visits: 8429, flag: '🇪🇸' },
      { name: 'USA', visits: 5234, flag: '🇺🇸' },
      { name: 'France', visits: 3821, flag: '🇫🇷' }
    ],
    weeklyData: [
      { day: 'Mon', visitors: 3245, revenue: 4520 },
      { day: 'Tue', visitors: 4312, revenue: 5890 },
      { day: 'Wed', visitors: 3878, revenue: 4230 },
      { day: 'Thu', visitors: 5396, revenue: 7850 },
      { day: 'Fri', visitors: 4442, revenue: 6120 },
      { day: 'Sat', visitors: 2018, revenue: 2890 },
      { day: 'Sun', visitors: 1756, revenue: 2590 }
    ]
  };
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: string;
  size?: 'small' | 'medium' | 'large';
}

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

const ChartCard: React.FC<{data: any}> = ({data}) => {
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

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('30d');
  const [selectedSite, setSelectedSite] = useState('all');
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const isDesktop = screenWidth >= 768;
  
  // Get data based on selected site
  const data = getSiteData(selectedSite);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate refresh by re-fetching data
      setRefreshing(false);
    }, 1000);
  }, []);

  const timeFilters = [
    { id: '24h', label: '24h' },
    { id: '7d', label: '7d' },
    { id: '30d', label: '30d' },
    { id: '90d', label: '90d' },
  ];

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
                  title="Today's Visitors"
                  value={data.todayVisitors}
                  subtitle="Site traffic today"
                  trend="up"
                  trendValue="+12.5%"
                  icon="eye"
                  size="medium"
                />
                
                <MetricCard
                  title="New Subscriptions"
                  value={data.newSubscriptions}
                  subtitle="Paid Memberships Pro"
                  trend="up"
                  trendValue="+8.2%"
                  icon="user-plus"
                  size="medium"
                />
                
                <MetricCard
                  title="Revenue"
                  value={`€${(data.monthlyRevenue / 1000).toFixed(1)}k`}
                  subtitle="This month"
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
                    {data.topCountries.map((country, index) => (
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
    paddingHorizontal: 24,
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
    borderRadius: 8,
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
});