import React, { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth';
import { authorAnalyticsService } from '@/services/authorAnalytics';
import { DASHBOARD_TIME_FILTERS, DashboardTimeFilter } from '@/utils/timeFilters';
import { LineChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';

interface PostDetailState {
  title: string;
  excerpt?: string;
  authorName?: string;
  link?: string;
  totalViews: number;
  dailyViews: { date: string; views: number }[];
  referrers: { title: string; count: number; url?: string }[];
}

const { width: screenWidth } = Dimensions.get('window');

const mapPeriod = (value?: string): DashboardTimeFilter => {
  if (!value) return '30d';
  const allowed = DASHBOARD_TIME_FILTERS as unknown as string[];
  return allowed.includes(value) ? (value as DashboardTimeFilter) : '30d';
};

const formatDateLabel = (value: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const PostAnalyticsScreen: React.FC = () => {
  const { id, period } = useLocalSearchParams<{ id?: string; period?: string }>();
  const postId = useMemo(() => Number(id), [id]);
  const timePeriod = mapPeriod(period);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<PostDetailState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token || !postId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const analytics = await authorAnalyticsService.getPostDetailAnalytics(postId, timePeriod, user.token);
        const sortedReferrers = [...analytics.referrers]
          .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
          .slice(0, 5);

        setState({
          title: analytics.post.title?.rendered ?? `Artículo ${postId}`,
          excerpt: analytics.post.excerpt,
          authorName: analytics.post.authorName,
          link: analytics.post.link,
          totalViews: analytics.totalViews,
          dailyViews: analytics.dailyViews,
          referrers: sortedReferrers.map((item) => ({
            title: item.title,
            count: item.count,
            url: item.url,
          })),
        });
      } catch (error) {
        console.error('Failed to load post analytics:', error);
        setState(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, timePeriod, user?.token]);

  const chartConfig = {
    backgroundGradientFrom: isDark ? '#111827' : '#FFFFFF',
    backgroundGradientTo: isDark ? '#111827' : '#FFFFFF',
    color: (opacity = 1) => (isDark ? `rgba(218, 43, 31, ${opacity})` : `rgba(218, 43, 31, ${opacity})`),
    labelColor: (opacity = 1) => (isDark ? `rgba(229, 231, 235, ${opacity})` : `rgba(55, 65, 81, ${opacity})`),
    decimalPlaces: 0,
  };

  const dataPoints = useMemo(() => state?.dailyViews?.map((item) => item.views) ?? [], [state?.dailyViews]);

  const chartLabels = useMemo(() => {
    const points = state?.dailyViews ?? [];
    if (points.length === 0) return [];
    const maxLabels = Math.min(4, points.length);
    const step = Math.max(1, Math.floor(points.length / maxLabels));
    return points.map((item, index) => {
      const isLast = index === points.length - 1;
      if (index % step === 0 || isLast) {
        return formatDateLabel(item.date);
      }
      return '';
    });
  }, [state?.dailyViews]);

  const referrersToDisplay = useMemo(() => (state?.referrers ?? []).slice(0, 5), [state?.referrers]);

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F9FAFB' }] }>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderColor: isDark ? '#1E293B' : '#E2E8F0', backgroundColor: isDark ? '#111827' : '#FFFFFF' }] }>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={18} color={isDark ? '#F9FAFB' : '#1F2937'} />
          </TouchableOpacity>
          <View style={styles.headerTextGroup}>
            <Text style={[styles.headerTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]} numberOfLines={2}>
              {state?.title || 'Detalle de artículo'}
            </Text>
            {state?.authorName && (
              <Text style={[styles.headerSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }] }>
                {state.authorName}
              </Text>
            )}
          </View>
          <View style={[styles.metricPill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }] }>
            <Feather name="eye" size={14} color={isDark ? '#FACC15' : '#B45309'} />
            <Text style={[styles.metricPillText, { color: isDark ? '#FACC15' : '#B45309' }] }>
              {state?.totalViews?.toLocaleString?.() || '0'}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { borderColor: isDark ? '#1E293B' : '#E2E8F0', backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#E2E8F0' : '#0F172A' }]}>
              Evolución de visitas
            </Text>
            <Text style={[styles.sectionSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Periodo: {timePeriod.toUpperCase()}
            </Text>
          </View>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={isDark ? '#F9FAFB' : '#111827'} />
            </View>
          ) : chartLabels.length > 0 ? (
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    data: dataPoints,
                    color: (opacity = 1) => (isDark ? `rgba(248, 113, 113, ${opacity})` : `rgba(220, 38, 38, ${opacity})`),
                    strokeWidth: 3,
                  },
                ],
              }}
              width={screenWidth - 48}
              height={240}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          ) : (
            <View style={styles.emptyState}>
              <Feather name="activity" size={20} color={isDark ? '#475569' : '#CBD5F5'} />
              <Text style={[styles.emptyText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                No hay datos suficientes para este período.
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.section, { borderColor: isDark ? '#1E293B' : '#E2E8F0', backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#E2E8F0' : '#0F172A' }]}>
              Principales fuentes
            </Text>
            <Text style={[styles.sectionSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Tráfico de referencia más frecuente
            </Text>
          </View>
          <View style={styles.referrersList}>
            {referrersToDisplay.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="link" size={20} color={isDark ? '#475569' : '#CBD5F5'} />
                <Text style={[styles.emptyText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  No se registraron referrers durante el período.
                </Text>
              </View>
            ) : (
              referrersToDisplay.map((item, index) => (
                <View key={`${item.title}-${index}`} style={[styles.referrerRow, { borderBottomColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                  <View style={styles.referrerLeft}>
                    <Feather name="external-link" size={14} color={isDark ? '#F9FAFB' : '#1F2937'} />
                    <Text style={[styles.referrerTitle, { color: isDark ? '#E2E8F0' : '#0F172A' }]} numberOfLines={1}>
                      {item.title || 'Desconocido'}
                    </Text>
                  </View>
                  <Text style={[styles.referrerCount, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                    {item.count.toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {state?.excerpt && (
          <View style={[styles.section, { borderColor: isDark ? '#1E293B' : '#E2E8F0', backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#E2E8F0' : '#0F172A', marginBottom: 8 }]}>
              Resumen del artículo
            </Text>
            <Text style={[styles.articleExcerpt, { color: isDark ? '#94A3B8' : '#475569' }]}>
              {state.excerpt}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  headerTextGroup: {
    flex: 1,
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  metricPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  chart: {
    borderRadius: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  referrersList: {
    gap: 12,
  },
  referrerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  referrerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  referrerTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  referrerCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  articleExcerpt: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PostAnalyticsScreen;
