import { useState } from 'react';
import { translations } from '@/constants/translations';

type Language = 'en' | 'es' | 'fr';

interface TranslationSet {
  [key: string]: any;
}


const translationsEs: TranslationSet = {
  nav: {
    overview: 'Resumen',
    analytics: 'Analíticas', 
    users: 'Usuarios',
    subscriptions: 'Suscripciones',
    content: 'Contenido',
    settings: 'Configuración',
  },
  dashboard: {
    title: 'Resumen',
    subtitle: 'Información en tiempo real de MonsterInsights y FluentCRM',
  },
  export: 'Exportar',
  
};

const translationsFr: TranslationSet = {
  nav: {
    overview: 'Aperçu',
    analytics: 'Analytiques',
    users: 'Utilisateurs', 
    subscriptions: 'Abonnements',
    content: 'Contenu',
    settings: 'Paramètres',
  },
  dashboard: {
    title: 'Aperçu',
    subtitle: 'Informations en temps réel de MonsterInsights et FluentCRM',
  },
  export: 'Exporter',
  
};

const allTranslations = {
  en: translations,
  es: translationsEs,
  fr: translationsFr,
};

let currentLanguage: Language = 'en';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(currentLanguage);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = allTranslations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        
        let fallbackValue: any = allTranslations.en;
        for (const fallbackKey of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
            fallbackValue = fallbackValue[fallbackKey];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        return typeof fallbackValue === 'string' ? fallbackValue : key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const changeLanguage = (newLanguage: Language) => {
    currentLanguage = newLanguage;
    setLanguage(newLanguage);
  };

  const getAvailableLanguages = () => [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return { t, language, changeLanguage, getAvailableLanguages };
}
