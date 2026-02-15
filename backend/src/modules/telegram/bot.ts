import { Bot, InlineKeyboard } from "grammy"

type TelegramBotConfig = {
  token: string
  webAppUrl: string
}

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env: ${key}`)
  return value
}

export const createTelegramBot = (config?: Partial<TelegramBotConfig>): Bot => {
  const token = config?.token ?? getRequiredEnv("BOT_TOKEN")
  const webAppUrl = config?.webAppUrl ?? getRequiredEnv("BOT_WEBAPP_URL")

  const bot = new Bot(token)

  bot.command("start", async (ctx) => {
    const keyboard = new InlineKeyboard().webApp("Open app", webAppUrl)
    await ctx.reply("Open the mini app:", { reply_markup: keyboard })
  })

  bot.on("message", async (ctx) => {
    await ctx.reply("Use /start to open the mini app")
  })

  return bot
}
