import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Dimensions } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Platform.OS === 'ios' ? '#007AFF' : '#3B82F6', // Use iOS system blue for better glass integration
        tabBarInactiveTintColor: Platform.OS === 'ios' 
          ? (colorScheme === 'dark' ? '#8E8E93' : '#8E8E93') // iOS system gray
          : (colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: isMobile ? {
          height: 96,
          paddingBottom: 18,
          paddingTop: 18,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          ...Platform.select({
            ios: {
              position: 'absolute',
              bottom: 18,
              left: 32,
              right: 32,
              borderRadius: 36,
              overflow: 'hidden',
            },
            default: {
              backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            }
          }),
        } : { display: 'none' },
      }}>
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
