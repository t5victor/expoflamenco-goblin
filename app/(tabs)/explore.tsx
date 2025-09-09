import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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

        {/* Font Selection */}
        <SettingsSection title="Typography">
          <View style={styles.fontContainer}>
            {fontOptions.map((font) => (
              <TouchableOpacity
                key={font.family}
                style={[
                  styles.fontCard,
                  {
                    backgroundColor: selectedFont === font.family 
                      ? selectedAccentColor 
                      : (isDark ? '#1F2937' : '#FFFFFF'),
                    borderColor: selectedFont === font.family 
                      ? selectedAccentColor 
                      : (isDark ? '#374151' : '#E5E7EB'),
                  }
                ]}
                onPress={() => setSelectedFont(font.family)}
              >
                <Text style={[
                  styles.fontText,
                  { 
                    color: selectedFont === font.family 
                      ? '#FFFFFF' 
                      : (isDark ? '#FFFFFF' : '#111827'),
                    fontFamily: font.family
                  }
                ]}>
                  {font.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        {/* Accent Colors */}
        <SettingsSection title="Accent Colors">
          <View style={styles.colorContainer}>
            {accentColors.map((colorItem) => (
              <TouchableOpacity
                key={colorItem.color}
                style={[
                  styles.colorCard,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: selectedAccentColor === colorItem.color 
                      ? colorItem.color 
                      : (isDark ? '#374151' : '#E5E7EB'),
                    borderWidth: selectedAccentColor === colorItem.color ? 3 : 1,
                  }
                ]}
                onPress={() => setSelectedAccentColor(colorItem.color)}
              >
                <View style={[
                  styles.colorSwatch,
                  { backgroundColor: colorItem.color }
                ]}>
                  {selectedAccentColor === colorItem.color && (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[
                  styles.colorName,
                  { 
                    color: selectedAccentColor === colorItem.color 
                      ? colorItem.color 
                      : (isDark ? '#FFFFFF' : '#111827')
                  }
                ]}>
                  {colorItem.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        {/* Background Themes */}
        <SettingsSection title="Background Themes">
          <View style={styles.themeContainer}>
            {backgroundPalettes.map((palette) => (
              <TouchableOpacity
                key={palette.id}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: selectedBackgroundPalette === palette.id 
                      ? selectedAccentColor 
                      : (isDark ? '#374151' : '#E5E7EB'),
                    borderWidth: selectedBackgroundPalette === palette.id ? 3 : 1,
                  }
                ]}
                onPress={() => setSelectedBackgroundPalette(palette.id)}
              >
                <View style={styles.themePreview}>
                  <View style={[
                    styles.themeBlock,
                    { backgroundColor: palette.primary }
                  ]} />
                  <View style={[
                    styles.themeBlock,
                    { backgroundColor: palette.secondary }
                  ]} />
                </View>
                <Text style={[
                  styles.themeName,
                  { 
                    color: selectedBackgroundPalette === palette.id 
                      ? selectedAccentColor 
                      : (isDark ? '#FFFFFF' : '#111827')
                  }
                ]}>
                  {palette.name}
                </Text>
                {selectedBackgroundPalette === palette.id && (
                  <View style={[styles.selectedBadge, { backgroundColor: selectedAccentColor }]}>
                    <Feather name="check" size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        {/* Settings */}
        <View style={styles.settingsRow}>
          <View style={[
            styles.settingsCard,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
          ]}>
            <Text style={[
              styles.settingsTitle,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              Auto-Save
            </Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: autoSave ? selectedAccentColor : (isDark ? '#374151' : '#E5E7EB') }
              ]}
              onPress={() => setAutoSave(!autoSave)}
            >
              <View style={[
                styles.toggleThumb,
                { transform: [{ translateX: autoSave ? 24 : 2 }] }
              ]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.settingsCard,
              { backgroundColor: selectedAccentColor }
            ]}
            onPress={savePreferences}
          >
            <Feather name="save" size={20} color="#FFFFFF" />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.settingsCard,
              { 
                backgroundColor: 'transparent',
                borderColor: isDark ? '#374151' : '#E5E7EB',
                borderWidth: 2
              }
            ]}
            onPress={resetToDefaults}
          >
            <Feather name="refresh-cw" size={20} color={isDark ? '#FFFFFF' : '#111827'} />
            <Text style={[
              styles.resetText,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              Reset
            </Text>
          </TouchableOpacity>
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDivider: {
    height: 2,
    width: 40,
    borderRadius: 1,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  // Font Cards
  fontContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fontCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    width: (width - 72) / 3,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fontText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Color Cards
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCard: {
    padding: 16,
    borderRadius: 12,
    width: (width - 84) / 4,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Theme Cards
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    padding: 16,
    borderRadius: 12,
    width: (width - 72) / 2.5,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  themePreview: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  themeBlock: {
    width: 30,
    height: 20,
    borderRadius: 4,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Settings Row
  settingsRow: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  settingsCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
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