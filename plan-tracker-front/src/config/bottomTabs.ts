export const BOTTOM_TAB_ICONS = {
  products: "products",
  tasks: "tasks",
  family: "family",
  settings: "settings"
} as const

export type BottomTabIcon = keyof typeof BOTTOM_TAB_ICONS

export const BOTTOM_TAB_LABEL_KEYS = {
  products: "nav.products",
  tasks: "nav.tasks",
  family: "nav.family",
  settings: "nav.settings"
} as const

export const BOTTOM_TABS: { to: string; icon: BottomTabIcon }[] = [
  { to: "/products", icon: "products" },
  { to: "/tasks", icon: "tasks" },
  { to: "/family", icon: "family" },
  { to: "/settings", icon: "settings" }
] as const
