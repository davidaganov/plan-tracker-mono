import { getOnColor } from "@/utils/color"
import { SUPPORT_LOCALES, THEME } from "@plans-tracker/types"

export const resolveTheme = (mode: THEME, telegramColorScheme?: THEME): THEME => {
  if (mode === THEME.LIGHT || mode === THEME.DARK) return mode
  return telegramColorScheme === THEME.LIGHT ? THEME.LIGHT : THEME.DARK
}

export const applyTheme = (theme: THEME) => {
  document?.querySelector("html")?.setAttribute("data-theme", theme)
}

export const applyThemeMode = (mode: THEME, telegramColorScheme?: THEME): THEME => {
  const resolved = resolveTheme(mode, telegramColorScheme)
  applyTheme(resolved)
  return resolved
}

export const applyPrimary = (primary: string): string => {
  const onPrimary = getOnColor(primary)
  document?.documentElement?.style.setProperty("--app-primary", primary)
  document?.documentElement?.style.setProperty("--app-primary-foreground", onPrimary)
  return onPrimary
}

export const applyLocale = (locale: SUPPORT_LOCALES) => {
  document?.querySelector("html")?.setAttribute("lang", locale.toLowerCase())
}
