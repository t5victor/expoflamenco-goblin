import { promises as fs } from 'fs';
import path from 'path';

interface HistoricalData {
  lastUpdate: string;
  sites: {
    [siteId: string]: {
      [timePeriod: string]: {
        visitors: number;
        subscriptions: number;
        revenue: number;
      };
    };
  };
}

interface CurrentMetrics {
  visitors: number;
  subscriptions: number;
  revenue: number;
}

interface ComparisonResult {
  visitors: { current: number; previous: number; change: number; percentage: string };
  subscriptions: { current: number; previous: number; change: number; percentage: string };
  revenue: { current: number; previous: number; change: number; percentage: string };
}

const HISTORICAL_FILE = path.join(process.cwd(), 'data', 'historical.json');

// Read historical data
export const getHistoricalData = async (): Promise<HistoricalData> => {
  try {
    const data = await fs.readFile(HISTORICAL_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('📊 No historical data found, creating new file');
    // Return default structure if file doesn't exist
    const defaultData: HistoricalData = {
      lastUpdate: new Date().toISOString(),
      sites: {}
    };
    await saveHistoricalData(defaultData);
    return defaultData;
  }
};

// Save historical data
export const saveHistoricalData = async (data: HistoricalData): Promise<void> => {
  try {
    await fs.mkdir(path.dirname(HISTORICAL_FILE), { recursive: true });
    await fs.writeFile(HISTORICAL_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Historical data saved');
  } catch (error) {
    console.error('❌ Failed to save historical data:', error);
  }
};

// Calculate percentage change
const calculatePercentage = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

// Compare current metrics with historical data
export const compareWithHistorical = async (
  siteId: string,
  timePeriod: string,
  currentMetrics: CurrentMetrics
): Promise<ComparisonResult> => {
  const historical = await getHistoricalData();
  
  // Get previous data or default to 0
  const previousData = historical.sites[siteId]?.[timePeriod] || {
    visitors: 0,
    subscriptions: 0,
    revenue: 0
  };

  const result: ComparisonResult = {
    visitors: {
      current: currentMetrics.visitors,
      previous: previousData.visitors,
      change: currentMetrics.visitors - previousData.visitors,
      percentage: calculatePercentage(currentMetrics.visitors, previousData.visitors)
    },
    subscriptions: {
      current: currentMetrics.subscriptions,
      previous: previousData.subscriptions,
      change: currentMetrics.subscriptions - previousData.subscriptions,
      percentage: calculatePercentage(currentMetrics.subscriptions, previousData.subscriptions)
    },
    revenue: {
      current: currentMetrics.revenue,
      previous: previousData.revenue,
      change: currentMetrics.revenue - previousData.revenue,
      percentage: calculatePercentage(currentMetrics.revenue, previousData.revenue)
    }
  };

  console.log(`📈 Comparison for ${siteId} (${timePeriod}):`, {
    visitors: result.visitors.percentage,
    subscriptions: result.subscriptions.percentage,
    revenue: result.revenue.percentage
  });

  return result;
};

// Update historical data with current metrics
export const updateHistoricalData = async (
  siteId: string,
  timePeriod: string,
  currentMetrics: CurrentMetrics
): Promise<void> => {
  const historical = await getHistoricalData();
  
  // Initialize site data if it doesn't exist
  if (!historical.sites[siteId]) {
    historical.sites[siteId] = {};
  }
  
  // Store current data as historical for next comparison
  historical.sites[siteId][timePeriod] = {
    visitors: currentMetrics.visitors,
    subscriptions: currentMetrics.subscriptions,
    revenue: currentMetrics.revenue
  };
  
  historical.lastUpdate = new Date().toISOString();
  
  await saveHistoricalData(historical);
};

// Get trend direction for UI
export const getTrendDirection = (percentage: string): 'up' | 'down' | 'neutral' => {
  if (percentage.startsWith('+')) return 'up';
  if (percentage.startsWith('-')) return 'down';
  return 'neutral';
};
