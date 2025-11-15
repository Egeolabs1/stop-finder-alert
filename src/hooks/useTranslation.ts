import { useState, useEffect, useCallback } from 'react';
import { Language, SUPPORTED_LANGUAGES } from '@/types/i18n';
import translations, { Translations } from '@/locales';
import { getTextDirection, isRTL } from '@/utils/i18n';

const LOCAL_STORAGE_LANG_KEY = 'sonecaz_language';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    // Tenta carregar do localStorage
    try {
      const storedLang = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
      if (storedLang && translations[storedLang as Language]) {
        return storedLang as Language;
      }
    } catch (error) {
      console.error('Error loading language from localStorage:', error);
    }
    
    // Detecta o idioma do navegador
    const browserLang = navigator.language.split('-')[0] as Language;
    if (translations[browserLang]) {
      return browserLang;
    }
    
    // Fallback para português
    return 'pt';
  });

  const [currentTranslations, setCurrentTranslations] = useState<Translations>(translations[language]);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(getTextDirection(language));

  useEffect(() => {
    setCurrentTranslations(translations[language]);
    const newDirection = getTextDirection(language);
    setDirection(newDirection);
    
    // Aplicar direção ao documento
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newDirection;
      document.documentElement.lang = language;
    }
    
    try {
      localStorage.setItem(LOCAL_STORAGE_LANG_KEY, language);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  }, [language]);

  const changeLanguage = useCallback((newLang: Language) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    } else {
      console.warn(`Language ${newLang} not supported, falling back to English.`);
      setLanguage('en');
    }
  }, []);

  // Função para traduzir com interpolação básica
  const translate = useCallback((key: string, params?: Record<string, string | number>): string => {
    // Acessa a tradução usando a chave como string
    let text = (currentTranslations as Record<string, string>)[key] || 
               (translations.en as Record<string, string>)[key] || 
               key;
    
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      }
    }
    return text;
  }, [currentTranslations]);

  return { 
    t: translate, 
    language, 
    changeLanguage,
    direction,
    isRTL: isRTL(language),
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};
