import { THEME } from "@/settings/enums"
import { SUPPORT_LOCALES } from "@/config/enums"
import { CurrencyCode } from "@/config/const"

/**
 * DTO for settings.
 */
export interface SettingsDto {
  /** User ID */
  userId: string
  /** Theme mode */
  themeMode: THEME
  /** Primary color */
  primary: string
  /** Locale */
  locale: SUPPORT_LOCALES
  /** Currency */
  currency: CurrencyCode
  /** Favorite family ID */
  favoriteFamilyId?: string | null
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
}

/**
 * DTO for updating settings.
 */
export interface UpdateSettingsDto {
  /** Theme mode */
  themeMode?: THEME
  /** Primary color */
  primary?: string
  /** Locale */
  locale?: SUPPORT_LOCALES
  /** Currency */
  currency?: CurrencyCode
  /** Favorite family ID */
  favoriteFamilyId?: string | null
}
