import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t, language, changeLanguage, getAvailableLanguages } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('settings.logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <IconSymbol name="gear" size={28} color={isDark ? '#FFFFFF' : '#111827'} />
            <Text style={[
              styles.headerTitle,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              {t('settings.title')}
            </Text>
          </View>
          <Text style={[
            styles.headerSubtitle,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]}>
            {t('settings.subtitle')}
          </Text>
        </View>

        <View style={[styles.settingsContainer, isMobile && styles.mobileSettingsContainer]}>
          {/* Language Settings */}
          <View style={[styles.settingCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {t('languages.languageSettings')}
            </Text>

            <View style={styles.languageContainer}>
              {getAvailableLanguages().map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    {
                      backgroundColor: language === lang.code
                        ? '#DA2B1F'
                        : (isDark ? '#374151' : '#F3F4F6'),
                      borderColor: language === lang.code
                        ? '#DA2B1F'
                        : (isDark ? '#4B5563' : '#E5E7EB'),
                    }
                  ]}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <Text style={[
                    styles.languageFlag,
                    { marginRight: 8 }
                  ]}>
                    {lang.flag}
                  </Text>
                  <Text style={[
                    styles.languageText,
                    {
                      color: language === lang.code ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#111827')
                    }
                  ]}>
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logout */}
          <View style={[styles.settingCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <IconSymbol name="arrow.right.square" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>
                {t('settings.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={[
            styles.footerText,
            { color: isDark ? '#6B7280' : '#9CA3AF' }
          ]}>
            INTERNAL PROJECT GOBLIN v0.9
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginLeft: 16,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },

  settingsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  settingCard: {
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  languageContainer: {
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 12,
  },

  // Mobile Styles
  mobileSettingsContainer: {
    paddingHorizontal: 16,
  },

  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
});