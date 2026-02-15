import { PrismaClient } from "@prisma/client"
import { DEFAULT_USER_SETTINGS } from "@/modules/settings/defaults"
import type { UpdateSettingsDto } from "@plans-tracker/types"

export class SettingsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retrieves existing settings for a user or creates default ones.
   * Uses upsert to prevent race conditions during concurrent requests.
   */
  async getOrCreate(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...DEFAULT_USER_SETTINGS
      },
      update: {}
    })
  }

  /**
   * Updates user settings.
   * Merges provided values with defaults if creating for the first time.
   */
  async update(userId: string, dto: UpdateSettingsDto) {
    const { themeMode, primary, locale, currency } = dto

    return this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        themeMode: themeMode ?? DEFAULT_USER_SETTINGS.themeMode,
        primary: primary ?? DEFAULT_USER_SETTINGS.primary,
        locale: locale ?? DEFAULT_USER_SETTINGS.locale,
        currency: currency ?? DEFAULT_USER_SETTINGS.currency
      },
      update: {
        themeMode,
        primary,
        locale,
        currency
      }
    })
  }
}
