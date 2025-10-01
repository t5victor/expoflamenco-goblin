import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Sidebar } from '@/components/Sidebar';
import { Feather } from '@expo/vector-icons';

export default function SubscriptionsScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <View style={styles.layout}>
        <Sidebar activeTab="subscriptions" onTabChange={() => {}} />

        <View style={styles.content}>
          <View style={styles.warningContainer}>
            <Feather name="alert-triangle" size={64} color="#DA2B1F" />
            <Text style={[
              styles.warningTitle,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              {t('profile.underDevelopmentTitle')}
            </Text>
            <Text style={[
              styles.warningText,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              {t('profile.underDevelopmentMessage')}
            </Text>
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    maxWidth: 400,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
