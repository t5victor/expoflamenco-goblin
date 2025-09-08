import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sidebar } from '@/components/Sidebar';
import { Feather } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const mockAnalyticsData = {
  weeklyVisitors: [
    { day: 'Mon', visitors: 3245, pageViews: 8234, bounceRate: 45.2 },
    { day: 'Tue', visitors: 4312, pageViews: 9123, bounceRate: 42.1 },
    { day: 'Wed', visitors: 3878, pageViews: 7654, bounceRate: 48.3 },
    { day: 'Thu', visitors: 5396, pageViews: 11234, bounceRate: 38.9 },
    { day: 'Fri', visitors: 4442, pageViews: 9876, bounceRate: 41.7 },
    { day: 'Sat', visitors: 2018, pageViews: 4567, bounceRate: 52.1 },
    { day: 'Sun', visitors: 1756, pageViews: 3890, bounceRate: 55.3 }
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

  const maxVisitors = Math.max(...mockAnalyticsData.weeklyVisitors.map(d => d.visitors));

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
                  Detailed insights from MonsterInsights & Google Analytics
                </Text>
              </View>
            </View>

            <View style={styles.dashboardGrid}>
              {/* Weekly Traffic Chart */}
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
                    Weekly Traffic Breakdown
                  </Text>
                  <Feather name="more-horizontal" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </View>
                
                <View style={styles.chart}>
                  {mockAnalyticsData.weeklyVisitors.map((item, index) => (
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
                            height: (item.visitors / maxVisitors) * 100,
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
                      <Text style={[
                        styles.bounceRate,
                        { color: isDark ? '#EF4444' : '#DC2626' }
                      ]}>
                        {item.bounceRate}%
                      </Text>
                    </View>
                  ))}
                </View>
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
  chartCard: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
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
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
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
  bounceRate: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: '600',
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
