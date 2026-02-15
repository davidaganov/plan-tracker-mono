import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"
import { verifyTelegramInitData } from "@/common/utils/telegram"

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string
      telegramId: string
    }
  }

  interface FastifyContextConfig {
    public?: boolean
  }
}

const DEFAULT_INIT_DATA_MAX_AGE_SECONDS = 60 * 60 // 1 hour

const authPlugin: FastifyPluginAsync = fp(
  async (server, _options) => {
    server.decorateRequest("user", undefined)

    server.addHook("onRequest", async (req: FastifyRequest, _reply: FastifyReply) => {
      const routeConfig = req.routeOptions.config
      if (routeConfig?.public) {
        return
      }

      if (req.url.startsWith("/api/docs")) {
        return
      }

      const initDataRaw =
        (req.headers["x-telegram-init-data"] as string) ||
        (req.headers["tg-init-data"] as string) ||
        ""

      if (!initDataRaw) {
        throw server.httpErrors.unauthorized("Missing initData header")
      }

      const botToken = process.env.BOT_TOKEN
      if (!botToken) {
        throw server.httpErrors.internalServerError("Server misconfigured: BOT_TOKEN is missing")
      }

      let initDataDecoded = initDataRaw
      try {
        initDataDecoded = decodeURIComponent(initDataRaw)
      } catch {
        initDataDecoded = initDataRaw
      }

      let data
      try {
        data = verifyTelegramInitData(initDataDecoded, botToken)
      } catch (e) {
        throw server.httpErrors.unauthorized(e instanceof Error ? e.message : "Invalid initData")
      }

      const tgUser = data.user
      if (!tgUser?.id) {
        throw server.httpErrors.unauthorized("initData missing user")
      }

      if (!data.auth_date) {
        throw server.httpErrors.unauthorized("initData missing auth_date")
      }

      const maxAgeSeconds = Number(
        process.env.TG_INIT_DATA_MAX_AGE_SECONDS ?? DEFAULT_INIT_DATA_MAX_AGE_SECONDS
      )

      const nowSeconds = Math.floor(Date.now() / 1000)
      if (nowSeconds - data.auth_date > maxAgeSeconds) {
        throw server.httpErrors.unauthorized("initData expired")
      }

      const telegramId = String(tgUser.id)

      const user = await server.prisma.user.upsert({
        where: { telegramId },
        create: {
          telegramId,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          languageCode: tgUser.language_code,
          photoUrl: tgUser.photo_url
        },
        update: {
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          languageCode: tgUser.language_code,
          photoUrl: tgUser.photo_url
        },
        select: { id: true, telegramId: true }
      })

      req.user = user
    })
  },
  {
    name: "auth",
    dependencies: ["prisma", "sensible"]
  }
)

export default authPlugin
