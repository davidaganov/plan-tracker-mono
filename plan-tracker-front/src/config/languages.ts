import { LANGUAGES, SUPPORT_LOCALES, type LanguageConfig } from "@plans-tracker/types"

/**
 * Get language configuration by code
 */
export function getLanguageByCode(code: SUPPORT_LOCALES): LanguageConfig | undefined {
  return LANGUAGES.find((lang) => lang.code === code)
}

/**
 * Get all available language codes
 */
export function getAvailableLanguageCodes(): SUPPORT_LOCALES[] {
  return LANGUAGES.map((lang) => lang.code)
}
