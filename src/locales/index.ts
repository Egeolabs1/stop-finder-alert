import { Language } from '@/types/i18n';
import { pt } from './pt';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { ru } from './ru';
import { ja } from './ja';
import { zh } from './zh';
import { hi } from './hi';

// Importar todas as traduções
export type Translations = typeof pt;

// Mapear todas as traduções
const translations: Record<Language, Translations> = {
  pt,
  en,
  es,
  fr,
  de,
  ru,
  ja,
  zh,
  hi,
};

export default translations;
