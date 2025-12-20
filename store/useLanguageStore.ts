import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { locales, type Locale, type Translation } from '@/locales';

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translation;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      locale: 'ko',
      t: locales.ko,
      setLocale: (locale: Locale) => {
        set({ locale, t: locales[locale] });
      },
    }),
    {
      name: 'pixelket-language',
    }
  )
);
