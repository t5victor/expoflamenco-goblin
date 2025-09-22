import React from 'react';
import { DynamicColorIOS, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {
  if (Platform.OS === 'ios') {
    return (
      <NativeTabs
      style={{
        // For the text color
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
        // For the selected icon color
        tintColor: DynamicColorIOS({
          dark: '#DA2B1F',
          light: 'black',
        }),
      }}>
        <NativeTabs.Trigger name="admin">
          <Icon sf="chart.bar.fill" />
          <Label>Analytics</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="users">
          <Icon sf="doc.text.fill" />
          <Label>Artículos</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="subscriptions">
          <Icon sf="person.text.rectangle.fill" />
          <Label>Perfil</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="explore" tintColor="#DA2B1F">
          <Icon sf="gearshape.fill" />
          <Label>Ajustes</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#DA2B1F',
      tabBarInactiveTintColor: '#6B7280',
    }}>
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Artículos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="doc.text.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.text.rectangle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
