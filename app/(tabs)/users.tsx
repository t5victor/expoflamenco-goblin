import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Sidebar } from '@/components/Sidebar';
import { Feather } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { authorAnalyticsService } from '@/services/authorAnalytics';
import { dataCacheKeys, getCachedData, setCachedData } from '@/services/dataCache';
import { addPrefetchListener } from '@/services/prefetchManager';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

interface ArticleWithAnalytics {
  id: number;
  title: { rendered: string };
  date: string;
  modified: string;
  slug: string;
  link: string;
  views: number;
  engagement: number;
}

export default function ArticlesScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const [articlesSource, setArticlesSource] = useState<ArticleWithAnalytics[]>([]);
  const [articles, setArticles] = useState<ArticleWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'views' | 'date' | 'engagement'>('views');
  const userInteractionRef = useRef(false);

  const markUserInteraction = () => {
    userInteractionRef.current = true;
  };

  const sortArticles = useCallback((items: ArticleWithAnalytics[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'engagement':
          return b.engagement - a.engagement;
        default:
          return b.views - a.views;
      }
    });
  }, [sortBy]);

  const loadArticles = useCallback(
    async ({ allowNetwork = true, silent = false }: { allowNetwork?: boolean; silent?: boolean } = {}) => {
      if (!user) return;

      const cacheKey = dataCacheKeys.authorArticles(user.userId);
      const cacheResult = await getCachedData<ArticleWithAnalytics[]>(cacheKey);
      const cachedArticles = cacheResult.data ?? [];
      const hasCached = cachedArticles.length > 0;

      if (hasCached) {
        setArticlesSource(cachedArticles);
        setArticles(sortArticles(cachedArticles));
        if (!silent) {
          setLoading(false);
        }
      }

      if (!hasCached && !silent) {
        setLoading(true);
      }

      const needsFetch = allowNetwork && (!hasCached || cacheResult.isExpired);

      if (!needsFetch) {
        return;
      }

      try {
        const articlesWithAnalytics = await authorAnalyticsService.getAuthorPostsWithAnalytics(
          user.userId,
          user.token
        );

        setArticlesSource(articlesWithAnalytics);
        setArticles(sortArticles(articlesWithAnalytics));
        await setCachedData(cacheKey, articlesWithAnalytics);
        if (!silent) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
        if (!hasCached) {
          setArticlesSource([]);
          setArticles([]);
          if (!silent) {
            setLoading(false);
          }
        }
      }
    },
    [sortArticles, user]
  );

  useEffect(() => {
    const unsubscribe = addPrefetchListener(() => {
      loadArticles({ allowNetwork: false, silent: true });
    });

    return unsubscribe;
  }, [loadArticles]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fromInteraction = userInteractionRef.current;
    const allowNetwork = !fromInteraction;
    const silent = fromInteraction;

    loadArticles({ allowNetwork, silent });

    if (fromInteraction) {
      userInteractionRef.current = false;
    }
  }, [loadArticles, user]);

  useEffect(() => {
    setArticles(sortArticles(articlesSource));
  }, [articlesSource, sortArticles]);

  const onRefresh = async () => {
    markUserInteraction();
    setRefreshing(true);
    await loadArticles({ allowNetwork: false, silent: true });
    setRefreshing(false);
    userInteractionRef.current = false;
  };

  if (loading) {
    return (
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
      ]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#111827'} />
          <Text style={[
            styles.loadingText,
            { color: isDark ? '#FFFFFF' : '#111827' }
          ]}>
            {t('loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <View style={styles.layout}>
        {!isMobile && <Sidebar activeTab="articles" onTabChange={() => {}} />}

        <View style={styles.content}>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
                <View style={styles.refreshContainer}>
                  <IconSymbol name="arrow.clockwise" size={16} color={isDark ? '#FFFFFF' : '#374151'} />
                  <Text style={[
                    styles.refreshText,
                    { color: isDark ? '#FFFFFF' : '#374151' }
                  ]}>
                    {refreshing ? t('articles.refreshing') : t('articles.refresh')}
                  </Text>
                </View>
              </TouchableOpacity>
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={[styles.header, isMobile && styles.mobileHeader]}>
              <View style={styles.headerLeft}>
                <Text style={[
                  styles.headerTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  {t('articles.title')}
                </Text>
                <Text style={[
                  styles.headerSubtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' }
                ]}>
                  {t('articles.subtitle')}
                </Text>
              </View>

              {/* Sort Controls */}
              <View style={[styles.headerActions, isMobile && styles.mobileHeaderActions]}>
                <View style={[
                  styles.sortSelectorContainer,
                  isMobile && styles.mobileSortSelectorContainer,
                  { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)' }
                ]}>
                  {[
                    { id: 'views', label: t('articles.sortByViews'), icon: 'eye' },
                    { id: 'date', label: t('articles.sortByDate'), icon: 'calendar' },
                    { id: 'engagement', label: t('articles.sortByEngagement'), icon: 'arrow.up' },
                  ].map((sort, index) => (
                    <TouchableOpacity
                      key={sort.id}
                      style={[
                        styles.sortSelectorButton,
                        isMobile && styles.mobileSortSelectorButton,
                        index === 0 && styles.sortSelectorButtonFirst,
                        index === 2 && styles.sortSelectorButtonLast,
                        sortBy === sort.id && styles.sortSelectorButtonActive,
                        sortBy === sort.id && {
                          backgroundColor: '#DA2B1F',
                          shadowColor: '#DA2B1F',
                        }
                      ]}
                      onPress={() => {
                        markUserInteraction();
                        setSortBy(sort.id as any);
                      }}
                    >
                      <Feather
                        name={sort.icon as any}
                        size={isMobile ? 16 : 14}
                        color={sortBy === sort.id ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')}
                      />
                      {!isMobile && (
                        <Text style={[
                          styles.sortSelectorText,
                          sortBy === sort.id && styles.sortSelectorTextActive,
                          {
                            color: sortBy === sort.id
                              ? '#FFFFFF'
                              : (isDark ? '#D1D5DB' : '#374151')
                          }
                        ]}>
                          {sort.label}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Articles List */}
            <View style={[styles.articlesGrid, isMobile && styles.mobileArticlesGrid]}>
              {articles.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol name="doc" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  <Text style={[
                    styles.emptyTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    {t('articles.noArticles')}
                  </Text>
                  <Text style={[
                    styles.emptySubtitle,
                    { color: isDark ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    {t('articles.noArticlesDesc')}
                  </Text>
                </View>
              ) : (
                articles.map((article, index) => (
                  <View
                    key={article.id}
                    style={[
                      styles.articleCard,
                      { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
                    ]}
                  >
                    <View style={styles.articleHeader}>
                      <View style={styles.articleMeta}>
                        <Text style={[
                          styles.articleDate,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          {new Date(article.date).toLocaleDateString('es-ES')}
                        </Text>
                        <View style={[
                          styles.rankBadge,
                          { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                        ]}>
                          <Text style={[
                            styles.rankText,
                            { color: isDark ? '#FFFFFF' : '#374151' }
                          ]}>
                            #{index + 1}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={[
                      styles.articleTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]} numberOfLines={2}>
                      {article.title.rendered}
                    </Text>

                    <View style={styles.articleStats}>
                      <View style={styles.statItem}>
                        <IconSymbol name="eye" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[
                          styles.statValue,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {article.views.toLocaleString()}
                        </Text>
                        <Text style={[
                          styles.statLabel,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          {t('articles.views')}
                        </Text>
                      </View>

                      <View style={styles.statItem}>
                        <IconSymbol name="arrow.up" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[
                          styles.statValue,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {article.engagement.toFixed(1)}%
                        </Text>
                        <Text style={[
                          styles.statLabel,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          {t('articles.engagement')}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.articleLink,
                        { borderColor: isDark ? '#374151' : '#E5E7EB' }
                      ]}
                      onPress={() => {
                        // Open article link
                        if (Platform.OS === 'web') {
                          window.open(article.link, '_blank');
                        }
                      }}
                    >
                      <Text style={[
                        styles.linkText,
                        { color: '#DA2B1F' }
                      ]}>
                        {t('articles.viewArticle')}
                      </Text>
                      <IconSymbol name="arrow.up.right.square" size={14} color="#DA2B1F" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
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
    flexDirection: isMobile ? 'column' : 'row',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  refreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sortSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 21,
    justifyContent: 'center',
    gap: 6,
    minWidth: 50,
  },
  sortSelectorButtonFirst: {
    marginLeft: 0,
  },
  sortSelectorButtonLast: {
    marginRight: 0,
  },
  sortSelectorButtonActive: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sortSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sortSelectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  mobileHeader: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 16,
    paddingHorizontal: 16,
  },
  mobileHeaderActions: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  mobileSortSelectorContainer: {
    marginHorizontal: 16,
  },
  mobileSortSelectorButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 40,
  },
  articlesGrid: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  mobileArticlesGrid: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  articleCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 0,
    marginBottom: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    borderRightColor: 'rgba(0, 0, 0, 0.15)',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  articleDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '600',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 24,
  },
  articleStats: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  articleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#DA2B1F',
    borderRadius: 12,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
