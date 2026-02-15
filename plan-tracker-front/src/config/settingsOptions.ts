import type { Component } from "vue"
import { Sun, Moon, SunMoon } from "lucide-vue-next"
import { THEME } from "@plans-tracker/types"

export interface ThemeItem {
  value: THEME
  icon: Component
  titleKey: string
}

export const SETTINGS_THEME_ITEMS: ThemeItem[] = [
  { value: THEME.SYSTEM, icon: SunMoon, titleKey: "pages.settings.themeAuto" },
  { value: THEME.LIGHT, icon: Sun, titleKey: "pages.settings.themeLight" },
  { value: THEME.DARK, icon: Moon, titleKey: "pages.settings.themeDark" }
]

export const SETTINGS_ACCENT_PRESETS = [
  { value: "#2ea6ff", titleKey: "pages.settings.accentBlue" },
  { value: "#8e74c4", titleKey: "pages.settings.accentViolet" },
  { value: "#06b6d4", titleKey: "pages.settings.accentCyan" },
  { value: "#22c55e", titleKey: "pages.settings.accentGreen" },
  { value: "#84cc16", titleKey: "pages.settings.accentLime" },
  { value: "#fbbf24", titleKey: "pages.settings.accentYellow" },
  { value: "#fb8c00", titleKey: "pages.settings.accentOrange" },
  { value: "#ef4444", titleKey: "pages.settings.accentRed" },
  { value: "#ec4899", titleKey: "pages.settings.accentPink" }
] as const
