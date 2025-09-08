import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Sidebar } from '@/components/Sidebar';
import { SiteSelector } from '@/components/SiteSelector';
import { Feather } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const mockSubscriptionData = {
  total: 15438,
  active: 13892,
  newThisMonth: 234,
  monthlyRevenue: 45230,
  fan: {
    total: 11247,
    active: 10891,
    newThisMonth: 189,
    revenue: 0, // Free tier
  },
  vip: {
    total: 4191,
    active: 3001,
    newThisMonth: 45,
    revenue: 45230,
    monthlyPrice: 15,
  },
  conversionRate: 12.8,
  churnRate: 3.2,
  fanToVipConversion: 8.9,
};

const mockSubscriptions = [
  { id: 1, name: 'María González', email: 'maria@example.com', type: 'vip', status: 'active', startDate: '2024-01-15', nextBilling: '2024-04-15', revenue: 45 },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com', type: 'fan', status: 'active', startDate: '2024-02-03', nextBilling: null, revenue: 0 },
  { id: 3, name: 'Ana Martín', email: 'ana@example.com', type: 'vip', status: 'cancelled', startDate: '2023-12-10', nextBilling: null, revenue: 135 },
  { id: 4, name: 'José López', email: 'jose@example.com', type: 'fan', status: 'active', startDate: '2024-03-22', nextBilling: null, revenue: 0 },
  { id: 5, name: 'Isabel Torres', email: 'isabel@example.com', type: 'vip', status: 'active', startDate: '2024-03-28', nextBilling: '2024-04-28', revenue: 15 },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon,
  color = '#3B82F6'
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTrendColor = () => {
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return '#6B7280';
  };

  return (
    <View style={[
      styles.metricCard,
      { 
        backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
        borderColor: isDark ? '#374151' : '#E5E7EB'
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Feather name={icon} size={20} color={color} />
          <Text style={[
            styles.cardTitle, 
            { color: isDark ? '#D1D5DB' : '#374151' }
          ]}>
            {title}
          </Text>
        </View>
      </View>
      
      <Text style={[
        styles.cardValue, 
        { color: isDark ? '#FFFFFF' : '#111827' }
      ]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      
      {subtitle && (
        <Text style={[
          styles.cardSubtitle, 
          { color: isDark ? '#9CA3AF' : '#6B7280' }
        ]}>
          {subtitle}
        </Text>
      )}
      
      {trend && trendValue && (
        <View style={[
          styles.trendBadge,
          { backgroundColor: getTrendColor() }
        ]}>
          <Feather 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'minus'} 
            size={12} 
            color="white" 
          />
          <Text style={styles.trendText}>
            {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function SubscriptionsScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const [selectedSite, setSelectedSite] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: t('users.allUsers'), count: mockSubscriptionData.total },
    { id: 'fan', label: t('users.fanUsers'), count: mockSubscriptionData.fan.total },
    { id: 'vip', label: t('users.vipUsers'), count: mockSubscriptionData.vip.total },
    { id: 'active', label: t('users.active'), count: mockSubscriptionData.active },
  ];

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case 'vip': return '#8B5CF6';
      case 'fan': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'expired': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <View style={styles.layout}>
        <Sidebar activeTab="subscriptions" onTabChange={() => {}} />
        
        <View style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[
                  styles.headerTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  {t('subscriptions.title')}
                </Text>
                <Text style={[
                  styles.headerSubtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' }
                ]}>
                  {t('subscriptions.subtitle')}
                </Text>
              </View>
              
              <SiteSelector selectedSite={selectedSite} onSiteChange={setSelectedSite} />
            </View>

            <View style={styles.dashboardGrid}>
              {/* Subscription Tiers Overview */}
              <View style={styles.tiersSection}>
                <Text style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Subscription Tiers
                </Text>
                
                <View style={styles.tiersGrid}>
                  {/* Fan Tier */}
                  <View style={[
                    styles.tierCard,
                    { 
                      backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                      borderColor: '#10B981'
                    }
                  ]}>
                    <View style={styles.tierHeader}>
                      <View style={styles.tierTitleRow}>
                        <Feather name="heart" size={24} color="#10B981" />
                        <Text style={[
                          styles.tierTitle,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {t('subscriptions.fanTier')}
                        </Text>
                        <View style={[styles.tierBadge, { backgroundColor: '#10B981' }]}>
                          <Text style={styles.tierBadgeText}>FREE</Text>
                        </View>
                      </View>
                      <Text style={[
                        styles.tierDescription,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {t('subscriptions.freeTier')}
                      </Text>
                    </View>
                    
                    <View style={styles.tierStats}>
                      <View style={styles.tierStat}>
                        <Text style={[
                          styles.tierStatValue,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {mockSubscriptionData.fan.total.toLocaleString()}
                        </Text>
                        <Text style={[
                          styles.tierStatLabel,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          Total Fans
                        </Text>
                      </View>
                      <View style={styles.tierStat}>
                        <Text style={[
                          styles.tierStatValue,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {mockSubscriptionData.fan.newThisMonth}
                        </Text>
                        <Text style={[
                          styles.tierStatLabel,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          New This Month
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* VIP Tier */}
                  <View style={[
                    styles.tierCard,
                    { 
                      backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                      borderColor: '#8B5CF6'
                    }
                  ]}>
                    <View style={styles.tierHeader}>
                      <View style={styles.tierTitleRow}>
                        <Feather name="star" size={24} color="#8B5CF6" />
                        <Text style={[
                          styles.tierTitle,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {t('subscriptions.vipTier')}
                        </Text>
                        <View style={[styles.tierBadge, { backgroundColor: '#8B5CF6' }]}>
                          <Text style={styles.tierBadgeText}>€15/mo</Text>
                        </View>
                      </View>
                      <Text style={[
                        styles.tierDescription,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {t('subscriptions.paidTier')}
                      </Text>
                    </View>
                    
                    <View style={styles.tierStats}>
                      <View style={styles.tierStat}>
                        <Text style={[
                          styles.tierStatValue,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          {mockSubscriptionData.vip.total.toLocaleString()}
                        </Text>
                        <Text style={[
                          styles.tierStatLabel,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          VIP Members
                        </Text>
                      </View>
                      <View style={styles.tierStat}>
                        <Text style={[
                          styles.tierStatValue,
                          { color: isDark ? '#FFFFFF' : '#111827' }
                        ]}>
                          €{(mockSubscriptionData.vip.revenue / 1000).toFixed(1)}k
                        </Text>
                        <Text style={[
                          styles.tierStatLabel,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          Monthly Revenue
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Key Metrics */}
              <View style={styles.metricsSection}>
                <Text style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Key Metrics
                </Text>
                
                <View style={styles.metricsGrid}>
                  <MetricCard
                    title={t('subscriptions.conversionRate')}
                    value={`${mockSubscriptionData.conversionRate}%`}
                    subtitle="Fan to VIP conversion"
                    trend="up"
                    trendValue="+2.1%"
                    icon="trending-up"
                    color="#10B981"
                  />
                  
                  <MetricCard
                    title={t('subscriptions.churnRate')}
                    value={`${mockSubscriptionData.churnRate}%`}
                    subtitle="Monthly cancellation rate"
                    trend="down"
                    trendValue="-0.8%"
                    icon="trending-down"
                    color="#EF4444"
                  />
                  
                  <MetricCard
                    title="Avg. Revenue Per User"
                    value={`€${(mockSubscriptionData.monthlyRevenue / mockSubscriptionData.vip.active).toFixed(0)}`}
                    subtitle="VIP subscribers only"
                    trend="up"
                    trendValue="+€2"
                    icon="dollar-sign"
                    color="#8B5CF6"
                  />
                </View>
              </View>

              {/* Filters */}
              <View style={styles.filtersRow}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterButton,
                      { 
                        backgroundColor: selectedFilter === filter.id 
                          ? '#3B82F6' 
                          : (isDark ? '#1F1F1F' : '#FFFFFF'),
                        borderColor: selectedFilter === filter.id 
                          ? '#3B82F6' 
                          : (isDark ? '#374151' : '#E5E7EB')
                      }
                    ]}
                    onPress={() => setSelectedFilter(filter.id)}
                  >
                    <Text style={[
                      styles.filterLabel,
                      { 
                        color: selectedFilter === filter.id 
                          ? '#FFFFFF'
                          : (isDark ? '#FFFFFF' : '#111827')
                      }
                    ]}>
                      {filter.label}
                    </Text>
                    <Text style={[
                      styles.filterCount,
                      { 
                        color: selectedFilter === filter.id 
                          ? 'rgba(255,255,255,0.8)'
                          : (isDark ? '#9CA3AF' : '#6B7280')
                      }
                    ]}>
                      {filter.count.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subscriptions Table */}
              <View style={[
                styles.subscriptionsTable,
                { 
                  backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB'
                }
              ]}>
                <View style={styles.tableHeader}>
                  <Text style={[
                    styles.tableTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    {t('subscriptions.subscriptionsList')}
                  </Text>
                </View>

                <View style={styles.tableContent}>
                  {mockSubscriptions.map((subscription) => (
                    <View key={subscription.id} style={[
                      styles.subscriptionRow,
                      { borderBottomColor: isDark ? '#374151' : '#E5E7EB' }
                    ]}>
                      <View style={styles.userInfo}>
                        <View style={styles.userAvatar}>
                          <Text style={styles.avatarText}>
                            {subscription.name.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.userDetails}>
                          <Text style={[
                            styles.userName,
                            { color: isDark ? '#FFFFFF' : '#111827' }
                          ]}>
                            {subscription.name}
                          </Text>
                          <Text style={[
                            styles.userEmail,
                            { color: isDark ? '#9CA3AF' : '#6B7280' }
                          ]}>
                            {subscription.email}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.subscriptionMeta}>
                        <View style={[
                          styles.typeBadge,
                          { backgroundColor: getSubscriptionColor(subscription.type) + '20' }
                        ]}>
                          <Text style={[
                            styles.typeText,
                            { color: getSubscriptionColor(subscription.type) }
                          ]}>
                            {subscription.type.toUpperCase()}
                          </Text>
                        </View>

                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(subscription.status) + '20' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(subscription.status) }
                          ]}>
                            {subscription.status}
                          </Text>
                        </View>

                        <Text style={[
                          styles.startDate,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          Started {new Date(subscription.startDate).toLocaleDateString()}
                        </Text>
                        
                        <Text style={[
                          styles.revenue,
                          { color: isDark ? '#10B981' : '#059669' }
                        ]}>
                          €{subscription.revenue} total
                        </Text>
                      </View>

                      <TouchableOpacity style={styles.moreButton}>
                        <Feather name="more-horizontal" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
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
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  dashboardGrid: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tiersSection: {
    marginBottom: 32,
  },
  tiersGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  tierCard: {
    flex: 1,
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  tierHeader: {
    marginBottom: 20,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tierDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tierStats: {
    flexDirection: 'row',
    gap: 24,
  },
  tierStat: {
    flex: 1,
  },
  tierStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  tierStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricsSection: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  trendText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  filterCount: {
    fontSize: 12,
  },
  subscriptionsTable: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableContent: {
    padding: 20,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
  },
  subscriptionMeta: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  startDate: {
    fontSize: 12,
    minWidth: 80,
  },
  revenue: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 70,
  },
  moreButton: {
    padding: 8,
  },
});
