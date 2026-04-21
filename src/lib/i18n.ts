import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { siteCopy as pl } from '../content/site-copy'
import { en } from '../content/en'

type Language = 'pl' | 'en'

/**
 * SOTA 2026 Language Detection
 * Prioritizes: Manual Choice (via persist) > Browser weighted preferences > Default (PL)
 */
const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pl'
  
  const userLangs = navigator.languages || [navigator.language]
  
  // SOTA 2026: Prioritize Polish for this specific brand if present in user preferences
  const hasPl = userLangs.some(l => l.split('-')[0].toLowerCase() === 'pl')
  if (hasPl) return 'pl'
  
  // Fallback to English if explicitly requested
  const hasEn = userLangs.some(l => l.split('-')[0].toLowerCase() === 'en')
  if (hasEn) return 'en'
  
  return 'pl'
}

interface I18nState {
  lang: Language
  setLang: (lang: Language) => void
}

/**
 * SOTA Zero-Overhead i18n with Persistence
 */
export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      lang: detectLanguage(),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'fest-language-pref',
    }
  )
)

// Selector for translations to avoid re-renders
export const useTranslation = () => {
  const lang = useI18n((state) => state.lang)
  const copy = lang === 'pl' ? pl : en
  return { ...copy, lang }
}
