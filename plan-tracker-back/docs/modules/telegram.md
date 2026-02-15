# Telegram module

- **Source**:
  - Bot runtime: `src/modules/telegram/bot.ts`
  - Service: `src/modules/telegram/service.ts`
  - Plugin: `src/plugins/telegram-bot.ts`

## Purpose

Provide Telegram-specific integrations:

- verifying WebApp init data (auth)
- running a Telegram bot (Grammy)
- generating or sending messages (depending on current feature state)

## Notes

- WebApp init data verification is implemented in `src/common/utils/telegram.ts` and used by `src/plugins/auth.ts`.
- Bot configuration is driven by environment variables (see `docs/agent-reference.md`).
