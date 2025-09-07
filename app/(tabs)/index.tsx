import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

// Mock analytics data for detailed view
const mockAnalyticsData = {
  weeklyVisitors: [
    { day: 'Mon', visitors: 245 },
    { day: 'Tue', visitors: 312 },
    { day: 'Wed', visitors: 278 },
    { day: 'Thu', visitors: 396 },
    { day: 'Fri', visitors: 442 },
    { day: 'Sat', visitors: 518 },
    { day: 'Sun', visitors: 389 },
  ],
  topPages: [
    { page: '/flamenco-courses', views: 1247, percentage: 28.5 },
    { page: '/events', views: 892, percentage: 20.4 },
    { page: '/about', views: 673, percentage: 15.4 },
    { page: '/contact', views: 445, percentage: 10.2 },
    { page: '/blog', views: 312, percentage: 7.1 },
  ],
  userSources: [
    { source: 'Organic Search', users: 1847, percentage: 45.2 },
    { source: 'Direct', users: 892, percentage: 21.8 },
    { source: 'Social Media', users: 673, percentage: 16.5 },
    { source: 'Email', users: 445, percentage: 10.9 },
    { source: 'Referral', users: 231, percentage: 5.6 },
  ]
};

interface AnalyticsCardProps {
  title: string;
  children: React.ReactNode;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderColor: isDark ? '#333' : '#E0E0E0'
      }
    ]}>
      <Text style={[
        styles.cardTitle,
        { color: isDark ? '#FFFFFF' : '#333333' }
      ]}>
        {title}
      </Text>
      {children}
    </View>
  );
};

interface SimpleBarChartProps {
  data: Array<{ day: string; visitors: number }>;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const maxValue = Math.max(...data.map(d => d.visitors));

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <Text style={[
            styles.barValue,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            {item.visitors}
          </Text>
          <View 
            style={[
              styles.bar,
              { 
                height: (item.visitors / maxValue) * 100,
                backgroundColor: '#4CAF50'
              }
            ]} 
          />
          <Text style={[
            styles.barLabel,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            {item.day}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F5F5F5' }
    ]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.headerTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Analytics Overview
          </Text>
          <Text style={[
            styles.headerSubtitle,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            Detailed insights from MonsterInsights
          </Text>
        </View>

        {/* Weekly Visitors Chart */}
        <View style={styles.section}>
          <AnalyticsCard title="Weekly Visitors">
            <SimpleBarChart data={mockAnalyticsData.weeklyVisitors} />
          </AnalyticsCard>
        </View>

        {/* Top Pages */}
        <View style={styles.section}>
          <AnalyticsCard title="Top Pages This Week">
            <View style={styles.listContainer}>
              {mockAnalyticsData.topPages.map((page, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={[
                      styles.listItemTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {page.page}
                    </Text>
                    <Text style={[
                      styles.listItemSubtitle,
                      { color: isDark ? '#CCCCCC' : '#666666' }
                    ]}>
                      {page.views.toLocaleString()} views
                    </Text>
                  </View>
                  <Text style={[
                    styles.listItemPercentage,
                    { color: isDark ? '#4CAF50' : '#2E7D32' }
                  ]}>
                    {page.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </AnalyticsCard>
        </View>

        {/* User Sources */}
        <View style={styles.section}>
          <AnalyticsCard title="Traffic Sources">
            <View style={styles.listContainer}>
              {mockAnalyticsData.userSources.map((source, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={[
                      styles.listItemTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {source.source}
                    </Text>
                    <Text style={[
                      styles.listItemSubtitle,
                      { color: isDark ? '#CCCCCC' : '#666666' }
                    ]}>
                      {source.users.toLocaleString()} users
                    </Text>
                  </View>
                  <Text style={[
                    styles.listItemPercentage,
                    { color: isDark ? '#2196F3' : '#1976D2' }
                  ]}>
                    {source.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </AnalyticsCard>
        </View>

        {/* API Integration Info */}
        <View style={styles.section}>
          <AnalyticsCard title="Data Integration">
            <Text style={[
              styles.infoText,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              This analytics view will integrate with:
              {'\n\n'}• MonsterInsights for detailed website analytics
              {'\n'}• Google Analytics API for real-time data
              {'\n'}• FluentCRM for user engagement metrics
              {'\n'}• Paid Memberships Pro for subscription analytics
              {'\n\n'}Configure your API credentials in the Settings tab to display live data.
            </Text>
          </AnalyticsCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    marginVertical: 4,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  barValue: {
    fontSize: 10,
    marginBottom: 4,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listItemLeft: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
  },
  listItemPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
