import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sidebar } from '@/components/Sidebar';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Filter users based on search query and selected filter
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Role filter based on real WordPress roles
    switch (selectedFilter) {
      case 'all':
        return true;
      case 'administrators':
        return user.role === 'Administrador';
      case 'editors':
        return user.role === 'Editor';
      case 'authors':
        return user.role === 'Autor';
      case 'contributors':
        return user.role === 'Colaborador';
      case 'writers':
        return user.role === 'Escritor';
      default:
        return true;
    }
  });

  const userStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    newThisMonth: Math.floor(users.length * 0.1), // Estimated 10% are new
    premiumUsers: Math.floor(users.length * 0.4), // Estimated 40% premium
    basicUsers: Math.floor(users.length * 0.4), // Estimated 40% basic
    freeUsers: Math.floor(users.length * 0.2), // Estimated 20% free
  };

  const filters = [
    { id: 'all', label: 'Todo el Equipo', count: userStats.totalUsers, icon: 'users' },
    { id: 'administrators', label: 'Administradores', count: users.filter(u => u.role === 'Administrador').length, icon: 'shield' },
    { id: 'editors', label: 'Editores', count: users.filter(u => u.role === 'Editor').length, icon: 'edit-3' },
    { id: 'authors', label: 'Autores', count: users.filter(u => u.role === 'Autor').length, icon: 'feather' },
    { id: 'contributors', label: 'Colaboradores', count: users.filter(u => u.role === 'Colaborador').length, icon: 'users' },
    { id: 'writers', label: 'Escritores', count: users.filter(u => u.role === 'Escritor').length, icon: 'pen-tool' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getRoleColor = (role: string = 'Lector') => {
    switch (role) {
      case 'Administrador': return '#DC2626'; // Red
      case 'Editor': return '#8B5CF6'; // Purple
      case 'Autor': return '#EF4444'; // Red-Orange
      case 'Colaborador': return '#3B82F6'; // Blue
      case 'Escritor': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  const getMembershipColor = (membershipLevel: string = 'Free') => {
    switch (membershipLevel) {
      case 'VIP': return '#8B5CF6'; // Purple
      case 'Premium': return '#3B82F6'; // Blue
      case 'Free': return '#6B7280'; // Gray
      default: return '#6B7280'; // Gray
    }
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
                    Equipo Total
                  </Text>
                </View>
              </View>

              {/* Role Filter Dropdown */}
              <View style={[styles.filtersContainer, isMobile && styles.filtersContainerMobile]}>
                <Text style={[
                  styles.filtersTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Filtrar por Rol:
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dropdown,
                    { 
                      backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E5E7EB'
                    }
                  ]}
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <Text style={[
                    styles.dropdownText,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    {filters.find(f => f.id === selectedFilter)?.label || 'Seleccionar rol'}
                  </Text>
                  <Feather 
                    name={showDropdown ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color={isDark ? '#9CA3AF' : '#6B7280'} 
                  />
                </TouchableOpacity>
                
                {showDropdown && (
                  <View style={[
                    styles.dropdownMenu,
                    { 
                      backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E5E7EB'
                    }
                  ]}>
                    {filters.map((filter) => (
                      <TouchableOpacity
                        key={filter.id}
                        style={[
                          styles.dropdownItem,
                          selectedFilter === filter.id && styles.dropdownItemSelected,
                          selectedFilter === filter.id && { backgroundColor: '#3B82F6' + '20' }
                        ]}
                        onPress={() => {
                          setSelectedFilter(filter.id);
                          setShowDropdown(false);
                        }}
                      >
                        <Feather 
                          name={filter.icon as any} 
                          size={14} 
                          color={selectedFilter === filter.id 
                            ? '#3B82F6'
                            : (isDark ? '#9CA3AF' : '#6B7280')
                          } 
                        />
                        <Text style={[
                          styles.dropdownItemText,
                          { 
                            color: selectedFilter === filter.id 
                              ? '#3B82F6'
                              : (isDark ? '#FFFFFF' : '#111827')
                          }
                        ]}>
                          {filter.label}
                        </Text>
                        <Text style={[
                          styles.dropdownItemCount,
                          { 
                            color: selectedFilter === filter.id 
                              ? '#3B82F6'
                              : (isDark ? '#9CA3AF' : '#6B7280')
                          }
                        ]}>
                          ({filter.count})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
                        styles.userCard,
                        isMobile && styles.userCardMobile,
                        { 
                          backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}>
                        <View style={styles.userCardContent}>
                          <View style={styles.userAvatarContainer}>
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
                          </View>
                          
                          <View style={styles.userInfo}>
                            <TouchableOpacity 
                              onPress={() => {
                                if (user.slug) {
                                  router.push(`/user/${user.slug}`);
                                }
                              }}
                            >
                              <Text style={[
                                styles.userName,
                                { color: isDark ? '#FFFFFF' : '#111827' }
                              ]}>
                                {user.name}
                              </Text>
                            </TouchableOpacity>
                            
                            <Text style={[
                              styles.userDescription,
                              { color: isDark ? '#9CA3AF' : '#6B7280' }
                            ]} numberOfLines={isMobile ? 3 : 2}>
                              {user.description}
                            </Text>
                            
                            <View style={styles.userBadges}>
                              <View style={[
                                styles.roleBadge,
                                { backgroundColor: getRoleColor(user.role) + '20' }
                              ]}>
                                <Text style={[
                                  styles.roleText,
                                  { color: getRoleColor(user.role) }
                                ]}>
                                  {user.role || 'Colaborador'}
                                </Text>
                              </View>
                              
                              {user.isVIP && (
                                <View style={[
                                  styles.membershipBadge,
                                  { backgroundColor: getMembershipColor(user.membershipLevel) + '20' }
                                ]}>
                                  <Text style={[
                                    styles.membershipText,
                                    { color: getMembershipColor(user.membershipLevel) }
                                  ]}>
                                    {user.membershipLevel}
                                  </Text>
                                </View>
                              )}
                              
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
                            </View>
                          </View>
                        </View>

                        {!isMobile && (
                          <View style={styles.userStats}>
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
  filtersContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  filtersContainerMobile: {
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dropdownItemCount: {
    fontSize: 12,
    fontWeight: '500',
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
  userCard: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  userCardMobile: {
    marginBottom: 12,
  },
  userCardContent: {
    flexDirection: isMobile ? 'column' : 'row',
    padding: 16,
    alignItems: isMobile ? 'center' : 'flex-start',
    gap: 16,
  },
  userAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    alignItems: isMobile ? 'center' : 'flex-start',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: isMobile ? 18 : 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: isMobile ? 'center' : 'left',
  },
  userDescription: {
    fontSize: isMobile ? 14 : 13,
    lineHeight: isMobile ? 20 : 18,
    textAlign: isMobile ? 'center' : 'left',
    marginBottom: 12,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: isMobile ? 'center' : 'flex-start',
    flexWrap: 'wrap',
  },
  userStats: {
    alignItems: 'flex-end',
    gap: 4,
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
  membershipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipText: {
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
});
