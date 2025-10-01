import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Switch } from 'react-native';
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

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    articleMilestones: true,
    performanceAlerts: false,
    weeklySummary: true,
    dailyDigest: false,
  });

  // Work mode state
  const [selectedWorkMode, setSelectedWorkMode] = useState('overview');

  // Data retrieval state
  const [defaultTimePeriod, setDefaultTimePeriod] = useState('7d');

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

  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
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

          {/* Notification Settings */}
          <View style={[styles.settingCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {t('settings.notifications.title')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {t('settings.notifications.subtitle')}
            </Text>

            <View style={styles.notificationList}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {t('settings.notifications.articleMilestones')}
                  </Text>
                  <Text style={[styles.notificationDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {t('settings.notifications.articleMilestonesDesc')}
                  </Text>
                </View>
                <Switch
                  value={notifications.articleMilestones}
                  onValueChange={(value) => updateNotification('articleMilestones', value)}
                  trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#DA2B1F' }}
                  thumbColor={notifications.articleMilestones ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {t('settings.notifications.performanceAlerts')}
                  </Text>
                  <Text style={[styles.notificationDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {t('settings.notifications.performanceAlertsDesc')}
                  </Text>
                </View>
                <Switch
                  value={notifications.performanceAlerts}
                  onValueChange={(value) => updateNotification('performanceAlerts', value)}
                  trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#DA2B1F' }}
                  thumbColor={notifications.performanceAlerts ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {t('settings.notifications.weeklySummary')}
                  </Text>
                  <Text style={[styles.notificationDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {t('settings.notifications.weeklySummaryDesc')}
                  </Text>
                </View>
                <Switch
                  value={notifications.weeklySummary}
                  onValueChange={(value) => updateNotification('weeklySummary', value)}
                  trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#DA2B1F' }}
                  thumbColor={notifications.weeklySummary ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {t('settings.notifications.dailyDigest')}
                  </Text>
                  <Text style={[styles.notificationDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {t('settings.notifications.dailyDigestDesc')}
                  </Text>
                </View>
                <Switch
                  value={notifications.dailyDigest}
                  onValueChange={(value) => updateNotification('dailyDigest', value)}
                  trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#DA2B1F' }}
                  thumbColor={notifications.dailyDigest ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')}
                />
              </View>
            </View>
          </View>

          {/* Work Modes */}
          <View style={[styles.settingCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {t('settings.workModes.title')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {t('settings.workModes.subtitle')}
            </Text>

            <View style={styles.workModeList}>
              {[
                { key: 'overview', name: t('settings.workModes.overview'), desc: t('settings.workModes.overviewDesc') },
                { key: 'detailed', name: t('settings.workModes.detailed'), desc: t('settings.workModes.detailedDesc') },
                { key: 'creative', name: t('settings.workModes.creative'), desc: t('settings.workModes.creativeDesc') },
                { key: 'business', name: t('settings.workModes.business'), desc: t('settings.workModes.businessDesc') },
              ].map((mode) => {
                const getIconName = (key: string) => {
                  switch (key) {
                    case 'overview': return 'chart.bar' as const;
                    case 'detailed': return 'chart.pie' as const;
                    case 'creative': return 'paintbrush' as const;
                    case 'business': return 'briefcase' as const;
                    default: return 'chart.bar' as const;
                  }
                };

                return (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.workModeItem,
                      {
                        backgroundColor: selectedWorkMode === mode.key
                          ? '#DA2B1F'
                          : (isDark ? '#374151' : '#F3F4F6'),
                        borderColor: selectedWorkMode === mode.key
                          ? '#DA2B1F'
                          : (isDark ? '#4B5563' : '#E5E7EB'),
                      }
                    ]}
                    onPress={() => setSelectedWorkMode(mode.key)}
                  >
                    <IconSymbol name={getIconName(mode.key)} size={24} color={selectedWorkMode === mode.key ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#111827')} />
                    <View style={styles.workModeContent}>
                      <Text style={[
                        styles.workModeTitle,
                        { color: selectedWorkMode === mode.key ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#111827') }
                      ]}>
                        {mode.name}
                      </Text>
                      <Text style={[
                        styles.workModeDescription,
                        { color: selectedWorkMode === mode.key ? 'rgba(255,255,255,0.8)' : (isDark ? '#9CA3AF' : '#6B7280') }
                      ]}>
                        {mode.desc}
                      </Text>
                    </View>
                    {selectedWorkMode === mode.key && (
                      <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Data Retrieval Settings */}
          <View style={[styles.settingCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {t('settings.dataRetrieval.title')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {t('settings.dataRetrieval.subtitle')}
            </Text>

            <View style={styles.dataRetrievalContent}>
              <Text style={[styles.dataRetrievalLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {t('settings.dataRetrieval.defaultPeriod')}
              </Text>
              <Text style={[styles.dataRetrievalDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {t('settings.dataRetrieval.defaultPeriodDesc')}
              </Text>

              <View style={styles.timePeriodGrid}>
                {[
                  { key: '24h', label: t('settings.dataRetrieval.periods.24h') },
                  { key: '7d', label: t('settings.dataRetrieval.periods.7d') },
                  { key: '30d', label: t('settings.dataRetrieval.periods.30d') },
                  { key: '90d', label: t('settings.dataRetrieval.periods.90d') },
                  { key: '1y', label: t('settings.dataRetrieval.periods.1y') },
                  { key: 'all', label: t('settings.dataRetrieval.periods.all') },
                ].map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.timePeriodOption,
                      {
                        backgroundColor: defaultTimePeriod === key
                          ? '#DA2B1F'
                          : (isDark ? '#374151' : '#F3F4F6'),
                        borderColor: defaultTimePeriod === key
                          ? '#DA2B1F'
                          : (isDark ? '#4B5563' : '#E5E7EB'),
                      }
                    ]}
                    onPress={() => setDefaultTimePeriod(key)}
                  >
                    <Text style={[
                      styles.timePeriodText,
                      {
                        color: defaultTimePeriod === key ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#111827')
                      }
                    ]}>
                      {label}
                    </Text>
                    {defaultTimePeriod === key && (
                      <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
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
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
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

  // Notification Settings Styles
  notificationList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 18,
  },

  // Work Modes Styles
  workModeList: {
    gap: 12,
  },
  workModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  workModeContent: {
    flex: 1,
  },
  workModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  workModeDescription: {
    fontSize: 14,
    lineHeight: 18,
  },

  // Data Retrieval Styles
  dataRetrievalContent: {
    gap: 16,
  },
  dataRetrievalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dataRetrievalDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  timePeriodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timePeriodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    justifyContent: 'center',
    gap: 6,
  },
  timePeriodText: {
    fontSize: 14,
    fontWeight: '500',
  },
});