import { SUPPORT_LOCALES } from "@/config/enums"

/**
 * Interface for language configuration.
 */
export interface LanguageConfig {
  /** Language code */
  code: SUPPORT_LOCALES
  /** Title key for the language */
  titleKey: string
}

/**
 * List of supported languages.
 */
export const LANGUAGES: LanguageConfig[] = [
  {
    code: SUPPORT_LOCALES.EN,
    titleKey: "English"
  },
  {
    code: SUPPORT_LOCALES.RU,
    titleKey: "Russian"
  },
  {
    code: SUPPORT_LOCALES.UK,
    titleKey: "Ukrainian"
  }
]
