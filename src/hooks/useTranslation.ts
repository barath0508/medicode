import { translations, Translation } from '../utils/translations';

export default function useTranslation(lang: string = 'en'): Translation {
  return translations[lang] || translations.en;
}
