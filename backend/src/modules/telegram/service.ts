import { Bot } from "grammy"

export class TelegramService {
  private readonly bot: Bot | null = null

  constructor() {
    const token = process.env.BOT_TOKEN
    if (token) {
      this.bot = new Bot(token)
    } else {
      console.warn("BOT_TOKEN is missing, TelegramService will be disabled")
    }
  }

  async sendMessage(telegramId: string, text: string) {
    if (!this.bot) {
      throw new Error("TelegramService is disabled (missing BOT_TOKEN)")
    }
    await this.bot.api.sendMessage(Number(telegramId), text)
  }
}
