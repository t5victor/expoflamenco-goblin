import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sidebar } from '@/components/Sidebar';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchExpoFlamencoUsers, type ProcessedUser } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = screenWidth < 768;

export default function UserDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { slug } = useLocalSearchParams<{ slug: string }>();
  
  const [user, setUser] = useState<ProcessedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        
        // Find user by slug
        const users = await fetchExpoFlamencoUsers();
        const foundUser = users.find(u => u.slug === slug);
        
        if (!foundUser) {
          console.error('User not found:', slug);
          return;
        }
        
        setUser(foundUser);
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [slug]);

  if (loading) {
    return (
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
      ]}>
        <View style={styles.layout}>
          {!isMobile && <Sidebar activeTab="users" onTabChange={() => {}} />}
          <View style={styles.content}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={[
                styles.loadingText,
                { color: isDark ? '#FFFFFF' : '#111827' }
              ]}>
                Cargando perfil de usuario...
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
      ]}>
        <View style={styles.layout}>
          {!isMobile && <Sidebar activeTab="users" onTabChange={() => {}} />}
          <View style={styles.content}>
            <View style={styles.errorContainer}>
              <Feather name="user-x" size={48} color={isDark ? '#374151' : '#E5E7EB'} />
              <Text style={[
                styles.errorText,
                { color: isDark ? '#9CA3AF' : '#6B7280' }
              ]}>
                Usuario no encontrado
              </Text>
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: '#3B82F6' }]}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>Volver</Text>
              </TouchableOpacity>
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
            {/* Header with Back Button */}
            <View style={[styles.header, isMobile && styles.headerMobile]}>
              <TouchableOpacity 
                style={styles.backButtonHeader}
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={20} color={isDark ? '#FFFFFF' : '#111827'} />
                <Text style={[
                  styles.backButtonHeaderText,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Volver a Usuarios
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.profileSection, isMobile && styles.profileSectionMobile]}>
              {/* User Profile Card */}
              <View style={[
                styles.profileCard,
                { 
                  backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB'
                }
              ]}>
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    {user.avatar ? (
                      <Image 
                        source={{ uri: user.avatar }} 
                        style={styles.profileAvatar}
                      />
                    ) : (
                      <View style={[styles.profileAvatar, styles.profileAvatarFallback]}>
                        <Text style={styles.profileAvatarText}>
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.profileInfo}>
                    <Text style={[
                      styles.profileName,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      {user.name}
                    </Text>
                    
                    <View style={styles.profileBadges}>
                      <View style={[
                        styles.roleBadge,
                        { backgroundColor: '#3B82F6' + '20' }
                      ]}>
                        <Text style={[
                          styles.roleText,
                          { color: '#3B82F6' }
                        ]}>
                          {user.role}
                        </Text>
                      </View>
                    </View>
                    
                    {user.description && (
                      <Text style={[
                        styles.profileDescription,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {user.description}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsGrid}>
                <View style={[
                  styles.statCard,
                  { 
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}>
                  <Feather name="edit" size={24} color="#3B82F6" />
                  <Text style={[
                    styles.statValue,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    {user.articlesCount || 0}
                  </Text>
                  <Text style={[
                    styles.statLabel,
                    { color: isDark ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    Artículos Publicados
                  </Text>
                </View>

                <View style={[
                  styles.statCard,
                  { 
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}>
                  <Feather name="calendar" size={24} color="#10B981" />
                  <Text style={[
                    styles.statValue,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    {user.joinDate}
                  </Text>
                  <Text style={[
                    styles.statLabel,
                    { color: isDark ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    Miembro desde
                  </Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: isMobile ? 16 : 20,
  },
  headerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonHeaderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  profileSection: {
    paddingHorizontal: isMobile ? 16 : 24,
    paddingBottom: 24,
  },
  profileSectionMobile: {
    paddingHorizontal: 16,
  },
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'center' : 'flex-start',
    gap: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileAvatarFallback: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    alignItems: isMobile ? 'center' : 'flex-start',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: isMobile ? 'center' : 'left',
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  profileDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: isMobile ? 'center' : 'left',
  },
  statsGrid: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});