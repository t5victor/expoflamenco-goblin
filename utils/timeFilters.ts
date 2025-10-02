import { DateRange } from '@/services/apiUsers';

export const DASHBOARD_TIME_FILTERS = ['24h', '7d', '30d', '90d'] as const;

export type DashboardTimeFilter = typeof DASHBOARD_TIME_FILTERS[number];

export const getDateRangeFromTimeFilter = (
  timeFilter: DashboardTimeFilter
): DateRange | undefined => {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];

  const minusDays = (days: number) => {
    const target = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return target.toISOString().split('T')[0];
  };

  switch (timeFilter) {
    case '24h':
      return {
        from: minusDays(1),
        to: endDate,
      };
    case '7d':
      return {
        from: minusDays(7),
        to: endDate,
      };
    case '30d':
      return {
        from: minusDays(30),
        to: endDate,
      };
    case '90d':
      return {
        from: minusDays(90),
        to: endDate,
      };
    default:
      return undefined;
  }
};

