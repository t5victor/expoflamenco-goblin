import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { adminApi, type AdminDashboardSummary } from '@/services/adminApi';
import { DASHBOARD_TIME_FILTERS, type DashboardTimeFilter } from '@/utils/timeFilters';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const TIME_FILTERS: DashboardTimeFilter[] = [...DASHBOARD_TIME_FILTERS];

const formatNumber = (value: number, fractionDigits = 0) => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return value.toLocaleString('es-ES', {
    maximumFractionDigits: fractionDigits,
  });
};

const AdminDashboardScreen: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [timePeriod, setTimePeriod] = useState<DashboardTimeFilter>('30d');
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (period: DashboardTimeFilter, mode: 'default' | 'refresh' = 'default') => {
      if (!user?.token || !isAdmin) {
        return;
      }

      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await adminApi.fetchDashboardSummary({
          token: user.token,
          timePeriod: period,
        });
        setSummary(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [user?.token, isAdmin]
  );

  useEffect(() => {
    if (isAdmin && user?.token) {
      loadData(timePeriod);
    }
  }, [isAdmin, loadData, timePeriod, user?.token]);

  const handleRefresh = useCallback(() => {
    loadData(timePeriod, 'refresh');
  }, [loadData, timePeriod]);

  const handleOpenArticle = useCallback(
    (postId: number) => {
      router.push({
        pathname: '/article/[id]',
        params: { id: String(postId), period: timePeriod },
      });
    },
    [router, timePeriod]
  );

  const handleOpenAuthor = useCallback(
    (slug: string) => {
      router.push({
        pathname: '/user/[slug]',
        params: { slug },
      });
    },
    [router]
  );

  const isDark = colorScheme === 'dark';

  const metrics = useMemo(() => {
    if (!summary) {
      return [] as Array<{ id: string; label: string; value: string; icon: keyof typeof Feather.glyphMap }>;
    }

    const { totals } = summary;
    return [
      {
        id: 'authors',
        label: 'Autores con datos',
        value: formatNumber(totals.authorsWithData),
        icon: 'users',
      },
      {
        id: 'totalAuthors',
        label: 'Total autores',
        value: formatNumber(totals.totalAuthors),
        icon: 'user-check',
      },
      {
        id: 'views',
        label: 'Vistas totales',
        value: formatNumber(totals.totalViews),
        icon: 'eye',
      },
      {
        id: 'posts',
        label: 'Artículos publicados',
        value: formatNumber(totals.totalPosts),
        icon: 'file-text',
      },
      {
        id: 'avgViewsAuthor',
        label: 'Vistas promedio / autor',
        value: formatNumber(totals.avgViewsPerAuthor, 1),
        icon: 'bar-chart-2',
      },
      {
        id: 'avgViewsPost',
        label: 'Vistas promedio / artículo',
        value: formatNumber(totals.avgViewsPerPost, 1),
        icon: 'activity',
      },
      {
        id: 'avgPostsAuthor',
        label: 'Artículos promedio / autor',
        value: formatNumber(totals.avgPostsPerAuthor, 1),
        icon: 'layers',
      },
    ];
  }, [summary]);

  const topAuthors = summary?.topAuthors ?? [];
  const topPosts = summary?.topPosts ?? [];
  const authors = summary?.authors ?? [];
  const rowBackground = isDark ? '#1F2937' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}> 
        <View style={styles.centeredBox}>
          <Feather name="shield-off" size={48} color={isDark ? '#F87171' : '#DC2626'} />
          <Text style={[styles.centeredTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Acceso no autorizado</Text>
          <Text style={[styles.centeredSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Necesitas privilegios de administrador para acceder a este panel.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user?.token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}> 
        <View style={styles.centeredBox}>
          <ActivityIndicator size="large" color={isDark ? '#F9FAFB' : '#111827'} />
          <Text style={[styles.centeredSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 12 }]}>Preparando el panel de administración...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }]}> 
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>Panel administrativo</Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Visión global de la revista Expoflamenco</Text>
          </View>
          <View style={styles.timeFilterGroup}>
            {TIME_FILTERS.map((period) => {
              const isActive = period === timePeriod;
              return (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? '#DA2B1F' : isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isActive ? '#DA2B1F' : borderColor,
                    },
                  ]}
                  onPress={() => setTimePeriod(period)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? '#FFFFFF' : isDark ? '#E5E7EB' : '#374151' },
                    ]}
                  >
                    {period.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: isDark ? '#1F2937' : '#FEE2E2', borderColor: isDark ? '#DC2626' : '#FCA5A5' }]}> 
            <View style={styles.errorHeader}>
              <Feather name="alert-triangle" size={20} color={isDark ? '#FCA5A5' : '#B91C1C'} />
              <Text style={[styles.errorTitle, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>No se pudo cargar la información</Text>
            </View>
            <Text style={[styles.errorMessage, { color: isDark ? '#E5E7EB' : '#7F1D1D' }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadData(timePeriod)}>
              <Feather name="refresh-cw" size={16} color="#FFFFFF" />
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading && !summary ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={isDark ? '#F9FAFB' : '#111827'} />
            <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Cargando datos agregados...</Text>
          </View>
        ) : null}

        {summary ? (
          <>
            <View style={styles.metricsGrid}>
              {metrics.map((metric) => (
                <View
                  key={metric.id}
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: rowBackground,
                      borderColor,
                    },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <View style={[styles.metricIconWrapper, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}> 
                      <Feather name={metric.icon} size={18} color={isDark ? '#DA2B1F' : '#DA2B1F'} />
                    </View>
                    <Text style={[styles.metricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{metric.label}</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: isDark ? '#F9FAFB' : '#111827' }]}>{metric.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>Autores destacados</Text>
              <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Top 10 por vistas en el periodo seleccionado</Text>

              <View style={[styles.table, { backgroundColor: rowBackground, borderColor }]}> 
                <View style={[styles.tableHeader, { borderColor }]}>
                  <Text style={[styles.tableHeaderText, styles.columnAuthor, { color: isDark ? '#E5E7EB' : '#111827' }]}>Autor</Text>
                  <Text style={[styles.tableHeaderText, styles.columnViews, { color: isDark ? '#E5E7EB' : '#111827' }]}>Vistas</Text>
                  <Text style={[styles.tableHeaderText, styles.columnPosts, { color: isDark ? '#E5E7EB' : '#111827' }]}>Artículos</Text>
                  <Text style={[styles.tableHeaderText, styles.columnAvg, { color: isDark ? '#E5E7EB' : '#111827' }]}>Promedio</Text>
                  <Text style={[styles.tableHeaderText, styles.columnActions, { color: isDark ? '#E5E7EB' : '#111827' }]}>Acciones</Text>
                </View>
                {topAuthors.map(({ profile, analytics }) => (
                  <View key={profile.id} style={[styles.tableRow, { borderColor }]}> 
                    <View style={styles.columnAuthor}>
                      <Text style={[styles.authorName, { color: isDark ? '#F9FAFB' : '#111827' }]} numberOfLines={1}>
                        {profile.name}
                      </Text>
                      <Text style={[styles.authorMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
                        {profile.email || 'Sin correo'}
                      </Text>
                    </View>
                    <Text style={[styles.columnViews, styles.tableValue, { color: isDark ? '#FDE68A' : '#B45309' }]}>
                      {formatNumber(analytics?.totalViews ?? 0)}
                    </Text>
                    <Text style={[styles.columnPosts, styles.tableValue, { color: isDark ? '#E5E7EB' : '#111827' }]}>
                      {formatNumber(analytics?.totalPosts ?? 0)}
                    </Text>
                    <Text style={[styles.columnAvg, styles.tableValue, { color: isDark ? '#E5E7EB' : '#111827' }]}>
                      {formatNumber(analytics?.avgViewsPerPost ?? 0, 1)}
                    </Text>
                    <View style={styles.columnActions}>
                      <TouchableOpacity
                        onPress={() => handleOpenAuthor(profile.slug)}
                        style={[styles.actionButton, { borderColor }]}
                      >
                        <Feather name="user" size={14} color={isDark ? '#E5E7EB' : '#374151'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>Artículos más vistos</Text>
              <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Ranking basado en vistas absolutas</Text>

              <View style={[styles.cardList, { gap: 12 }]}>
                {topPosts.map((entry) => (
                  <TouchableOpacity
                    key={`${entry.postId}-${entry.author.id}`}
                    style={[
                      styles.postCard,
                      {
                        backgroundColor: rowBackground,
                        borderColor,
                      },
                    ]}
                    onPress={() => handleOpenArticle(entry.postId)}
                  >
                    <View style={styles.postCardHeader}>
                      <Text style={[styles.postTitle, { color: isDark ? '#F9FAFB' : '#111827' }]} numberOfLines={2}>
                        {entry.postTitle}
                      </Text>
                      <Feather name="arrow-up-right" size={18} color={isDark ? '#F9FAFB' : '#111827'} />
                    </View>
                    <View style={styles.postMetaRow}>
                      <View style={styles.postMetaItem}>
                        <Feather name="user" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.postMetaText, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
                          {entry.author.name}
                        </Text>
                      </View>
                      <View style={styles.postMetaItem}>
                        <Feather name="eye" size={14} color={isDark ? '#FDE68A' : '#92400E'} />
                        <Text style={[styles.postMetaText, { color: isDark ? '#FDE68A' : '#92400E' }]}> 
                          {formatNumber(entry.views)}
                        </Text>
                      </View>
                      <View style={styles.postMetaItem}>
                        <Feather name="trending-up" size={14} color={isDark ? '#34D399' : '#059669'} />
                        <Text style={[styles.postMetaText, { color: isDark ? '#34D399' : '#059669' }]}> 
                          {formatNumber(entry.engagement, 1)}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>Listado de autores</Text>
              <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Visión completa de cada autor y su rendimiento</Text>

              <View style={[styles.table, { backgroundColor: rowBackground, borderColor }]}> 
                <View style={[styles.tableHeader, { borderColor }]}>
                  <Text style={[styles.tableHeaderText, styles.columnAuthor, { color: isDark ? '#E5E7EB' : '#111827' }]}>Autor</Text>
                  <Text style={[styles.tableHeaderText, styles.columnViews, { color: isDark ? '#E5E7EB' : '#111827' }]}>Vistas</Text>
                  <Text style={[styles.tableHeaderText, styles.columnPosts, { color: isDark ? '#E5E7EB' : '#111827' }]}>Artículos</Text>
                  <Text style={[styles.tableHeaderText, styles.columnAvg, { color: isDark ? '#E5E7EB' : '#111827' }]}>Promedio</Text>
                  <Text style={[styles.tableHeaderText, styles.columnActions, { color: isDark ? '#E5E7EB' : '#111827' }]}>Estado</Text>
                </View>
                {authors.map(({ profile, analytics, error: authorError }) => (
                  <View key={profile.id} style={[styles.tableRow, { borderColor }]}> 
                    <View style={styles.columnAuthor}>
                      <Text style={[styles.authorName, { color: isDark ? '#F9FAFB' : '#111827' }]} numberOfLines={1}>
                        {profile.name}
                      </Text>
                      <Text style={[styles.authorMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
                        {(profile.roles?.join(', ') || 'Sin rol')}
                      </Text>
                    </View>
                    <Text style={[styles.columnViews, styles.tableValue, { color: isDark ? '#EDE9FE' : '#4C1D95' }]}>
                      {formatNumber(analytics?.totalViews ?? 0)}
                    </Text>
                    <Text style={[styles.columnPosts, styles.tableValue, { color: isDark ? '#E5E7EB' : '#111827' }]}>
                      {formatNumber(analytics?.totalPosts ?? 0)}
                    </Text>
                    <Text style={[styles.columnAvg, styles.tableValue, { color: isDark ? '#E5E7EB' : '#111827' }]}>
                      {formatNumber(analytics?.avgViewsPerPost ?? 0, 1)}
                    </Text>
                    <View style={styles.columnActions}>
                      {authorError ? (
                        <Feather name="alert-circle" size={16} color={isDark ? '#FCA5A5' : '#DC2626'} />
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleOpenAuthor(profile.slug)}
                          style={[styles.actionButton, { borderColor }]}
                        >
                          <Feather name="external-link" size={14} color={isDark ? '#E5E7EB' : '#374151'} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {summary.errors.length > 0 ? (
              <View style={[styles.section, styles.errorSummarySection, { backgroundColor: isDark ? '#1F2937' : '#FFF7ED', borderColor }]}> 
                <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#92400E' }]}>Registros con incidencias</Text>
                <Text style={[styles.sectionSubtitle, { color: isDark ? '#FBBF24' : '#B45309' }]}>
                  Algunos autores no devolvieron datos completos. Revisa sus permisos en WordPress.
                </Text>
                {summary.errors.map((item) => (
                  <View key={item.userId} style={styles.errorRow}>
                    <Feather name="alert-octagon" size={16} color={isDark ? '#F87171' : '#DC2626'} />
                    <Text style={[styles.errorRowText, { color: isDark ? '#FCA5A5' : '#7F1D1D' }]}>Autor #{item.userId}: {item.reason}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isTablet ? 32 : 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: isTablet ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: isTablet ? 'flex-end' : 'flex-start',
    gap: isTablet ? 16 : 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  timeFilterGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  metricCard: {
    flexBasis: isTablet ? '30%' : '100%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricIconWrapper: {
    padding: 10,
    borderRadius: 12,
  },
  metricLabel: {
    flex: 1,
    fontSize: 13,
    textAlign: 'right',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  columnAuthor: {
    flex: 1.6,
    paddingRight: 12,
  },
  columnViews: {
    flex: 1,
    textAlign: 'right',
  },
  columnPosts: {
    flex: 0.9,
    textAlign: 'right',
  },
  columnAvg: {
    flex: 0.9,
    textAlign: 'right',
  },
  columnActions: {
    width: 64,
    alignItems: 'flex-end',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  authorMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardList: {
    flexDirection: 'column',
  },
  postCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  postCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  postTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  postMetaRow: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 8,
  },
  postMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postMetaText: {
    fontSize: 13,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#DA2B1F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  centeredBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  centeredTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  centeredSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorSummarySection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  errorRowText: {
    fontSize: 13,
    flex: 1,
  },
});

export default AdminDashboardScreen;
