import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';

interface SubsChartProps {
  subsData: Array<{ day: string; subscriptions: number }>;
  timePeriod: string;
  siteId: string;
}

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

export const SubsChart: React.FC<SubsChartProps> = ({ 
  subsData, 
  timePeriod, 
  siteId 
}) => {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';

  // Generate appropriate labels based on time period
  const getChartLabels = () => {
    switch (timePeriod) {
      case '24h':
        return ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'];
      case '7d':
        return subsData.map(item => item.day.substring(0, 3));
      case '30d':
        return ['W1', 'W2', 'W3', 'W4'];
      case '90d':
        return ['M1', 'M2', 'M3'];
      default:
        return subsData.map(item => item.day.substring(0, 3));
    }
  };

  // Generate chart data with labels
  const getChartData = () => {
    let values: number[];
    
    switch (timePeriod) {
      case '24h':
        // Hourly subscription data simulation
        const baseHourly = subsData[0]?.subscriptions || 50;
        values = [
          Math.floor(baseHourly * 0.1), // 6AM - very low
          Math.floor(baseHourly * 0.3), // 9AM - low
          Math.floor(baseHourly * 0.8), // 12PM - moderate
          Math.floor(baseHourly * 1.2), // 3PM - high
          Math.floor(baseHourly * 0.9), // 6PM - moderate
          Math.floor(baseHourly * 0.6), // 9PM - low
          Math.floor(baseHourly * 0.2), // 12AM - very low
        ];
        break;
      case '7d':
        values = subsData.map(item => item.subscriptions);
        break;
      case '30d':
        // Weekly aggregation
        const baseWeekly = subsData.reduce((sum, item) => sum + item.subscriptions, 0);
        values = [
          Math.floor(baseWeekly * 0.7),
          Math.floor(baseWeekly * 1.0),
          Math.floor(baseWeekly * 1.1),
          Math.floor(baseWeekly * 1.3),
        ];
        break;
      case '90d':
        // Monthly aggregation
        const baseMonthly = subsData.reduce((sum, item) => sum + item.subscriptions, 0) * 4;
        values = [
          Math.floor(baseMonthly * 0.8),
          Math.floor(baseMonthly * 1.1),
          Math.floor(baseMonthly * 1.2),
        ];
        break;
      default:
        values = subsData.map(item => item.subscriptions);
    }
    
    return values;
  };

  const chartTitle = () => {
    switch (timePeriod) {
      case '24h': return 'Hourly Subscriptions';
      case '7d': return 'Weekly Subscriptions';
      case '30d': return 'Monthly Subscriptions';
      case '90d': return 'Quarterly Subscriptions';
      default: return 'Subscription Overview';
    }
  };

  const labels = getChartLabels();
  const data = getChartData();

  const chartConfig = {
    backgroundColor: isDark ? '#1F2937' : '#ffffff',
    backgroundGradientFrom: isDark ? '#1F2937' : '#ffffff',
    backgroundGradientTo: isDark ? '#1F2937' : '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(59, 130, 246, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: isDark ? '#3B82F6' : '#2563EB',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: isDark ? '#374151' : '#E5E7EB',
    },
  };

  const chartWidth = screenWidth - 60;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1F2937' : 'white' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          {chartTitle()}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {siteId === 'all' ? t('allSites') || 'All Sites' : siteId.toUpperCase()} • {timePeriod}
        </Text>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: data,
                color: (opacity = 1) => isDark ? `rgba(59, 130, 246, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
                strokeWidth: 3,
              },
            ],
          }}
          width={chartWidth}
          height={200}
          chartConfig={chartConfig}
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
          formatYLabel={(value) => `${(parseInt(value) / 1000).toFixed(0)}k`}
        />
      </View>
      
      <View style={[styles.stats, { borderTopColor: isDark ? '#374151' : '#E5E7EB' }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {Math.max(...data).toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Peak
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {Math.round(data.reduce((a, b) => a + b, 0) / data.length).toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Average
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {data.reduce((a, b) => a + b, 0).toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Total
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginVertical: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
