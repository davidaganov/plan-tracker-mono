import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { useUserStore } from "@/stores/user"
import { ApiClient } from "@/services/client"
import { getTelegramInitData } from "@/services/requests/telegram/telegram"
import { getLocaleFromLanguageCode } from "@/setupI18n"
import {
  type SettingsDto,
  type UpdateSettingsDto,
  type CurrencyCode,
  SUPPORT_LOCALES,
  THEME
} from "@plans-tracker/types"

type TelegramColorScheme = "light" | "dark"

type SettingsBootstrapContext = {
  telegramLanguageCode?: string
  telegramColorScheme?: TelegramColorScheme
}

const DEFAULT_SETTINGS: Omit<SettingsDto, "userId" | "createdAt" | "updatedAt"> = {
  themeMode: THEME.SYSTEM,
  primary: "#2ea6ff",
  locale: SUPPORT_LOCALES.EN,
  currency: "RUB"
}

const diffSettings = (next: SettingsDto, prev: SettingsDto): UpdateSettingsDto => {
  const patch: UpdateSettingsDto = {}
  if (next.themeMode !== prev.themeMode) patch.themeMode = next.themeMode
  if (next.primary !== prev.primary) patch.primary = next.primary
  if (next.locale !== prev.locale) patch.locale = next.locale
  if (next.currency !== prev.currency) patch.currency = next.currency
  return patch
}

export const useSettingsStore = defineStore("settings", () => {
  const userStore = useUserStore()

  const hydrated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const server = ref<SettingsDto | null>(null)
  const draft = ref<SettingsDto | null>(null)
  const saving = ref(false)
  const saveTimer = ref<ReturnType<typeof setTimeout> | null>(null)

  const canSave = computed(() => Boolean(getTelegramInitData()))
  const primary = computed<string>(() => draft.value?.primary ?? DEFAULT_SETTINGS.primary)
  const currency = computed<CurrencyCode>(() => draft.value?.currency ?? DEFAULT_SETTINGS.currency)
  const localeCode = computed<SUPPORT_LOCALES>(() => draft.value?.locale ?? DEFAULT_SETTINGS.locale)
  const themeMode = computed(() => draft.value?.themeMode ?? DEFAULT_SETTINGS.themeMode)

  const primaryModel = computed({
    get: () => primary.value,
    set: (v) => setDraft({ primary: v })
  })

  const currencyModel = computed<CurrencyCode>({
    get: () => currency.value,
    set: (v) => setDraft({ currency: v })
  })

  const localeModel = computed({
    get: () => localeCode.value,
    set: (v) => setDraft({ locale: v })
  })

  const themeModeModel = computed({
    get: () => themeMode.value,
    set: (v) => setDraft({ themeMode: v })
  })

  const hydrate = async (ctx: SettingsBootstrapContext = {}) => {
    if (hydrated.value || isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const initData = getTelegramInitData()
      const user = userStore.user ?? (initData ? await userStore.fetchUser(initData) : null)
      const data = user?.settings ?? null

      const fallbackLocale = getLocaleFromLanguageCode(ctx.telegramLanguageCode)
      const locale = Object.values(SUPPORT_LOCALES).includes(data?.locale ?? fallbackLocale)
        ? (data?.locale ?? fallbackLocale)
        : SUPPORT_LOCALES.EN

      const now = new Date()
      const settings: SettingsDto = {
        userId: user?.id ?? "",
        themeMode: data?.themeMode ?? DEFAULT_SETTINGS.themeMode,
        primary: data?.primary ?? DEFAULT_SETTINGS.primary,
        locale,
        currency: data?.currency ?? DEFAULT_SETTINGS.currency,
        favoriteFamilyId: null,
        createdAt: data?.createdAt ?? now,
        updatedAt: data?.updatedAt ?? now
      }

      server.value = settings
      draft.value = { ...settings }
      hydrated.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load settings"
      const fallbackLocale = getLocaleFromLanguageCode(ctx.telegramLanguageCode)
      server.value = null
      draft.value = {
        userId: "",
        themeMode: DEFAULT_SETTINGS.themeMode,
        primary: DEFAULT_SETTINGS.primary,
        locale: fallbackLocale,
        currency: DEFAULT_SETTINGS.currency,
        favoriteFamilyId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      hydrated.value = true
    } finally {
      isLoading.value = false
    }
  }

  const flushSave = async () => {
    if (!server.value || !draft.value) return
    const patch = diffSettings(draft.value, server.value)
    if (Object.keys(patch).length === 0) return

    const initData = getTelegramInitData()
    if (!initData) {
      error.value = "Unable to save settings: missing Telegram initData"
      return
    }

    saving.value = true
    try {
      const next = await ApiClient.settings.updateSettings(patch, initData)

      userStore.updateUserSettingsLocal(next)
      server.value = next
      draft.value = { ...next }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to save settings"
    } finally {
      saving.value = false
    }
  }

  const scheduleSave = () => {
    if (!server.value || !draft.value) return
    const patch = diffSettings(draft.value, server.value)
    if (Object.keys(patch).length === 0) return

    if (saveTimer.value) clearTimeout(saveTimer.value)
    saveTimer.value = setTimeout(() => {
      void flushSave()
    }, 400)
  }

  const setDraft = (patch: UpdateSettingsDto) => {
    if (!draft.value) {
      draft.value = {
        userId: "",
        themeMode: DEFAULT_SETTINGS.themeMode,
        primary: DEFAULT_SETTINGS.primary,
        locale: DEFAULT_SETTINGS.locale,
        currency: DEFAULT_SETTINGS.currency,
        favoriteFamilyId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    draft.value = {
      ...draft.value,
      ...patch
    }
    scheduleSave()
  }

  return {
    hydrated,
    isLoading,
    error,
    saving,
    canSave,
    server,
    draft,
    themeMode,
    primary,
    currency,
    localeCode,
    themeModeModel,
    primaryModel,
    currencyModel,
    localeModel,
    hydrate,
    setDraft,
    flushSave
  }
})
