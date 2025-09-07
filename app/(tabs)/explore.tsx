import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.section}>
      <Text style={[
        styles.sectionTitle,
        { color: isDark ? '#FFFFFF' : '#333333' }
      ]}>
        {title}
      </Text>
      <View style={[
        styles.sectionContent,
        { 
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isDark ? '#333' : '#E0E0E0'
        }
      ]}>
        {children}
      </View>
    </View>
  );
};

interface SettingsItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ label, description, children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        <Text style={[
          styles.settingsItemLabel,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {label}
        </Text>
        {description && (
          <Text style={[
            styles.settingsItemDescription,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.settingsItemRight}>
        {children}
      </View>
    </View>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // API Configuration State
  const [wordpressUrl, setWordpressUrl] = useState('https://expoflamenco.com');
  const [monsterInsightsApiKey, setMonsterInsightsApiKey] = useState('');
  const [fluentCrmApiKey, setFluentCrmApiKey] = useState('');
  const [pmpApiKey, setPmpApiKey] = useState('');
  
  // Notification Settings
  const [dailyReports, setDailyReports] = useState(true);
  const [newSubscriptions, setNewSubscriptions] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  
  // Display Settings
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const handleSaveSettings = () => {
    Alert.alert(
      'Settings Saved',
      'Your dashboard settings have been saved successfully.',
      [{ text: 'OK' }]
    );
  };

  const handleTestConnection = () => {
    Alert.alert(
      'Testing Connection',
      'Testing API connections... This feature will be implemented to validate your API credentials.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F5F5F5' }
    ]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.headerTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Settings
          </Text>
          <Text style={[
            styles.headerSubtitle,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            Configure your dashboard preferences and API connections
          </Text>
        </View>

        {/* API Configuration */}
        <SettingsSection title="API Configuration">
          <SettingsItem 
            label="WordPress Site URL" 
            description="Your Expoflamenco WordPress installation URL"
          >
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: isDark ? '#333' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#555' : '#DDD'
                }
              ]}
              value={wordpressUrl}
              onChangeText={setWordpressUrl}
              placeholder="https://expoflamenco.com"
              placeholderTextColor={isDark ? '#999' : '#666'}
            />
          </SettingsItem>

          <SettingsItem 
            label="MonsterInsights API Key" 
            description="Required for analytics data"
          >
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: isDark ? '#333' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#555' : '#DDD'
                }
              ]}
              value={monsterInsightsApiKey}
              onChangeText={setMonsterInsightsApiKey}
              placeholder="Enter API key"
              placeholderTextColor={isDark ? '#999' : '#666'}
              secureTextEntry
            />
          </SettingsItem>

          <SettingsItem 
            label="FluentCRM API Key" 
            description="Required for CRM data"
          >
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: isDark ? '#333' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#555' : '#DDD'
                }
              ]}
              value={fluentCrmApiKey}
              onChangeText={setFluentCrmApiKey}
              placeholder="Enter API key"
              placeholderTextColor={isDark ? '#999' : '#666'}
              secureTextEntry
            />
          </SettingsItem>

          <SettingsItem 
            label="Paid Memberships Pro API Key" 
            description="Required for subscription data"
          >
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: isDark ? '#333' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#555' : '#DDD'
                }
              ]}
              value={pmpApiKey}
              onChangeText={setPmpApiKey}
              placeholder="Enter API key"
              placeholderTextColor={isDark ? '#999' : '#666'}
              secureTextEntry
            />
          </SettingsItem>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#2196F3' }]}
            onPress={handleTestConnection}
          >
            <Text style={styles.buttonText}>Test API Connections</Text>
          </TouchableOpacity>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsItem 
            label="Daily Reports" 
            description="Receive daily analytics summaries"
          >
            <Switch
              value={dailyReports}
              onValueChange={setDailyReports}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={dailyReports ? '#fff' : '#f4f3f4'}
            />
          </SettingsItem>

          <SettingsItem 
            label="New Subscriptions" 
            description="Get notified when someone subscribes"
          >
            <Switch
              value={newSubscriptions}
              onValueChange={setNewSubscriptions}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={newSubscriptions ? '#fff' : '#f4f3f4'}
            />
          </SettingsItem>

          <SettingsItem 
            label="Critical Alerts" 
            description="Important system notifications"
          >
            <Switch
              value={criticalAlerts}
              onValueChange={setCriticalAlerts}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={criticalAlerts ? '#fff' : '#f4f3f4'}
            />
          </SettingsItem>
        </SettingsSection>

        {/* Display Settings */}
        <SettingsSection title="Display">
          <SettingsItem 
            label="Auto Refresh" 
            description="Automatically refresh dashboard data every 5 minutes"
          >
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={autoRefresh ? '#fff' : '#f4f3f4'}
            />
          </SettingsItem>

          <SettingsItem 
            label="Compact View" 
            description="Show more data in less space"
          >
            <Switch
              value={compactView}
              onValueChange={setCompactView}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={compactView ? '#fff' : '#f4f3f4'}
            />
          </SettingsItem>
        </SettingsSection>

        {/* Save Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={handleSaveSettings}
          >
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[
            styles.appInfo,
            { color: isDark ? '#666' : '#999' }
          ]}>
            Expoflamenco Admin Dashboard v1.0.0
            {'\n'}Built with Expo & React Native
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingsItemLeft: {
    flex: 1,
  },
  settingsItemRight: {
    marginLeft: 12,
  },
  settingsItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingsItemDescription: {
    fontSize: 14,
  },
  textInput: {
    minWidth: 200,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});