import { FastifyPluginAsync } from "fastify"
import { SettingsService } from "@/modules/settings/service"
import { getAuthUser } from "@/common/hooks"

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const settingsService = new SettingsService(fastify.prisma)

  fastify.get("/", async (req) => {
    const user = getAuthUser(req)

    const settings = await settingsService.getOrCreate(user.id)

    const data = await fastify.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        languageCode: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!data) throw fastify.httpErrors.notFound("User not found")

    return {
      ...data,
      settings
    }
  })
}

export default userRoutes
