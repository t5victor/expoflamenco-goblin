import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';

interface TrafficChartProps {
  weeklyData: Array<{ day: string; visitors: number }>;
  timePeriod: string;
  siteId: string;
}

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

export const TrafficChart: React.FC<TrafficChartProps> = ({ 
  weeklyData, 
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
        return weeklyData.map(item => item.day);
      case '30d':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case '90d':
        return ['Month 1', 'Month 2', 'Month 3'];
      default:
        return weeklyData.map(item => item.day);
    }
  };

  // Generate chart data with labels
  const getChartData = () => {
    const labels = getChartLabels();
    let values: number[];
    
    switch (timePeriod) {
      case '24h':
        // Hourly data simulation
        const baseHourly = weeklyData[0]?.visitors || 1000;
        values = [
          Math.floor(baseHourly * 0.3), // 6AM - low
          Math.floor(baseHourly * 0.5), // 9AM - moderate
          Math.floor(baseHourly * 0.8), // 12PM - high
          Math.floor(baseHourly * 0.9), // 3PM - peak
          Math.floor(baseHourly * 0.7), // 6PM - moderate
          Math.floor(baseHourly * 0.4), // 9PM - low
          Math.floor(baseHourly * 0.2), // 12AM - very low
        ];
        break;
      case '7d':
        values = weeklyData.map(item => item.visitors);
        break;
      case '30d':
        // Weekly aggregation
        const baseWeekly = weeklyData.reduce((sum, item) => sum + item.visitors, 0);
        values = [
          Math.floor(baseWeekly * 0.8),
          Math.floor(baseWeekly * 1.1),
          Math.floor(baseWeekly * 0.9),
          Math.floor(baseWeekly * 1.2),
        ];
        break;
      case '90d':
        // Monthly aggregation
        const baseMonthly = weeklyData.reduce((sum, item) => sum + item.visitors, 0) * 4;
        values = [
          Math.floor(baseMonthly * 0.9),
          Math.floor(baseMonthly * 1.0),
          Math.floor(baseMonthly * 1.1),
        ];
        break;
      default:
        values = weeklyData.map(item => item.visitors);
    }
    
    return labels.map((label, index) => ({
      name: label,
      visitors: values[index] || 0
    }));
  };

  const chartTitle = () => {
    switch (timePeriod) {
      case '24h': return t('hourlyTraffic') || 'Hourly Traffic';
      case '7d': return t('weeklyTraffic') || 'Weekly Traffic';
      case '30d': return t('monthlyTraffic') || 'Monthly Traffic';
      case '90d': return t('quarterlyTraffic') || 'Quarterly Traffic';
      default: return t('trafficOverview') || 'Traffic Overview';
    }
  };

  const chartData = getChartData();
  const desiredTickCount = isMobile ? 4 : 6;
  const xAxisTicks = (() => {
    if (chartData.length === 0) {
      return [] as string[];
    }

    if (chartData.length <= desiredTickCount) {
      return chartData.map((point) => point.name);
    }

    const ticks: string[] = [];
    const step = Math.max(1, Math.floor(chartData.length / (desiredTickCount - 1)));

    for (let index = 0; index < chartData.length; index += step) {
      const label = chartData[index].name;
      if (ticks[ticks.length - 1] !== label) {
        ticks.push(label);
      }
    }

    const lastLabel = chartData[chartData.length - 1].name;
    if (ticks[ticks.length - 1] !== lastLabel) {
      ticks.push(lastLabel);
    }

    return ticks;
  })();

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
      
      <View style={[styles.chartContainer, isMobile && styles.mobileChartContainer]}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart 
            data={chartData}
            margin={isMobile ? { top: 5, right: 5, left: 5, bottom: 5 } : undefined}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#374151' : '#E5E7EB'} 
            />
            <XAxis 
              dataKey="name" 
              ticks={xAxisTicks}
              interval={0}
              allowDuplicatedCategory={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280', fontFamily: 'System' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280', fontFamily: 'System' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              width={isMobile ? 35 : undefined}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1F2937' : 'white',
                border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: isDark ? '#FFFFFF' : '#111827'
              }}
              formatter={(value: any) => [value.toLocaleString(), 'Visitors']}
            />
            <Line 
              type="monotone" 
              dataKey="visitors" 
              stroke={isDark ? '#10B981' : '#059669'}
              strokeWidth={3}
              dot={{ fill: isDark ? '#10B981' : '#059669', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: isDark ? '#10B981' : '#059669', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {Math.max(...chartData.map(d => d.visitors)).toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Peak
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {Math.round(chartData.reduce((a, b) => a + b.visitors, 0) / chartData.length).toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Average
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {chartData.reduce((a, b) => a + b.visitors, 0).toLocaleString()}
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
    borderRadius: 16,
    height: 200,
  },
  mobileChartContainer: {
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
