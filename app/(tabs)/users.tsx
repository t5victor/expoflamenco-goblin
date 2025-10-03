import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
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
import { useRouter } from 'expo-router';

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
  viewShare: number;
  viewsPerDay: number;
}

interface CalendarDayCell {
  key: string;
  date: Date;
  isoDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  articleCount: number;
  opacity: number;
}

const stripHtml = (value: string) => value.replace(/<[^>]*>?/g, '').trim();
const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const extractISODate = (value: string) => value.split('T')[0];
const normalizeArticle = (article: ArticleWithAnalytics): ArticleWithAnalytics => ({
  ...article,
  engagement: typeof article.engagement === 'number' ? article.engagement : 0,
  viewShare: typeof (article as any).viewShare === 'number' ? (article as any).viewShare : 0,
  viewsPerDay: typeof (article as any).viewsPerDay === 'number' ? (article as any).viewsPerDay : 0,
});

export default function ArticlesScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const isDark = colorScheme === 'dark';
  const [articlesSource, setArticlesSource] = useState<ArticleWithAnalytics[]>([]);
  const [articles, setArticles] = useState<ArticleWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'views' | 'date'>('views');
  const userInteractionRef = useRef(false);
  const router = useRouter();
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const summary = useMemo(() => {
    const totalArticles = articlesSource.length;
    const totalViews = articlesSource.reduce((sum, item) => sum + (item.views || 0), 0);
    const avgViewsPerDay = totalArticles > 0
      ? articlesSource.reduce((sum, item) => sum + (item.viewsPerDay || 0), 0) / totalArticles
      : 0;

    const topArticle = articlesSource.reduce<ArticleWithAnalytics | null>((best, current) => {
      if (!best || current.views > best.views) {
        return current;
      }
      return best;
    }, null);

    return {
      totalArticles,
      totalViews,
      avgViewsPerDay,
      topArticle,
      metrics: [
        {
          id: 'articles',
          icon: 'file-text' as const,
          label: t('articles.summaryTotalArticles'),
          value: totalArticles.toLocaleString(locale),
        },
        {
          id: 'views',
          icon: 'eye' as const,
          label: t('articles.summaryTotalViews'),
          value: totalViews.toLocaleString(locale),
        },
        {
          id: 'avgViewsDay',
          icon: 'activity' as const,
          label: t('articles.summaryAvgViewsDay'),
          value: avgViewsPerDay.toLocaleString(locale, { maximumFractionDigits: 1 }),
        },
        {
          id: 'topPerformer',
          icon: 'award' as const,
          label: t('articles.summaryTopPerformer'),
          value: topArticle ? stripHtml(topArticle.title.rendered) : t('articles.summaryTopPerformerFallback'),
          isText: true,
        },
      ],
    };
  }, [articlesSource, locale, t]);

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const todayISO = useMemo(() => toISODate(today), [today]);

  const articlesByDate = useMemo(() => {
    const map = new Map<string, ArticleWithAnalytics[]>();

    articlesSource.forEach((article) => {
      const dateKey = extractISODate(article.date);
      if (!dateKey) {
        return;
      }
      const existing = map.get(dateKey);
      if (existing) {
        existing.push(article);
      } else {
        map.set(dateKey, [article]);
      }
    });

    return map;
  }, [articlesSource]);

  const maxArticlesPerDay = useMemo(() => {
    let max = 0;
    articlesByDate.forEach((items) => {
      if (items.length > max) {
        max = items.length;
      }
    });
    return max;
  }, [articlesByDate]);

  const weekdayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const referenceDate = new Date(Date.UTC(2021, 7, index + 1));
      return referenceDate.toLocaleDateString(locale, {
        weekday: 'short',
      });
    });
  }, [locale]);

  const calendarWeeks = useMemo(() => {
    const startOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const startDay = startOfMonth.getDay();
    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

    const cells: CalendarDayCell[] = Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - startDay + 1;
      const cellDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNumber);
      const normalizedCellDate = new Date(cellDate);
      normalizedCellDate.setHours(0, 0, 0, 0);
      const isoDate = toISODate(cellDate);
      const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
      const articlesForDay = articlesByDate.get(isoDate) ?? [];
      const articleCount = articlesForDay.length;
      const intensityBase = maxArticlesPerDay > 0 ? articleCount / maxArticlesPerDay : 0;
      const opacity = articleCount === 0 ? 0 : Math.min(0.6, 0.18 + intensityBase * 0.45);
      const isFuture = normalizedCellDate.getTime() > today.getTime();

      return {
        key: `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`,
        date: cellDate,
        isoDate,
        isCurrentMonth,
        isToday: isoDate === todayISO,
        isFuture,
        articleCount,
        opacity,
      };
    });

    const weeks: CalendarDayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [articlesByDate, calendarMonth, maxArticlesPerDay, todayISO]);

  const selectedDateArticles = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return articles.filter((article) => extractISODate(article.date) === selectedDate);
  }, [articles, selectedDate]);

  const visibleArticles = selectedDate ? selectedDateArticles : articles;
  const hasDateFilter = Boolean(selectedDate);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) {
      return '';
    }

    const date = new Date(`${selectedDate}T00:00:00`);
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [locale, selectedDate]);

  const monthLabel = useMemo(() => {
    return calendarMonth.toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
    });
  }, [calendarMonth, locale]);

  const goToPreviousMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const handleSelectDate = (isoDate: string, isCurrentMonth: boolean, dateObj: Date, isFuture: boolean) => {
    if (isFuture) {
      return;
    }
    if (!isCurrentMonth) {
      setCalendarMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
    }

    setSelectedDate((prev) => (prev === isoDate ? null : isoDate));
  };

  const sortOptions = [
    { id: 'views' as const, label: t('articles.sortByViews'), icon: 'eye' as const },
    { id: 'date' as const, label: t('articles.sortByDate'), icon: 'clock' as const },
  ];

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
      const cachedArticlesRaw = cacheResult.data ?? [];
      const cachedArticles = cachedArticlesRaw.map((item) => normalizeArticle(item as ArticleWithAnalytics));
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

        const normalizedArticles = articlesWithAnalytics.map((item) => normalizeArticle(item as ArticleWithAnalytics));

        setArticlesSource(normalizedArticles);
        setArticles(sortArticles(normalizedArticles));
        await setCachedData(cacheKey, normalizedArticles);
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

  const openPostDetails = (postId: number) => {
    router.push({ pathname: '/article/[id]', params: { id: String(postId) } });
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
            contentContainerStyle={styles.scrollContent}
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

              <View style={[styles.headerActions, isMobile && styles.mobileHeaderActions]}>
                <View style={[
                  styles.sortSelectorContainer,
                  isMobile && styles.mobileSortSelectorContainer,
                  { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.85)' }
                ]}>
                  {sortOptions.map((sort, index) => {
                    const isActive = !showCalendar && sortBy === sort.id;
                    return (
                      <TouchableOpacity
                        key={sort.id}
                        style={[
                          styles.sortSelectorButton,
                          isMobile && styles.mobileSortSelectorButton,
                          index === 0 && styles.sortSelectorButtonFirst,
                          isActive && styles.sortSelectorButtonActive,
                          isActive && {
                            backgroundColor: '#DA2B1F',
                            shadowColor: '#DA2B1F',
                          }
                        ]}
                        onPress={() => {
                          markUserInteraction();
                          setShowCalendar(false);
                          setSelectedDate(null);
                          setSortBy(sort.id);
                        }}
                      >
                        <Feather
                          name={sort.icon}
                          size={isMobile ? 16 : 14}
                          color={isActive ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#6B7280')}
                        />
                        {!isMobile && (
                          <Text style={[
                            styles.sortSelectorText,
                            isActive && styles.sortSelectorTextActive,
                            {
                              color: isActive
                                ? '#FFFFFF'
                                : (isDark ? '#E5E7EB' : '#374151')
                            }
                          ]}>
                            {sort.label}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    accessibilityLabel={showCalendar ? t('articles.hideCalendar') : t('articles.calendarView')}
                    onPress={() => {
                      markUserInteraction();
                      setSelectedDate(null);
                      setShowCalendar((prev) => !prev);
                    }}
                    activeOpacity={0.85}
                    style={[
                      styles.sortSelectorButton,
                      isMobile && styles.mobileSortSelectorButton,
                      styles.sortSelectorButtonLast,
                      styles.calendarToggle,
                      showCalendar && styles.sortSelectorButtonActive,
                      showCalendar && styles.calendarToggleActive,
                      showCalendar && {
                        backgroundColor: '#DA2B1F',
                        shadowColor: '#DA2B1F',
                      },
                    ]}
                  >
                    <Feather
                      name="calendar"
                      size={isMobile ? 16 : 14}
                      color={showCalendar ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#6B7280')}
                    />
                    {!isMobile && (
                      <Text
                        style={[
                          styles.sortSelectorText,
                          showCalendar && styles.sortSelectorTextActive,
                          {
                            color: showCalendar
                              ? '#FFFFFF'
                              : (isDark ? '#E5E7EB' : '#374151')
                          }
                        ]}
                      >
                        {showCalendar ? t('articles.hideCalendar') : t('articles.calendarView')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {showCalendar && (
              <View
                style={[
                  styles.calendarContainer,
                  isMobile && styles.mobileCalendarContainer,
                  {
                    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)',
                  },
                ]}
              >
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    accessibilityLabel={t('articles.calendarPrev')}
                    onPress={goToPreviousMonth}
                    style={[
                      styles.calendarNavButton,
                      { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.06)' },
                    ]}
                  >
                    <Feather name="chevron-left" size={18} color={isDark ? '#E5E7EB' : '#1F2937'} />
                  </TouchableOpacity>

                  <Text style={[styles.calendarMonthLabel, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                    {monthLabel}
                  </Text>

                  <TouchableOpacity
                    accessibilityLabel={t('articles.calendarNext')}
                    onPress={goToNextMonth}
                    style={[
                      styles.calendarNavButton,
                      { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.06)' },
                    ]}
                  >
                    <Feather name="chevron-right" size={18} color={isDark ? '#E5E7EB' : '#1F2937'} />
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarWeekdays}>
                  {weekdayLabels.map((label, index) => (
                    <Text
                      key={`${label}-${index}`}
                      style={[styles.calendarWeekday, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
                    >
                      {label}
                    </Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {calendarWeeks.map((week, weekIndex) => (
                    <View key={`week-${weekIndex}`} style={styles.calendarWeekRow}>
                      {week.map((day) => {
                        const isSelected = selectedDate === day.isoDate;
                        const hasArticles = day.articleCount > 0;
                        const dayBackground = hasArticles
                          ? `rgba(218, 43, 31, ${day.opacity.toFixed(3)})`
                          : 'transparent';

                        return (
                          <TouchableOpacity
                            key={day.key}
                            style={[
                              styles.calendarDay,
                              {
                                backgroundColor: isSelected
                                  ? isDark
                                    ? 'rgba(218, 43, 31, 0.35)'
                                    : 'rgba(218, 43, 31, 0.18)'
                                  : dayBackground,
                                borderColor: isSelected
                                  ? '#DA2B1F'
                                  : day.isToday
                                  ? isDark
                                    ? 'rgba(148, 163, 184, 0.6)'
                                    : 'rgba(30, 64, 175, 0.35)'
                                  : 'transparent',
                                borderWidth: (isSelected || day.isToday) ? 1 : 0,
                              },
                              !day.isCurrentMonth && styles.calendarDayOutside,
                              day.isFuture && styles.calendarDayFuture,
                            ]}
                            disabled={day.isFuture}
                            onPress={() => {
                              markUserInteraction();
                              handleSelectDate(day.isoDate, day.isCurrentMonth, day.date, day.isFuture);
                            }}
                          >
                            <Text
                              style={[
                                styles.calendarDayText,
                                {
                                  color: !day.isCurrentMonth
                                    ? isDark
                                      ? 'rgba(148, 163, 184, 0.4)'
                                      : 'rgba(107, 114, 128, 0.45)'
                                    : day.isFuture
                                    ? isDark
                                      ? 'rgba(148, 163, 184, 0.4)'
                                      : 'rgba(107, 114, 128, 0.45)'
                                    : isDark
                                    ? '#F3F4F6'
                                    : '#111827',
                                },
                                isSelected && { color: '#FFFFFF', fontWeight: '700' },
                              ]}
                            >
                              {day.date.getDate()}
                            </Text>
                            {hasArticles && !day.isFuture && (
                              <Text
                                style={[
                                  styles.calendarDayCount,
                                  { color: isDark ? '#FEE2E2' : '#7F1D1D' },
                                ]}
                              >
                                {day.articleCount}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>

                <View style={[styles.calendarFooter, isMobile && styles.mobileCalendarFooter]}>
                  <View style={styles.calendarLegend}>
                    <Text style={[styles.calendarLegendLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {t('articles.calendarArticlesLabel')}
                    </Text>
                    <View style={styles.calendarLegendScale}>
                      <View
                        style={[
                          styles.calendarLegendSwatch,
                          { backgroundColor: isDark ? 'rgba(218, 43, 31, 0.18)' : 'rgba(218, 43, 31, 0.12)' },
                        ]}
                      />
                      <Text style={[styles.calendarLegendText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        {t('articles.calendarLegendLow')}
                      </Text>
                      <View
                        style={[
                          styles.calendarLegendSwatch,
                          { backgroundColor: isDark ? 'rgba(218, 43, 31, 0.55)' : 'rgba(218, 43, 31, 0.5)' },
                        ]}
                      />
                      <Text style={[styles.calendarLegendText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        {t('articles.calendarLegendHigh')}
                      </Text>
                    </View>
                  </View>

                  {hasDateFilter && (
                    <TouchableOpacity
                      onPress={clearDateFilter}
                      style={[
                        styles.calendarClearButton,
                        { borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.1)' },
                      ]}
                    >
                      <Feather name="x-circle" size={14} color={isDark ? '#E5E7EB' : '#1F2937'} />
                      <Text style={[styles.calendarClearText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                        {t('articles.calendarClearFilter')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Summary */}
            {!showCalendar && (
              <View style={[styles.summaryContainer, isMobile && styles.mobileSummaryContainer]}>
                {summary.metrics.map((metric) => (
                  <View
                    key={metric.id}
                    style={[
                      styles.summaryCard,
                      {
                        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.75)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)',
                      },
                    ]}
                  >
                    <View style={[
                      styles.summaryIcon,
                      { backgroundColor: isDark ? 'rgba(218, 43, 31, 0.15)' : 'rgba(218, 43, 31, 0.08)' }
                    ]}>
                      <Feather name={metric.icon} size={16} color={isDark ? '#FCA5A5' : '#DC2626'} />
                    </View>
                    <View style={styles.summaryTextGroup}>
                      <Text
                        numberOfLines={metric.isText ? 2 : 1}
                        style={[
                          styles.summaryValue,
                          metric.isText && styles.summaryValueText,
                          { color: isDark ? '#F9FAFB' : '#111827' }
                        ]}
                      >
                        {metric.value}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        {metric.label}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {hasDateFilter && (
              <View
                style={[
                  styles.dateFilterSummary,
                  isMobile && styles.mobileDateFilterSummary,
                  {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.65)' : '#FFF1F2',
                    borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(220, 38, 38, 0.25)',
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dateFilterTitle, { color: isDark ? '#F8FAFC' : '#7F1D1D' }]}>
                    {selectedDateArticles.length > 0
                      ? `${t('articles.calendarSelected')} ${selectedDateLabel}`
                      : `${t('articles.calendarSelectedNone')} ${selectedDateLabel}`}
                  </Text>
                  {selectedDateArticles.length > 0 && (
                    <Text style={[styles.dateFilterSubtitle, { color: isDark ? '#FECACA' : '#991B1B' }]}>
                      {`${selectedDateArticles.length} · ${t('articles.calendarArticlesLabel')}`}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={clearDateFilter} style={styles.dateFilterClearButton}>
                  <Feather name="x" size={14} color={isDark ? '#FECACA' : '#991B1B'} />
                </TouchableOpacity>
              </View>
            )}

            {/* Articles List */}
            <View style={[styles.articlesGrid, isMobile && styles.mobileArticlesGrid]}>
              {visibleArticles.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol name="doc" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  <Text style={[
                    styles.emptyTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    {hasDateFilter ? t('articles.calendarNoArticlesDay') : t('articles.noArticles')}
                  </Text>
                  <Text style={[
                    styles.emptySubtitle,
                    { color: isDark ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    {hasDateFilter ? `${t('articles.calendarSelectedNone')} ${selectedDateLabel}` : t('articles.noArticlesDesc')}
                  </Text>
                </View>
              ) : (
                visibleArticles.map((article, index) => {
                  const publishedDate = new Date(article.date).toLocaleDateString(locale);
                  const updatedDate = new Date(article.modified).toLocaleDateString(locale);
                  const performanceValue = Math.max(0, Math.round(article.engagement));
                  const performanceFill = Math.min(100, Math.max(article.engagement, 0));
                  const dailyAverage = Number.isFinite(article.viewsPerDay) ? article.viewsPerDay : 0;

                  return (
                    <TouchableOpacity
                      key={article.id}
                      activeOpacity={0.9}
                      onPress={() => openPostDetails(article.id)}
                      style={[
                        styles.articleCard,
                        { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(15, 23, 42, 0.08)' }
                      ]}
                    >
                      <View style={styles.articleMetaRow}>
                        <View style={styles.articleDates}>
                          <View style={styles.articleDateItem}>
                            <Feather name="calendar" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.articleDateText, { color: isDark ? '#CBD5F5' : '#4B5563' }]}>
                              {t('articles.publishedOn')} · {publishedDate}
                            </Text>
                          </View>
                          <View style={styles.articleDateItem}>
                            <Feather name="clock" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.articleDateText, { color: isDark ? '#A5B4FC' : '#6B7280' }]}>
                              {t('articles.updatedOn')} · {updatedDate}
                            </Text>
                          </View>
                        </View>
                        <View style={[
                          styles.rankBadge,
                          { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.12)' }
                        ]}>
                          <Text style={[
                            styles.rankText,
                            { color: isDark ? '#DBEAFE' : '#1D4ED8' }
                          ]}>
                            #{index + 1}
                          </Text>
                        </View>
                      </View>

                      <Text style={[
                        styles.articleTitle,
                        { color: isDark ? '#FFFFFF' : '#111827' }
                      ]} numberOfLines={3}>
                        {stripHtml(article.title.rendered)}
                      </Text>

                      <View style={[styles.articleStatsRow, isMobile && styles.mobileArticleStatsRow]}>
                        <View style={[
                          styles.statPill,
                          isMobile && styles.mobileStatPill,
                          { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)' }
                        ]}>
                          <View style={[
                            styles.statPillIcon,
                            { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.16)' }
                          ]}>
                            <Feather name="eye" size={16} color={isDark ? '#BFDBFE' : '#1D4ED8'} />
                          </View>
                          <View>
                            <Text style={[styles.statPillValue, { color: isDark ? '#E0F2FE' : '#1D4ED8' }]}>
                              {article.views.toLocaleString(locale)}
                            </Text>
                            <Text style={[styles.statPillLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                              {t('articles.views')}
                            </Text>
                          </View>
                        </View>

                        <View style={[
                          styles.statPill,
                          isMobile && styles.mobileStatPill,
                          { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)' }
                        ]}>
                          <View style={[
                            styles.statPillIcon,
                            { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.22)' : 'rgba(34, 197, 94, 0.16)' }
                          ]}>
                            <Feather name="activity" size={16} color={isDark ? '#BBF7D0' : '#15803D'} />
                          </View>
                          <View>
                            <Text style={[styles.statPillValue, { color: isDark ? '#BBF7D0' : '#15803D' }]}>
                              {dailyAverage.toLocaleString(locale, { maximumFractionDigits: 1 })}
                            </Text>
                            <Text style={[styles.statPillLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                              {t('articles.avgViewsPerDay')}
                            </Text>
                          </View>
                        </View>

                        <View style={[
                          styles.statPill,
                          isMobile && styles.mobileStatPill,
                          { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.12)' : 'rgba(244, 114, 182, 0.12)' }
                        ]}>
                          <View style={[
                            styles.statPillIcon,
                            { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.25)' : 'rgba(236, 72, 153, 0.18)' }
                          ]}>
                            <Feather name="pie-chart" size={16} color={isDark ? '#FBCFE8' : '#DB2777'} />
                          </View>
                          <View>
                            <Text style={[styles.statPillValue, { color: isDark ? '#F9A8D4' : '#DB2777' }]}>
                              {article.viewShare.toFixed(1)}%
                            </Text>
                            <Text style={[styles.statPillLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                              {t('articles.viewShare')}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={[styles.performanceSection, { backgroundColor: isDark ? 'rgba(17, 24, 39, 0.85)' : '#F9FAFB' }]}>
                        <View style={styles.performanceHeader}>
                          <Text style={[styles.performanceLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            {t('articles.performance')}
                          </Text>
                          <Text style={[styles.performanceValue, { color: isDark ? '#FACC15' : '#DC2626' }]}>
                            {performanceValue}%
                          </Text>
                        </View>
                        <View style={[styles.performanceBarTrack, { backgroundColor: isDark ? '#1F2937' : '#E5E7EB' }]}>
                          <View style={[styles.performanceBarFill, { width: `${performanceFill}%` }]} />
                        </View>
                        <Text style={[styles.performanceCaption, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {t('articles.viewShare')}: {article.viewShare.toFixed(1)}%
                        </Text>
                      </View>

                      <View style={[styles.articleActions, isMobile && styles.mobileArticleActions]}>
                        <TouchableOpacity
                          style={[
                            styles.analyticsButton,
                            { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#F9FAFB', borderColor: isDark ? '#334155' : '#E2E8F0' }
                          ]}
                          onPress={() => openPostDetails(article.id)}
                        >
                          <Feather name="bar-chart-2" size={16} color={isDark ? '#F8FAFC' : '#1F2937'} />
                          <Text style={[styles.analyticsButtonText, { color: isDark ? '#F8FAFC' : '#1F2937' }]}>
                            {t('articles.viewAnalytics')}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.linkButton, { backgroundColor: '#DA2B1F' }]}
                          onPress={() => Linking.openURL(article.link)}
                        >
                          <Feather name="external-link" size={16} color="#FFFFFF" />
                          <Text style={styles.linkButtonText}>{t('articles.openArticle')}</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })
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
  scrollContent: {
    paddingBottom: 32,
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
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  refreshButtonDisabled: {
    opacity: 0.65,
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sortSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 21,
    gap: 6,
    minWidth: 52,
  },
  sortSelectorButtonFirst: {
    marginLeft: 0,
  },
  sortSelectorButtonLast: {
    marginRight: 0,
  },
  sortSelectorButtonActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sortSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  sortSelectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mobileHeader: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
  },
  mobileHeaderActions: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  mobileSortSelectorContainer: {
    width: '100%',
  },
  mobileSortSelectorButton: {
    minWidth: 48,
  },
  calendarToggle: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 48,
  },
  calendarToggleActive: {
    shadowColor: '#DA2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  calendarContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    gap: 12,
  },
  mobileCalendarContainer: {
    marginHorizontal: 16,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  calendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
  },
  calendarMonthLabel: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  calendarWeekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarDay: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDayCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  calendarDayOutside: {
    opacity: 0.75,
  },
  calendarDayFuture: {
    opacity: 0.6,
  },
  calendarFooter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  mobileCalendarFooter: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  calendarLegend: {
    flexDirection: 'column',
    gap: 6,
  },
  calendarLegendLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  calendarLegendScale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarLegendSwatch: {
    width: 36,
    height: 10,
    borderRadius: 6,
  },
  calendarLegendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarClearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  calendarClearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateFilterSummary: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileDateFilterSummary: {
    marginHorizontal: 16,
  },
  dateFilterTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  dateFilterSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateFilterClearButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  mobileSummaryContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextGroup: {
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryValueText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  articlesGrid: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 20,
  },
  mobileArticlesGrid: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  articleCard: {
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  articleMetaRow: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    gap: isMobile ? 12 : 0,
    marginBottom: 14,
  },
  articleDates: {
    flexDirection: 'column',
    gap: 6,
  },
  articleDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  articleDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 26,
  },
  articleStatsRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 16,
    marginBottom: 18,
  },
  mobileArticleStatsRow: {
    width: '100%',
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  mobileStatPill: {
    width: '100%',
  },
  statPillIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPillValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  statPillLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  performanceSection: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  performanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  performanceBarTrack: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  performanceBarFill: {
    height: '100%',
    backgroundColor: '#DA2B1F',
  },
  performanceCaption: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '500',
  },
  articleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  mobileArticleActions: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  analyticsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  analyticsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
});
