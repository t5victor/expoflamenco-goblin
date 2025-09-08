import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const getMenuItems = (t: (key: string) => string) => [
  { id: 'admin', label: t('nav.overview'), icon: 'bar-chart-2', route: '/(tabs)/admin' },
  { id: 'analytics', label: t('nav.analytics'), icon: 'trending-up', route: '/(tabs)/analytics' },
  { id: 'users', label: t('nav.users'), icon: 'users', route: '/(tabs)/users' },
  { id: 'subscriptions', label: t('nav.subscriptions'), icon: 'credit-card', route: '/(tabs)/subscriptions' },
  { id: 'content', label: t('nav.content'), icon: 'file-text', route: '/(tabs)/content' },
  { id: 'explore', label: t('nav.settings'), icon: 'settings', route: '/(tabs)/explore' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const isDesktop = screenWidth >= 768;
  const menuItems = getMenuItems(t);

  if (!isDesktop) return null;

  return (
    <View style={[
      styles.sidebar,
      { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }
    ]}>
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/logo-web-expoflamenco-1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              activeTab === item.id && styles.activeMenuItem,
              activeTab === item.id && { backgroundColor: isDark ? '#333333' : '#F0F0F0' }
            ]}
            onPress={() => router.push(item.route)}
          >
            <Feather 
              name={item.icon} 
              size={18} 
              color={isDark ? '#FFFFFF' : '#333333'} 
              style={{ marginRight: 12 }}
            />
            <Text style={[
              styles.menuLabel,
              { color: isDark ? '#FFFFFF' : '#333333' },
              activeTab === item.id && { fontWeight: '600' }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={[
          styles.statusDot,
          { backgroundColor: '#4CAF50' }
        ]} />
        <Text style={[
          styles.statusText,
          { color: isDark ? '#888888' : '#666666' }
        ]}>
          {t('status.allSystemsOperational')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    height: '100%',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 42,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: '#F0F0F0',
  },
  menuLabel: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
  },
});
