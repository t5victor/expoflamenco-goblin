import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

// Mock data - will be replaced with real API calls
const mockData = {
  todayVisitors: 247,
  yesterdayVisitors: 189,
  newSubscriptions: 12,
  totalSubscriptions: 1543,
  monthlyRevenue: 3429,
  activeMembers: 892,
};

interface WidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const DashboardWidget: React.FC<WidgetProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  color = '#4A90E2' 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTrendColor = () => {
    if (trend === 'up') return '#4CAF50';
    if (trend === 'down') return '#F44336';
    return '#757575';
  };

  return (
    <View style={[
      styles.widget, 
      { 
        backgroundColor: isDark ? '#1E1E1E' : '#eeeff4',
        borderColor: isDark ? '#333' : 'white'
      }
    ]}>
      <View style={styles.widgetHeader}>
        <Text style={[
          styles.widgetTitle, 
          { color: isDark ? '#FFFFFF' : '#333333' }
        ]}>
          {title}
        </Text>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
      </View>
      
      <Text style={[
        styles.widgetValue, 
        { color: isDark ? '#FFFFFF' : '#000000' }
      ]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      
      {subtitle && (
        <Text style={[
          styles.widgetSubtitle, 
          { color: isDark ? '#CCCCCC' : '#666666' }
        ]}>
          {subtitle}
        </Text>
      )}
      
      {trend && trendValue && (
        <View style={[
          styles.trendBadge,
          { backgroundColor: trend === 'up' ? '#7ecc91' : (trend === 'down' ? '#F44336' : '#757575') }
        ]}>
          <Text style={[
            styles.trendText,
            { color: 'white' }
          ]}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(mockData);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setData({
        ...mockData,
        todayVisitors: Math.floor(Math.random() * 100) + 200,
        newSubscriptions: Math.floor(Math.random() * 10) + 5,
      });
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? '#000000' : '#e7eaf1' }
    ]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.headerTitle, 
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Expoflamenco Dashboard
          </Text>
          <Text style={[
            styles.headerSubtitle, 
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Main Metrics */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle, 
            { color: isDark ? '#FFFFFF' : '#333333' }
          ]}>
            Today's Overview
          </Text>
          
          <View style={styles.widgetGrid}>
            <DashboardWidget
              title="Today's Visitors"
              value={data.todayVisitors}
              subtitle="Site visitors today"
              trend="up"
              trendValue="+30.7% vs yesterday"
              color="#4CAF50"
            />
            
            <DashboardWidget
              title="New Subscriptions"
              value={data.newSubscriptions}
              subtitle="Via Paid Memberships Pro"
              trend="up"
              trendValue="+15.2% vs yesterday"
              color="#2196F3"
            />
          </View>
        </View>

        {/* Secondary Metrics */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle, 
            { color: isDark ? '#FFFFFF' : '#333333' }
          ]}>
            Overview
          </Text>
          
          <View style={styles.widgetGrid}>
            <DashboardWidget
              title="Total Subscriptions"
              value={data.totalSubscriptions}
              subtitle="All time members"
              color="#FF9800"
            />
            
            <DashboardWidget
              title="Monthly Revenue"
              value={`€${data.monthlyRevenue}`}
              subtitle="This month"
              trend="up"
              trendValue="+8.3% vs last month"
              color="#9C27B0"
            />
            
            <DashboardWidget
              title="Active Members"
              value={data.activeMembers}
              subtitle="Currently active"
              color="#795548"
            />
            
            <DashboardWidget
              title="Yesterday's Visitors"
              value={data.yesterdayVisitors}
              subtitle="Previous day traffic"
              color="#607D8B"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle, 
            { color: isDark ? '#FFFFFF' : '#333333' }
          ]}>
            Quick Actions
          </Text>
          
           <View style={[
             styles.quickActionsCard,
             { 
               backgroundColor: isDark ? '#1E1E1E' : '#f3f4f8',
               borderColor: isDark ? '#333' : 'white'
             }
           ]}>
            <Text style={[
              styles.quickActionsText,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              • Export today's analytics report{'\n'}
              • View detailed subscription analytics{'\n'}
              • Manage FluentCRM campaigns{'\n'}
              • Access MonsterInsights detailed reports
            </Text>
          </View>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  widget: {
    width: screenWidth < 768 ? '100%' : '48%',
    minWidth: screenWidth < 768 ? screenWidth - 40 : 280,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  colorIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  widgetValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  widgetSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickActionsText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
