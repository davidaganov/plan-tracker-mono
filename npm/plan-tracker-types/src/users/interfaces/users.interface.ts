import type { SettingsDto } from "@/settings/interfaces"

/**
 * DTO for a user.
 */
export interface UserDto {
  /** User ID */
  id: string
  /** Display name */
  displayName: string
  /** Telegram ID */
  telegramId?: string
  /** Email */
  email?: string
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
}

/**
 * DTO for an authenticated user.
 */
export interface AuthUserDto {
  /** User ID */
  id: string
  /** Telegram ID */
  telegramId: string
  /** First name */
  firstName: string | null
  /** Last name */
  lastName: string | null
  /** Username */
  username: string | null
  /** Language code */
  languageCode: string | null
  /** Photo URL */
  photoUrl: string | null
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
  /** Settings */
  settings: SettingsDto
}

/**
 * DTO for updating a user.
 */
export interface UpdateUserDto {
  /** Display name */
  displayName?: string
}

/**
 * DTO for linking a Telegram account.
 */
export interface LinkTelegramDto {
  /** Telegram ID */
  telegramId: string
  /** Init data */
  initData: string
}
