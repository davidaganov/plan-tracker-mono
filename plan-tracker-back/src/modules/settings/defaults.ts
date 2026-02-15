import { CURRENCIES, SUPPORT_LOCALES, THEME } from "@plans-tracker/types"

export const DEFAULT_USER_SETTINGS = {
  themeMode: THEME.SYSTEM,
  primary: "#2ea6ff",
  locale: SUPPORT_LOCALES.EN,
  currency: CURRENCIES[0].code
} as const
