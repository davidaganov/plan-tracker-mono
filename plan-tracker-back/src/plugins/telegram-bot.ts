import { FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"
import { createTelegramBot } from "@/modules/telegram/bot"

const telegramBotPlugin: FastifyPluginAsync = async (fastify) => {
  if (!process.env.BOT_TOKEN) {
    fastify.log.warn("BOT_TOKEN not provided, skipping Telegram Bot startup")
    return
  }

  const bot = createTelegramBot()

  // Central error handler
  bot.catch((err) => {
    fastify.log.error(err, "[telegram] bot error")
  })

  // Start bot on ready (non-blocking)
  fastify.addHook("onReady", async () => {
    // Run in background, do NOT await, otherwise server won't start
    bot
      .start({
        onStart: (info) => {
          fastify.log.info(`[telegram] bot started as @${info.username}`)
        }
      })
      .catch((e) => {
        fastify.log.error(e, "Failed to start telegram bot")
      })
  })

  // Stop bot on close
  fastify.addHook("onClose", async () => {
    fastify.log.info("[telegram] stopping bot...")
    await bot.stop()
  })
}

export default fp(telegramBotPlugin, {
  name: "telegram-bot"
})
