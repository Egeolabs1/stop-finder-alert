import { useState, useEffect, useCallback } from 'react';
import { Language, SUPPORTED_LANGUAGES } from '@/types/i18n';
import translations from '@/locales';
import { pt } from '@/locales/pt';

const STORAGE_KEY = 'sonecaz_language';

// Detectar idioma do navegador
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pt';
  
  const browserLang = navigator.language || (navigator as any).userLanguage || 'pt';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Verificar se o idioma é suportado
  const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
  if (supportedCodes.includes(langCode as Language)) {
    return langCode as Language;
  }
  
  // Fallback para português
  return 'pt';
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
        return stored as Language;
      }
      return detectBrowserLanguage();
    } catch {
      return detectBrowserLanguage();
    }
  });

  // Salvar idioma no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }, [language]);

  // Função de tradução
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language]?.[key as keyof typeof pt] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (text, [paramKey, paramValue]) => 
          text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
        translation
      );
    }
    
    return translation;
  }, [language]);

  // Mudar idioma
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
  }, []);

  // Obter idioma atual
  const currentLanguage = useCallback(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  return {
    t,
    language,
    changeLanguage,
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};

