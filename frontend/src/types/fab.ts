import type { Component } from "vue"

export interface FabAction {
  key: string
  icon: Component
  label?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null
  disabled?: boolean
  onClick?: () => void
  className?: string
}
