import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#FFFFFF' : '#111827' }
        ]}>
          {title}
        </Text>
        <View style={[
          styles.sectionDivider,
          { backgroundColor: isDark ? '#374151' : '#E5E7EB' }
        ]} />
      </View>
      <View style={[
        styles.sectionContent,
        { 
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          shadowColor: isDark ? '#000000' : '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
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
  isLast?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ label, description, children, isLast = false }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[
      styles.settingsItem,
      !isLast && {
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#F3F4F6'
      }
    ]}>
      <View style={styles.settingsItemLeft}>
        <Text style={[
          styles.settingsItemLabel,
          { color: isDark ? '#FFFFFF' : '#111827' }
        ]}>
          {label}
        </Text>
        {description && (
          <Text style={[
            styles.settingsItemDescription,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
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

interface ColorOptionProps {
  color: string;
  selected: boolean;
  onPress: () => void;
  label?: string;
}

const ColorOption: React.FC<ColorOptionProps> = ({ color, selected, onPress, label }) => {
  return (
    <TouchableOpacity
      style={[
        styles.colorOption,
        { backgroundColor: color },
        selected && styles.colorOptionSelected
      ]}
      onPress={onPress}
    >
      {selected && (
        <Feather name="check" size={16} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
};

interface FontOptionProps {
  fontFamily: string;
  displayName: string;
  selected: boolean;
  onPress: () => void;
}

const FontOption: React.FC<FontOptionProps> = ({ fontFamily, displayName, selected, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.fontOption,
        {
          backgroundColor: selected 
            ? (isDark ? '#10B981' : '#10B981') 
            : (isDark ? '#374151' : '#F8FAFC'),
          borderColor: selected 
            ? '#10B981' 
            : (isDark ? '#4B5563' : '#E2E8F0'),
          transform: [{ scale: selected ? 1.02 : 1 }],
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.fontOptionText,
        { 
          color: selected ? '#FFFFFF' : (isDark ? '#F3F4F6' : '#334155'),
          fontFamily: fontFamily
        }
      ]}>
        {displayName}
      </Text>
      {selected && (
        <View style={styles.checkIcon}>
          <Feather name="check" size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  
  // User preferences state
  const [selectedFont, setSelectedFont] = useState('System');
  const [selectedBackgroundPalette, setSelectedBackgroundPalette] = useState('default');
  const [selectedAccentColor, setSelectedAccentColor] = useState('#10B981');
  const [autoSave, setAutoSave] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);

  // Font options
  const fontOptions = [
    { family: 'System', display: 'System Default' },
    { family: 'Georgia', display: 'Georgia' },
    { family: 'Times New Roman', display: 'Times' },
    { family: 'Arial', display: 'Arial' },
    { family: 'Helvetica', display: 'Helvetica' },
    { family: 'Courier New', display: 'Courier' },
  ];

  // Background palette options
  const backgroundPalettes = [
    { 
      id: 'default', 
      name: 'Silver Gray', 
      description: 'Clean and professional',
      primary: '#e6e9f0', 
      secondary: '#f3f4f8',
      icon: 'briefcase'
    },
    { 
      id: 'warm', 
      name: 'Warm Beige', 
      description: 'Comfortable and inviting',
      primary: '#f7f3f0', 
      secondary: '#faf8f5',
      icon: 'sun'
    },
    { 
      id: 'cool', 
      name: 'Cool Blue', 
      description: 'Calm and focused',
      primary: '#f0f4f7', 
      secondary: '#f5f8fa',
      icon: 'droplet'
    },
    { 
      id: 'minimal', 
      name: 'Pure White', 
      description: 'Minimal and clean',
      primary: '#ffffff', 
      secondary: '#f9f9f9',
      icon: 'minimize-2'
    },
    { 
      id: 'dark', 
      name: 'Charcoal', 
      description: 'Easy on the eyes',
      primary: '#2d2d2d', 
      secondary: '#3a3a3a',
      icon: 'moon'
    },
    { 
      id: 'nature', 
      name: 'Nature Green', 
      description: 'Fresh and organic',
      primary: '#f0f7f0', 
      secondary: '#f8fbf8',
      icon: 'leaf'
    },
  ];

  // Accent color options
  const accentColors = [
    { name: 'Emerald', color: '#10B981', description: 'Growth & Success' },
    { name: 'Blue', color: '#3B82F6', description: 'Trust & Stability' },
    { name: 'Purple', color: '#8B5CF6', description: 'Creative & Bold' },
    { name: 'Amber', color: '#F59E0B', description: 'Energy & Focus' },
    { name: 'Red', color: '#EF4444', description: 'Urgency & Action' },
    { name: 'Pink', color: '#EC4899', description: 'Friendly & Modern' },
    { name: 'Teal', color: '#14B8A6', description: 'Balance & Calm' },
    { name: 'Orange', color: '#F97316', description: 'Vibrant & Dynamic' },
  ];

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem('expoflamenco_font');
      const savedBackground = localStorage.getItem('expoflamenco_background');
      const savedAccent = localStorage.getItem('expoflamenco_accent');
      const savedAutoSave = localStorage.getItem('expoflamenco_autosave');

      if (savedFont) setSelectedFont(savedFont);
      if (savedBackground) setSelectedBackgroundPalette(savedBackground);
      if (savedAccent) setSelectedAccentColor(savedAccent);
      if (savedAutoSave) setAutoSave(savedAutoSave === 'true');
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = () => {
    try {
      localStorage.setItem('expoflamenco_font', selectedFont);
      localStorage.setItem('expoflamenco_background', selectedBackgroundPalette);
      localStorage.setItem('expoflamenco_accent', selectedAccentColor);
      localStorage.setItem('expoflamenco_autosave', autoSave.toString());
      
      // Set expiration (7 days from now)
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);
      localStorage.setItem('expoflamenco_preferences_expires', expiration.toISOString());
      
      Alert.alert(
        'Settings Saved',
        'Your preferences have been saved to your browser for 7 days.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Save Failed',
        'Could not save preferences to browser storage.',
        [{ text: 'OK' }]
      );
    }
  };

  // Auto-save when preferences change
  useEffect(() => {
    if (autoSave) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem('expoflamenco_font', selectedFont);
          localStorage.setItem('expoflamenco_background', selectedBackgroundPalette);
          localStorage.setItem('expoflamenco_accent', selectedAccentColor);
          localStorage.setItem('expoflamenco_autosave', autoSave.toString());
        } catch (error) {
          console.log('Auto-save failed:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedFont, selectedBackgroundPalette, selectedAccentColor, autoSave]);

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all your preferences to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setSelectedFont('System');
            setSelectedBackgroundPalette('default');
            setSelectedAccentColor('#10B981');
            setAutoSave(true);
            
            // Clear localStorage
            try {
              localStorage.removeItem('expoflamenco_font');
              localStorage.removeItem('expoflamenco_background');
              localStorage.removeItem('expoflamenco_accent');
              localStorage.removeItem('expoflamenco_autosave');
              localStorage.removeItem('expoflamenco_preferences_expires');
            } catch (error) {
              console.log('Error clearing preferences:', error);
            }
          }
        },
      ]
    );
  };

  const selectedPalette = backgroundPalettes.find(p => p.id === selectedBackgroundPalette) || backgroundPalettes[0];

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Feather name="settings" size={28} color={isDark ? '#FFFFFF' : '#111827'} />
            <Text style={[
              styles.headerTitle,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              {t('navigation.settings')}
            </Text>
          </View>
          <Text style={[
            styles.headerSubtitle,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]}>
            Customize your dashboard appearance and preferences
          </Text>
        </View>

        <View style={[styles.settingsContainer, isMobile && styles.mobileSettingsContainer]}>
          {/* Typography */}
          <View style={[styles.settingCard, styles.largeCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Typography</Text>
            <View style={styles.fontRow}>
              {fontOptions.map((font) => (
                <TouchableOpacity
                  key={font.family}
                  style={[
                    styles.fontButton,
                    { backgroundColor: selectedFont === font.family ? selectedAccentColor : (isDark ? '#374151' : '#F3F4F6') }
                  ]}
                  onPress={() => setSelectedFont(font.family)}
                >
                  <Text style={[
                    styles.fontText,
                    { 
                      color: selectedFont === font.family ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#111827'),
                      fontFamily: font.family 
                    }
                  ]}>
                    {font.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Colors */}
          <View style={[styles.settingCard, styles.mediumCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Accent Color</Text>
            <View style={styles.colorRow}>
              {accentColors.map((color) => (
                <TouchableOpacity
                  key={color.color}
                  style={[
                    styles.colorCircle,
                    { 
                      backgroundColor: color.color,
                      borderWidth: selectedAccentColor === color.color ? 3 : 0,
                      borderColor: '#FFFFFF'
                    }
                  ]}
                  onPress={() => setSelectedAccentColor(color.color)}
                />
              ))}
            </View>
          </View>

          {/* Background Themes */}
          <View style={[styles.settingCard, styles.mediumCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Background</Text>
            <View style={styles.themeRow}>
              {backgroundPalettes.slice(0, 3).map((palette) => (
                <TouchableOpacity
                  key={palette.id}
                  style={[
                    styles.themeButton,
                    { 
                      borderColor: selectedBackgroundPalette === palette.id ? selectedAccentColor : (isDark ? '#4B5563' : '#E5E7EB'),
                      borderWidth: 2
                    }
                  ]}
                  onPress={() => setSelectedBackgroundPalette(palette.id)}
                >
                  <View style={styles.themeDots}>
                    <View style={[styles.dot, { backgroundColor: palette.primary }]} />
                    <View style={[styles.dot, { backgroundColor: palette.secondary }]} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Settings Toggles */}
          <View style={[styles.settingCard, styles.largeCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Interface Settings</Text>
            <View style={styles.toggleGrid}>
              <View style={styles.toggleItem}>
                <Text style={[styles.toggleLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>Auto-Save</Text>
                <TouchableOpacity
                  style={[styles.toggle, { backgroundColor: autoSave ? selectedAccentColor : (isDark ? '#374151' : '#E5E7EB') }]}
                  onPress={() => setAutoSave(!autoSave)}
                >
                  <View style={[styles.toggleThumb, { transform: [{ translateX: autoSave ? 20 : 2 }] }]} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleItem}>
                <Text style={[styles.toggleLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>Animations</Text>
                <TouchableOpacity
                  style={[styles.toggle, { backgroundColor: animations ? selectedAccentColor : (isDark ? '#374151' : '#E5E7EB') }]}
                  onPress={() => setAnimations(!animations)}
                >
                  <View style={[styles.toggleThumb, { transform: [{ translateX: animations ? 20 : 2 }] }]} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleItem}>
                <Text style={[styles.toggleLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>Compact Mode</Text>
                <TouchableOpacity
                  style={[styles.toggle, { backgroundColor: compactMode ? selectedAccentColor : (isDark ? '#374151' : '#E5E7EB') }]}
                  onPress={() => setCompactMode(!compactMode)}
                >
                  <View style={[styles.toggleThumb, { transform: [{ translateX: compactMode ? 20 : 2 }] }]} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleItem}>
                <Text style={[styles.toggleLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>Show Tooltips</Text>
                <TouchableOpacity
                  style={[styles.toggle, { backgroundColor: showTooltips ? selectedAccentColor : (isDark ? '#374151' : '#E5E7EB') }]}
                  onPress={() => setShowTooltips(!showTooltips)}
                >
                  <View style={[styles.toggleThumb, { transform: [{ translateX: showTooltips ? 20 : 2 }] }]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={[styles.buttonRow, isMobile && styles.mobileButtonRow]}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: selectedAccentColor }]}
              onPress={savePreferences}
            >
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'transparent', borderColor: isDark ? '#374151' : '#E5E7EB', borderWidth: 2 }]}
              onPress={resetToDefaults}
            >
              <Text style={[styles.resetText, { color: isDark ? '#FFFFFF' : '#111827' }]}>Reset All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={[
            styles.footerText,
            { color: isDark ? '#6B7280' : '#9CA3AF' }
          ]}>
            Settings are saved locally in your browser
            {'\n'}and will expire automatically after 7 days
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
  largeCard: {
    minHeight: 120,
  },
  mediumCard: {
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  fontRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fontButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fontText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  toggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  toggleItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Mobile Styles
  mobileSettingsContainer: {
    paddingHorizontal: 16,
  },
  mobileButtonRow: {
    flexDirection: 'column',
    gap: 12,
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