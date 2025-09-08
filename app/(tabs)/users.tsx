import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sidebar } from '@/components/Sidebar';
import { Feather } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const mockUsers = [
  { id: 1, name: 'María González', email: 'maria@example.com', status: 'active', subscription: 'Premium', joinDate: '2024-01-15', lastSeen: '2 hours ago' },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com', status: 'active', subscription: 'Basic', joinDate: '2024-02-03', lastSeen: '1 day ago' },
  { id: 3, name: 'Ana Martín', email: 'ana@example.com', status: 'inactive', subscription: 'Premium', joinDate: '2023-12-10', lastSeen: '1 week ago' },
  { id: 4, name: 'José López', email: 'jose@example.com', status: 'active', subscription: 'Free', joinDate: '2024-03-22', lastSeen: '30 min ago' },
  { id: 5, name: 'Isabel Torres', email: 'isabel@example.com', status: 'pending', subscription: 'Basic', joinDate: '2024-03-28', lastSeen: 'Never' },
];

const userStats = {
  totalUsers: 8923,
  activeUsers: 7456,
  newThisMonth: 234,
  premiumUsers: 3421,
  basicUsers: 4035,
  freeUsers: 1467,
};

export default function UsersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Users', count: userStats.totalUsers },
    { id: 'active', label: 'Active', count: userStats.activeUsers },
    { id: 'premium', label: 'Premium', count: userStats.premiumUsers },
    { id: 'basic', label: 'Basic', count: userStats.basicUsers },
    { id: 'free', label: 'Free', count: userStats.freeUsers },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'Premium': return '#8B5CF6';
      case 'Basic': return '#3B82F6';
      case 'Free': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <View style={styles.layout}>
        <Sidebar activeTab="users" onTabChange={() => {}} />
        
        <View style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[
                  styles.headerTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Users
                </Text>
                <Text style={[
                  styles.headerSubtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' }
                ]}>
                  Manage subscribers and user accounts from FluentCRM
                </Text>
              </View>
              
              <TouchableOpacity style={[
                styles.addButton,
                { backgroundColor: '#3B82F6' }
              ]}>
                <Feather name="plus" size={16} color="white" />
                <Text style={styles.addButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dashboardGrid}>
              {/* User Stats */}
              <View style={styles.statsRow}>
                <View style={[
                  styles.statCard,
                  { 
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}>
                  <View style={styles.statHeader}>
                    <Feather name="users" size={20} color="#3B82F6" />
                    <Text style={[
                      styles.statValue,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {userStats.totalUsers.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={[
                    styles.statLabel,
                    { color: isDark ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    Total Users
                  </Text>
                </View>

                <View style={[
                  styles.statCard,
                  { 
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}>
                  <View style={styles.statHeader}>
                    <Feather name="activity" size={20} color="#10B981" />
                    <Text style={[
                      styles.statValue,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {userStats.activeUsers.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={[
                    styles.statLabel,
                    { color: isDark ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    Active Users
                  </Text>
                </View>

                <View style={[
                  styles.statCard,
                  { 
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}>
                  <View style={styles.statHeader}>
                    <Feather name="user-plus" size={20} color="#F59E0B" />
                    <Text style={[
                      styles.statValue,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {userStats.newThisMonth.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={[
                    styles.statLabel,
                    { color: isDark ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    New This Month
                  </Text>
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

              {/* Users Table */}
              <View style={[
                styles.usersTable,
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
                    User List
                  </Text>
                  <View style={styles.tableActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Feather name="search" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Feather name="filter" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Feather name="download" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.tableContent}>
                  {mockUsers.map((user) => (
                    <View key={user.id} style={[
                      styles.userRow,
                      { borderBottomColor: isDark ? '#374151' : '#E5E7EB' }
                    ]}>
                      <View style={styles.userInfo}>
                        <View style={styles.userAvatar}>
                          <Text style={styles.avatarText}>
                            {user.name.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.userDetails}>
                          <Text style={[
                            styles.userName,
                            { color: isDark ? '#FFFFFF' : '#111827' }
                          ]}>
                            {user.name}
                          </Text>
                          <Text style={[
                            styles.userEmail,
                            { color: isDark ? '#9CA3AF' : '#6B7280' }
                          ]}>
                            {user.email}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.userMeta}>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(user.status) + '20' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(user.status) }
                          ]}>
                            {user.status}
                          </Text>
                        </View>

                        <View style={[
                          styles.subscriptionBadge,
                          { backgroundColor: getSubscriptionColor(user.subscription) + '20' }
                        ]}>
                          <Text style={[
                            styles.subscriptionText,
                            { color: getSubscriptionColor(user.subscription) }
                          ]}>
                            {user.subscription}
                          </Text>
                        </View>

                        <Text style={[
                          styles.joinDate,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          Joined {new Date(user.joinDate).toLocaleDateString()}
                        </Text>
                        
                        <Text style={[
                          styles.lastSeen,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          Last seen {user.lastSeen}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  dashboardGrid: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
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
  usersTable: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  tableContent: {
    padding: 20,
  },
  userRow: {
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
  userMeta: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  subscriptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  joinDate: {
    fontSize: 12,
    minWidth: 80,
  },
  lastSeen: {
    fontSize: 12,
    minWidth: 80,
  },
  moreButton: {
    padding: 8,
  },
});
