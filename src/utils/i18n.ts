/**
 * Utilitários para internacionalização e formatação por região
 */

import { Language } from '@/types/i18n';

// Configurações de região por idioma
export const LOCALE_CONFIG: Record<Language, { locale: string; dateLocale: string; numberLocale: string }> = {
  pt: { locale: 'pt-BR', dateLocale: 'pt-BR', numberLocale: 'pt-BR' },
  en: { locale: 'en-US', dateLocale: 'en-US', numberLocale: 'en-US' },
  es: { locale: 'es-ES', dateLocale: 'es-ES', numberLocale: 'es-ES' },
  fr: { locale: 'fr-FR', dateLocale: 'fr-FR', numberLocale: 'fr-FR' },
  de: { locale: 'de-DE', dateLocale: 'de-DE', numberLocale: 'de-DE' },
  ru: { locale: 'ru-RU', dateLocale: 'ru-RU', numberLocale: 'ru-RU' },
  ja: { locale: 'ja-JP', dateLocale: 'ja-JP', numberLocale: 'ja-JP' },
  zh: { locale: 'zh-CN', dateLocale: 'zh-CN', numberLocale: 'zh-CN' },
  hi: { locale: 'hi-IN', dateLocale: 'hi-IN', numberLocale: 'hi-IN' },
};

// Idiomas RTL (direita para esquerda)
export const RTL_LANGUAGES: Language[] = ['ar', 'he', 'fa', 'ur']; // Árabe, Hebraico, Farsi, Urdu
// Nota: Nenhum dos idiomas atuais é RTL, mas a estrutura está preparada

/**
 * Formatar número por região
 */
export const formatNumber = (value: number, language: Language, options?: Intl.NumberFormatOptions): string => {
  const config = LOCALE_CONFIG[language] || LOCALE_CONFIG.en;
  return new Intl.NumberFormat(config.numberLocale, options).format(value);
};

/**
 * Formatar moeda por região
 */
export const formatCurrency = (value: number, language: Language, currency: string = 'BRL'): string => {
  const config = LOCALE_CONFIG[language] || LOCALE_CONFIG.en;
  return new Intl.NumberFormat(config.numberLocale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Formatar data por região
 */
export const formatDate = (date: Date, language: Language, options?: Intl.DateTimeFormatOptions): string => {
  const config = LOCALE_CONFIG[language] || LOCALE_CONFIG.en;
  return new Intl.DateTimeFormat(config.dateLocale, options).format(date);
};

/**
 * Formatar data e hora por região
 */
export const formatDateTime = (date: Date, language: Language): string => {
  return formatDate(date, language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatar data relativa (ex: "há 2 horas")
 */
export const formatRelativeTime = (date: Date, language: Language): string => {
  const config = LOCALE_CONFIG[language] || LOCALE_CONFIG.en;
  const rtf = new Intl.RelativeTimeFormat(config.locale, { numeric: 'auto' });
  
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(diffInYears, 'year');
};

/**
 * Verificar se o idioma é RTL
 */
export const isRTL = (language: Language): boolean => {
  return RTL_LANGUAGES.includes(language);
};

/**
 * Obter direção do texto
 */
export const getTextDirection = (language: Language): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

/**
 * Formatar distância por região
 */
export const formatDistance = (meters: number, language: Language): string => {
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${formatNumber(km, language, { maximumFractionDigits: 1 })} km`;
  }
  return `${formatNumber(Math.round(meters), language)} m`;
};



