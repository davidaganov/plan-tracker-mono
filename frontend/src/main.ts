import WebApp from "@twa-dev/sdk"
import eruda from "eruda"
import { createApp } from "vue"
import { createPinia } from "pinia"
import { useSettingsStore } from "@/stores/settings"
import { useUserStore } from "@/stores/user"
import { useAppSettings } from "@/composables/useAppSettings"
import { getTelegramInitData } from "@/services/requests/telegram/telegram"
import { applyPrimary } from "@/bootstrap/appSettings"
import { setupI18n } from "@/setupI18n"
import router from "@/router"
import App from "@/App.vue"
import { THEME } from "@plans-tracker/types"
import "@/assets/styles/lib/tailwind.css"
import "@/assets/styles/main.css"

if (import.meta.env.DEV) {
  eruda.init()
}

async function bootstrap() {
  WebApp.ready()

  const telegramUser = WebApp.initDataUnsafe?.user
  const initData = getTelegramInitData()

  const pinia = createPinia()
  const userStore = useUserStore(pinia)
  const settingsStore = useSettingsStore(pinia)

  if (initData) {
    await userStore.fetchUser(initData)
  }

  await settingsStore.hydrate({
    telegramLanguageCode: telegramUser?.language_code,
    telegramColorScheme: WebApp.colorScheme
  })

  const colorScheme = WebApp.colorScheme as THEME
  const primary = settingsStore.primary
  applyPrimary(primary)

  const i18n = setupI18n(settingsStore.localeCode)
  useAppSettings({
    themeMode: () => settingsStore.themeMode,
    primary: () => settingsStore.primary,
    locale: () => settingsStore.localeCode,
    telegramColorScheme: () => colorScheme,
    i18n
  })

  const app = createApp(App)

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  app.mount("#app")
}

void bootstrap()
