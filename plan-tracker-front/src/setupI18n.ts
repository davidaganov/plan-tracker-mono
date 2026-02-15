import { createI18n } from "vue-i18n"
import { getAvailableLanguageCodes } from "@/config/languages"
import { slavicPluralizationRule } from "@/config/pluralization"
import { SUPPORT_LOCALES } from "@plans-tracker/types"

/**
 * Dynamically import all locale JSON files from the lang directory.
 * The keys will be the file paths, and the values will be the module exports.
 */
const messages = Object.fromEntries(
  Object.entries(import.meta.glob<{ default: any }>("@/lang/*.json", { eager: true })).map(
    ([path, module]) => {
      // Extract filename without extension (e.g., "en" from "/src/lang/en.json")
      const code = path.split("/").pop()?.replace(".json", "").toUpperCase()
      return [code, module.default]
    }
  )
)

/**
 * Determines the appropriate locale based on Telegram user language code
 * @param languageCode - Language code from Telegram user data
 * @returns Supported locale code
 */
export function getLocaleFromLanguageCode(languageCode?: string): SUPPORT_LOCALES {
  if (!languageCode) return SUPPORT_LOCALES.EN

  const locale = languageCode.toUpperCase()
  const supportedLocales = Object.values(SUPPORT_LOCALES) as string[]

  if (supportedLocales.includes(locale)) {
    return locale as SUPPORT_LOCALES
  }

  return SUPPORT_LOCALES.EN
}

export function setupI18n(locale: SUPPORT_LOCALES) {
  const i18n = createI18n({
    locale,
    legacy: false,
    messages,
    availableLocales: getAvailableLanguageCodes(),
    pluralRules: {
      [SUPPORT_LOCALES.RU]: slavicPluralizationRule
    }
  })
  setI18nLanguage(i18n, locale)
  return i18n
}

export function setI18nLanguage(i18n: ReturnType<typeof setupI18n>, locale: SUPPORT_LOCALES) {
  if (!getAvailableLanguageCodes().includes(locale)) {
    console.warn(`Locale "${locale}" is not supported. Falling back to "en".`)
    locale = SUPPORT_LOCALES.EN
  }

  i18n.global.locale.value = locale
}
