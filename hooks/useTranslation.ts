import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, getTranslation, defaultLanguage, Language } from '@/constants/translations';

const LANGUAGE_STORAGE_KEY = '@app_language';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && ['en', 'es'].includes(savedLanguage)) {
        setLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string): string => {
    if (isLoading) return key; // Return key while loading
    return getTranslation(language, key);
  };

  const changeLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const getAvailableLanguages = () => [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  ];

  return {
    t,
    language,
    changeLanguage,
    getAvailableLanguages,
    isLoading
  };
}
