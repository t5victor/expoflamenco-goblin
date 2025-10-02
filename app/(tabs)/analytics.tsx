import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sidebar } from '@/components/Sidebar';
import { LineChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import { apiService } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');

const mockAnalyticsData = {
  weeklyData: [
    { day: 'Mon', visitors: 3245 },
    { day: 'Tue', visitors: 4312 },
    { day: 'Wed', visitors: 3878 },
    { day: 'Thu', visitors: 5396 },
    { day: 'Fri', visitors: 4442 },
    { day: 'Sat', visitors: 2018 },
    { day: 'Sun', visitors: 1756 }
  ],
  topPages: [
    { page: '/flamenco-courses', views: 12470, avgTime: '4:32', exitRate: 23.4 },
    { page: '/events', views: 8920, avgTime: '3:15', exitRate: 34.2 },
    { page: '/about', views: 6730, avgTime: '2:45', exitRate: 45.1 },
    { page: '/contact', views: 4450, avgTime: '1:55', exitRate: 67.8 },
    { page: '/blog', views: 3120, avgTime: '5:20', exitRate: 28.9 }
  ],
  trafficSources: [
    { source: 'Organic Search', visitors: 18470, percentage: 45.2, trend: 'up' },
    { source: 'Direct', visitors: 8920, percentage: 21.8, trend: 'down' },
    { source: 'Social Media', visitors: 6730, percentage: 16.5, trend: 'up' },
    { source: 'Email', visitors: 4450, percentage: 10.9, trend: 'up' },
    { source: 'Referral', visitors: 2310, percentage: 5.6, trend: 'neutral' }
  ]
};

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isDesktop = screenWidth >= 768;

  // State for time period and chart data
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('7d');
  const [chartData, setChartData] = useState<any>(mockAnalyticsData);
  const [isLoading, setIsLoading] = useState(false);

  const timePeriods = [
    { key: '24h', label: '24H', icon: 'clock' },
    { key: '7d', label: '7D', icon: 'calendar' },
    { key: '30d', label: '30D', icon: 'calendar' },
    { key: '90d', label: '90D', icon: 'calendar' },
  ];

  // Fetch chart data when time period changes
  useEffect(() => {
    fetchChartData();
  }, [selectedTimePeriod]);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      // In a real app, you'd get the actual token and site ID
      // For now, we'll use mock data that's enhanced
      const data = await apiService.getDashboardData('revista', selectedTimePeriod, 'mock-token');
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Fallback to mock data
      setChartData(mockAnalyticsData);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <View style={styles.layout}>
        <Sidebar activeTab="analytics" onTabChange={() => {}} />
        
        <View style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[
                  styles.headerTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Analytics
                </Text>
                <Text style={[
                  styles.headerSubtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' }
                ]}>
                  Detailed insights
                </Text>
              </View>
            </View>

            <View style={styles.dashboardGrid}>
              {/* Enhanced Traffic Chart with Time Period Selector */}
              <View style={[
                styles.enhancedChartCard,
                {
                  backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB'
                }
              ]}>
                <View style={styles.enhancedChartHeader}>
                  <View style={styles.chartTitleContainer}>
                    <Text style={[
                      styles.chartTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      Traffic Analytics
                    </Text>
                    <Text style={[
                      styles.chartSubtitle,
                      { color: isDark ? '#9CA3AF' : '#6B7280' }
                    ]}>
                      Real-time visitor insights
                    </Text>
                  </View>
                  <Feather name="more-horizontal" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </View>

                {/* Time Period Selector */}
                <View style={styles.timePeriodSelector}>
                  {timePeriods.map((period) => (
                    <TouchableOpacity
                      key={period.key}
                      style={[
                        styles.timePeriodButton,
                        {
                          backgroundColor: selectedTimePeriod === period.key
                            ? '#DA2B1F'
                            : (isDark ? '#374151' : '#F3F4F6'),
                          borderColor: selectedTimePeriod === period.key
                            ? '#DA2B1F'
                            : (isDark ? '#4B5563' : '#E5E7EB'),
                        }
                      ]}
                      onPress={() => setSelectedTimePeriod(period.key)}
                    >
                      <Feather
                        name={period.icon as any}
                        size={14}
                        color={selectedTimePeriod === period.key ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#6B7280')}
                      />
                      <Text style={[
                        styles.timePeriodText,
                        {
                          color: selectedTimePeriod === period.key ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#374151')
                        }
                      ]}>
                        {period.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Enhanced Chart */}
                <View style={styles.chartContainer}>
                  {chartData && chartData.weeklyData ? (
                    <LineChart
                      data={{
                        labels: chartData.weeklyData.map((item: any) => item.day.substring(0, 3)),
                        datasets: [
                          {
                            data: chartData.weeklyData.map((item: any) => item.visitors),
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
                        {isLoading ? 'Loading chart data...' : 'No data available'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Chart Stats */}
                {chartData && chartData.weeklyData && (
                  <View style={[styles.chartStats, { borderTopColor: isDark ? '#374151' : '#E5E7EB' }]}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        {Math.max(...chartData.weeklyData.map((item: any) => item.visitors)).toLocaleString()}
                      </Text>
                      <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Peak Visitors
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        {Math.round(chartData.weeklyData.reduce((sum: number, item: any) => sum + item.visitors, 0) / chartData.weeklyData.length).toLocaleString()}
                      </Text>
                      <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Daily Average
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        {chartData.weeklyData.reduce((sum: number, item: any) => sum + item.visitors, 0).toLocaleString()}
                      </Text>
                      <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Total Period
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Analytics Grid */}
              <View style={styles.analyticsGrid}>
                {/* Top Pages */}
                <View style={[
                  styles.analyticsCard,
                  { 
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}>
                  <Text style={[
                    styles.cardTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    Top Pages
                  </Text>
                  
                  {mockAnalyticsData.topPages.map((page, index) => (
                    <View key={index} style={styles.pageRow}>
                      <View style={styles.pageLeft}>
                        <Text style={[
                          styles.pagePath,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {page.page}
                        </Text>
                        <Text style={[
                          styles.pageViews,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          {page.views.toLocaleString()} views
                        </Text>
                      </View>
                      <View style={styles.pageRight}>
                        <Text style={[
                          styles.avgTime,
                          { color: isDark ? '#10B981' : '#059669' }
                        ]}>
                          {page.avgTime}
                        </Text>
                        <Text style={[
                          styles.exitRate,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          {page.exitRate}% exit
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Traffic Sources */}
                <View style={[
                  styles.analyticsCard,
                  { 
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}>
                  <Text style={[
                    styles.cardTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    Traffic Sources
                  </Text>
                  
                  {mockAnalyticsData.trafficSources.map((source, index) => (
                    <View key={index} style={styles.sourceRow}>
                      <View style={styles.sourceLeft}>
                        <Text style={[
                          styles.sourceName,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {source.source}
                        </Text>
                        <Text style={[
                          styles.sourceVisitors,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          {source.visitors.toLocaleString()} visitors
                        </Text>
                      </View>
                      <View style={styles.sourceRight}>
                        <View style={styles.trendContainer}>
                          <Feather 
                            name={source.trend === 'up' ? 'trending-up' : source.trend === 'down' ? 'trending-down' : 'minus'}
                            size={16}
                            color={source.trend === 'up' ? '#10B981' : source.trend === 'down' ? '#EF4444' : '#6B7280'}
                          />
                          <Text style={[
                            styles.percentage,
                            { color: isDark ? '#FFFFFF' : '#111827' }
                          ]}>
                            {source.percentage}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  dashboardGrid: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
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
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  analyticsCard: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  pageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageLeft: {
    flex: 1,
  },
  pageRight: {
    alignItems: 'flex-end',
  },
  pagePath: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  pageViews: {
    fontSize: 12,
  },
  avgTime: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  exitRate: {
    fontSize: 12,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourceLeft: {
    flex: 1,
  },
  sourceRight: {
    alignItems: 'flex-end',
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  sourceVisitors: {
    fontSize: 12,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
});
