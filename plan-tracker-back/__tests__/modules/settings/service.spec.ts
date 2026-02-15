import { describe, it, expect, beforeEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import { PrismaClient } from "@prisma/client"
import { DEFAULT_USER_SETTINGS } from "@/modules/settings/defaults"
import { SettingsService } from "@/modules/settings/service"
import { CURRENCIES, THEME, type UpdateSettingsDto } from "@plans-tracker/types"

describe("SettingsService", () => {
  const prismaMock = mockDeep<PrismaClient>()
  let service: SettingsService

  beforeEach(() => {
    mockReset(prismaMock)
    service = new SettingsService(prismaMock)
  })

  describe("getOrCreate", () => {
    it("should return existing settings via upsert", async () => {
      const userId = "user-1"
      const mockSettings = {
        userId,
        ...DEFAULT_USER_SETTINGS,
        id: "settings-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        favoriteFamilyId: null
      }

      prismaMock.userSettings.upsert.mockResolvedValue(mockSettings)

      const result = await service.getOrCreate(userId)

      expect(prismaMock.userSettings.upsert).toHaveBeenCalledWith({
        where: { userId },
        create: expect.objectContaining({ userId }),
        update: {}
      })
      expect(result).toEqual(mockSettings)
    })
  })

  describe("update", () => {
    it("should update settings correctly", async () => {
      const userId = "user-1"
      const dto: UpdateSettingsDto = {
        themeMode: THEME.DARK,
        currency: CURRENCIES[0].code
      }

      const mockUpdated = {
        userId,
        ...DEFAULT_USER_SETTINGS,
        ...dto,
        id: "settings-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        favoriteFamilyId: null
      }

      prismaMock.userSettings.upsert.mockResolvedValue(mockUpdated)

      const result = await service.update(userId, dto)

      expect(prismaMock.userSettings.upsert).toHaveBeenCalledWith({
        where: { userId },
        create: expect.any(Object),
        update: {
          themeMode: THEME.DARK,
          primary: undefined,
          locale: undefined,
          currency: CURRENCIES[0].code
        }
      })
      expect(result).toEqual(mockUpdated)
    })

    it("should use defaults when creating via update with partial data", async () => {
      const userId = "new-user"
      const dto: UpdateSettingsDto = { themeMode: THEME.DARK } // missing currency, primary, etc.

      // Mock upsert implementation to verify strict arguments
      prismaMock.userSettings.upsert.mockImplementation((async (args: any) => {
        return args.create
      }) as any)

      await service.update(userId, dto)

      expect(prismaMock.userSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            themeMode: THEME.DARK,
            // Verify defaults used for missing fields
            currency: DEFAULT_USER_SETTINGS.currency,
            locale: DEFAULT_USER_SETTINGS.locale
          })
        })
      )
    })
  })
})
