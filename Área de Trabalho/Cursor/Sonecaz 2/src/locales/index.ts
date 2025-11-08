import { Language } from '@/types/i18n';
import { pt } from './pt';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';

// Importar todas as traduções
export type Translations = typeof pt;

// Mapear todas as traduções
// Nota: Para os idiomas que ainda não têm traduções completas (de, ru, ja, zh, hi),
// estamos usando inglês como fallback. Eles podem ser traduzidos posteriormente.
const translations: Record<Language, Translations> = {
  pt,
  en,
  es,
  fr,
  de: en, // Alemão - usar inglês temporariamente
  ru: en, // Russo - usar inglês temporariamente
  ja: en, // Japonês - usar inglês temporariamente
  zh: en, // Chinês - usar inglês temporariamente
  hi: en, // Hindi - usar inglês temporariamente
};

export default translations;

