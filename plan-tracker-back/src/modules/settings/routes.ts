import { FastifyPluginAsync } from "fastify"
import { SettingsService } from "@/modules/settings/service"
import { getAuthUser } from "@/common/hooks"
import { CurrencyCode, SUPPORT_LOCALES, THEME } from "@plans-tracker/types"

const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  const settingsService = new SettingsService(fastify.prisma)

  fastify.get("/", async (req) => {
    const user = getAuthUser(req)
    return settingsService.getOrCreate(user.id)
  })

  fastify.patch<{
    Body: {
      themeMode?: THEME
      primary?: string
      locale?: SUPPORT_LOCALES
      currency?: CurrencyCode
    }
  }>("/", async (req) => {
    const user = getAuthUser(req)
    return settingsService.update(user.id, req.body)
  })
}

export default settingsRoutes
