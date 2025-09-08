import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';

export const LanguageDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const { language, changeLanguage, getAvailableLanguages } = useTranslation();
  const isDark = colorScheme === 'dark';
  
  const languages = getAvailableLanguages();
  const currentLang = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: 'en' | 'es' | 'fr') => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.trigger,
          { 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderColor: isDark ? '#374151' : '#D1D5DB'
          }
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.flag}>{currentLang?.flag}</Text>
        <Text style={[
          styles.languageCode,
          { color: isDark ? '#FFFFFF' : '#374151' }
        ]}>
          {currentLang?.code.toUpperCase()}
        </Text>
        <Feather 
          name="chevron-down" 
          size={14} 
          color={isDark ? '#9CA3AF' : '#6B7280'} 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[
            styles.dropdown,
            { 
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? '#374151' : '#E5E7EB'
            }
          ]}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.option,
                  language === lang.code && styles.selectedOption,
                  language === lang.code && { 
                    backgroundColor: isDark ? '#374151' : '#F3F4F6' 
                  }
                ]}
                onPress={() => handleLanguageChange(lang.code as 'en' | 'es' | 'fr')}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  {lang.name}
                </Text>
                <Text style={[
                  styles.languageCodeSmall,
                  { color: isDark ? '#9CA3AF' : '#6B7280' }
                ]}>
                  {lang.code.toUpperCase()}
                </Text>
                {language === lang.code && (
                  <Feather 
                    name="check" 
                    size={16} 
                    color={isDark ? '#10B981' : '#059669'} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
    minWidth: 80,
    height: 32,
  },
  flag: {
    fontSize: 16,
  },
  languageCode: {
    fontSize: 13,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    minWidth: 160,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  selectedOption: {
    backgroundColor: '#F3F4F6',
  },
  languageName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  languageCodeSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
});
