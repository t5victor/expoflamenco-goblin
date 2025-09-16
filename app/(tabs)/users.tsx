import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sidebar } from '@/components/Sidebar';
import { Feather } from '@expo/vector-icons';
import { fetchExpoFlamencoUsers, type ProcessedUser } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = screenWidth < 768;

export default function UsersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [users, setUsers] = useState<ProcessedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await fetchExpoFlamencoUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    newThisMonth: Math.floor(users.length * 0.1), // Estimated 10% are new
    premiumUsers: Math.floor(users.length * 0.4), // Estimated 40% premium
    basicUsers: Math.floor(users.length * 0.4), // Estimated 40% basic
    freeUsers: Math.floor(users.length * 0.2), // Estimated 20% free
  };

  const filters = [
    { id: 'all', label: 'Todos', count: userStats.totalUsers },
    { id: 'active', label: 'Activos', count: userStats.activeUsers },
    { id: 'writers', label: 'Escritores', count: users.filter(u => u.articlesCount && u.articlesCount > 0).length },
    { id: 'contributors', label: 'Colaboradores', count: users.filter(u => u.articlesCount && u.articlesCount > 10).length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getRoleColor = (articlesCount: number = 0) => {
    if (articlesCount > 20) return '#8B5CF6'; // Expert
    if (articlesCount > 10) return '#3B82F6'; // Contributor
    if (articlesCount > 0) return '#10B981'; // Writer
    return '#6B7280'; // Reader
  };

  const getUserRole = (articlesCount: number = 0) => {
    if (articlesCount > 20) return 'Experto';
    if (articlesCount > 10) return 'Colaborador';
    if (articlesCount > 0) return 'Escritor';
    return 'Lector';
  };

  if (loading) {
    return (
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
      ]}>
        <View style={styles.layout}>
          <Sidebar activeTab="users" onTabChange={() => {}} />
          <View style={styles.content}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={[
                styles.loadingText,
                { color: isDark ? '#FFFFFF' : '#111827' }
              ]}>
                Cargando usuarios de ExpoFlamenco...
              </Text>
            </View>
          </View>
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
        {!isMobile && <Sidebar activeTab="users" onTabChange={() => {}} />}
        
        <View style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={[styles.header, isMobile && styles.headerMobile]}>
              <View style={styles.headerContent}>
                <Text style={[
                  styles.headerTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                  isMobile && styles.headerTitleMobile
                ]}>
                  Usuarios ExpoFlamenco
                </Text>
                <Text style={[
                  styles.headerSubtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                  isMobile && styles.headerSubtitleMobile
                ]}>
                  Gestión de usuarios y colaboradores de la plataforma
                </Text>
              </View>
              
              {!isMobile && (
                <TouchableOpacity style={[
                  styles.addButton,
                  { backgroundColor: '#3B82F6' }
                ]}>
                  <Feather name="plus" size={16} color="white" />
                  <Text style={styles.addButtonText}>Añadir Usuario</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.dashboardGrid, isMobile && styles.dashboardGridMobile]}>
              {/* User Stats */}
              <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
                <View style={[
                  styles.statCard,
                  isMobile && styles.statCardMobile,
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
                    Total Usuarios
                  </Text>
                </View>

                <View style={[
                  styles.statCard,
                  isMobile && styles.statCardMobile,
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
                    Usuarios Activos
                  </Text>
                </View>

                <View style={[
                  styles.statCard,
                  isMobile && styles.statCardMobile,
                  { 
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}>
                  <View style={styles.statHeader}>
                    <Feather name="edit" size={20} color="#8B5CF6" />
                    <Text style={[
                      styles.statValue,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {users.filter(u => u.articlesCount && u.articlesCount > 0).length}
                    </Text>
                  </View>
                  <Text style={[
                    styles.statLabel,
                    { color: isDark ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    Escritores
                  </Text>
                </View>
              </View>

              {/* Filters */}
              <View style={[styles.filtersRow, isMobile && styles.filtersRowMobile]}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterButton,
                      isMobile && styles.filterButtonMobile,
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
                isMobile && styles.usersTableMobile,
                { 
                  backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB'
                }
              ]}>
                <View style={[styles.tableHeader, isMobile && styles.tableHeaderMobile]}>
                  <Text style={[
                    styles.tableTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    Lista de Usuarios ({filteredUsers.length})
                  </Text>
                  <View style={styles.tableActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => setSearchQuery('')}
                    >
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
                  {filteredUsers.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Feather name="users" size={48} color={isDark ? '#374151' : '#E5E7EB'} />
                      <Text style={[
                        styles.emptyStateText,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        No se encontraron usuarios
                      </Text>
                    </View>
                  ) : (
                    filteredUsers.map((user) => (
                      <View key={user.id} style={[
                        styles.userRow,
                        isMobile && styles.userRowMobile,
                        { borderBottomColor: isDark ? '#374151' : '#E5E7EB' }
                      ]}>
                        <View style={[styles.userInfo, isMobile && styles.userInfoMobile]}>
                          {user.avatar ? (
                            <Image 
                              source={{ uri: user.avatar }} 
                              style={styles.userAvatar}
                              onError={() => console.log('Avatar failed to load')}
                            />
                          ) : (
                            <View style={[styles.userAvatar, styles.userAvatarFallback]}>
                              <Text style={styles.avatarText}>
                                {user.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <View style={styles.userDetails}>
                            <Text style={[
                              styles.userName,
                              { color: isDark ? '#FFFFFF' : '#111827' }
                            ]}>
                              {user.name}
                            </Text>
                            <Text style={[
                              styles.userDescription,
                              { color: isDark ? '#9CA3AF' : '#6B7280' }
                            ]} numberOfLines={isMobile ? 2 : 1}>
                              {user.description}
                            </Text>
                          </View>
                        </View>

                        {!isMobile && (
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
                              styles.roleBadge,
                              { backgroundColor: getRoleColor(user.articlesCount) + '20' }
                            ]}>
                              <Text style={[
                                styles.roleText,
                                { color: getRoleColor(user.articlesCount) }
                              ]}>
                                {getUserRole(user.articlesCount)}
                              </Text>
                            </View>

                            <Text style={[
                              styles.articlesCount,
                              { color: isDark ? '#9CA3AF' : '#6B7280' }
                            ]}>
                              {user.articlesCount || 0} artículos
                            </Text>
                            
                            <Text style={[
                              styles.joinDate,
                              { color: isDark ? '#9CA3AF' : '#6B7280' }
                            ]}>
                              Desde {user.joinDate}
                            </Text>
                          </View>
                        )}

                        <TouchableOpacity 
                          style={styles.moreButton}
                          onPress={() => {
                            if (user.link && isWeb) {
                              window.open(user.link, '_blank');
                            }
                          }}
                        >
                          <Feather name="external-link" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
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
    flexDirection: isMobile ? 'column' : 'row',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'flex-start',
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: isMobile ? 16 : 20,
  },
  headerMobile: {
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerTitleMobile: {
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: isMobile ? 13 : 14,
  },
  headerSubtitleMobile: {
    fontSize: 13,
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
    paddingHorizontal: isMobile ? 16 : 24,
    paddingBottom: 24,
  },
  dashboardGridMobile: {
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 12 : 16,
    marginBottom: 24,
  },
  statsRowMobile: {
    flexDirection: 'column',
    gap: 12,
  },
  statCard: {
    flex: isMobile ? undefined : 1,
    padding: isMobile ? 16 : 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  statCardMobile: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: isMobile ? 13 : 14,
    fontWeight: '500',
  },
  filtersRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 8 : 12,
    marginBottom: 24,
  },
  filtersRowMobile: {
    flexDirection: 'column',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: isMobile ? undefined : 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButtonMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: isMobile ? 0 : 2,
  },
  filterCount: {
    fontSize: 12,
  },
  usersTable: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  usersTableMobile: {
    marginHorizontal: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderMobile: {
    padding: 16,
  },
  tableTitle: {
    fontSize: isMobile ? 14 : 16,
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
    padding: isMobile ? 16 : 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  userRow: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: isMobile ? 8 : 0,
  },
  userRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: isMobile ? undefined : 2,
    width: isMobile ? '100%' : undefined,
  },
  userInfoMobile: {
    width: '100%',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatarFallback: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: isMobile ? 15 : 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  userDescription: {
    fontSize: isMobile ? 13 : 12,
    lineHeight: isMobile ? 18 : 16,
  },
  userEmail: {
    fontSize: 12,
  },
  userMeta: {
    flex: 3,
    flexDirection: isMobile ? 'row' : 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
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
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  articlesCount: {
    fontSize: 12,
    minWidth: 80,
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
    alignSelf: isMobile ? 'flex-end' : 'center',
  },
});
