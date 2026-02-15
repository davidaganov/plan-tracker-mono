import { type MaybeRefOrGetter, toValue, watchEffect } from "vue"
import { applyLocale, applyPrimary, applyThemeMode } from "@/bootstrap/appSettings"
import { setI18nLanguage, setupI18n } from "@/setupI18n"
import { SUPPORT_LOCALES, THEME, type SettingsDto } from "@plans-tracker/types"

type BindUiParams = {
  themeMode: MaybeRefOrGetter<SettingsDto["themeMode"]>
  primary: MaybeRefOrGetter<string>
  locale: MaybeRefOrGetter<SUPPORT_LOCALES>
  telegramColorScheme?: MaybeRefOrGetter<THEME | undefined>
  i18n: ReturnType<typeof setupI18n>
}

export const useAppSettings = (params: BindUiParams) => {
  const stop = watchEffect(() => {
    const themeMode = toValue(params.themeMode)
    const primary = toValue(params.primary)
    const locale = toValue(params.locale)
    const telegramColorScheme = params.telegramColorScheme
      ? toValue(params.telegramColorScheme)
      : undefined

    const telegramTheme =
      telegramColorScheme === THEME.LIGHT
        ? THEME.LIGHT
        : telegramColorScheme === THEME.DARK
          ? THEME.DARK
          : undefined

    applyThemeMode(themeMode, telegramTheme)
    applyPrimary(primary)
    applyLocale(locale)
    setI18nLanguage(params.i18n, locale)
  })

  return { stop }
}
