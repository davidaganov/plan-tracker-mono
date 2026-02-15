import { PrismaClient } from "@prisma/client"
import { ListsAccessService } from "@/modules/lists/services/lists-access.service"
import { TelegramService } from "@/modules/telegram/service"
import { ServiceError } from "@/common/errors"
import { ACCESS_LEVEL, LIST_TYPE, PRICE_TYPE, SendListDto, SORT_ORDER } from "@plans-tracker/types"

interface ShoppingItemWithPrice {
  priceType: string
  priceCurrency: string | null
  priceMin: number | null
  priceMax: number | null
  quantity: number
}

/**
 * Service for sending lists via Telegram.
 */
export class SendListService {
  private readonly access: ListsAccessService
  private readonly telegram: TelegramService

  constructor(private readonly prisma: PrismaClient) {
    this.access = new ListsAccessService(prisma)
    this.telegram = new TelegramService()
  }

  /**
   * Formats price totals for shopping items.
   */
  private formatShoppingTotals(items: ShoppingItemWithPrice[]): string {
    type Acc = { min: number; maxKnown: boolean; max: number }
    const byCurrency = new Map<string, Acc>()

    for (const it of items) {
      if (!it.priceCurrency || it.priceType === PRICE_TYPE.NONE) continue

      const currency = it.priceCurrency
      const current = byCurrency.get(currency) ?? { min: 0, maxKnown: true, max: 0 }

      const q = it.quantity ?? 1
      const min = (it.priceMin ?? 0) * q
      current.min += min

      if (it.priceType === PRICE_TYPE.RANGE) {
        if (it.priceMax == null) {
          current.maxKnown = false
        } else {
          current.max += it.priceMax * q
        }
      } else if (it.priceType === PRICE_TYPE.EXACT) {
        current.max += (it.priceMin ?? 0) * q
      }

      byCurrency.set(currency, current)
    }

    const parts: string[] = []
    for (const [currency, acc] of byCurrency.entries()) {
      if (acc.maxKnown && acc.max !== acc.min) {
        parts.push(`${acc.min}-${acc.max} ${currency}`)
      } else {
        parts.push(`${acc.min} ${currency}`)
      }
    }

    return parts.join(" / ")
  }

  /**
   * Sends a list to family members via Telegram.
   */
  async sendList(
    userId: string,
    listId: string,
    dto: SendListDto
  ): Promise<{ ok: boolean; sent: number }> {
    const list = await this.access.assertAccess(userId, listId, ACCESS_LEVEL.READ)

    // Verify list is shared to the family
    const share = list.familyShares.find((s) => s.familyId === dto.familyId)
    if (!share) {
      throw ServiceError.forbidden("List is not shared to this family")
    }

    // Verify sender is a family member
    const meInFamily = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId: dto.familyId, userId } }
    })
    if (!meInFamily) {
      throw ServiceError.forbidden("Not a family member")
    }

    // Determine recipients
    let recipientUserIds: string[] = []
    if (dto.allExceptMe) {
      if (dto.recipientUserIds && dto.recipientUserIds.length > 0) {
        throw ServiceError.badRequest("recipientUserIds must be omitted when allExceptMe=true")
      }

      const members = await this.prisma.familyMember.findMany({
        where: { familyId: dto.familyId, userId: { not: userId } },
        select: { userId: true }
      })
      recipientUserIds = members.map((m) => m.userId)
    } else {
      recipientUserIds = dto.recipientUserIds ?? []
    }

    // Deduplicate and exclude sender
    recipientUserIds = Array.from(new Set(recipientUserIds)).filter((id) => id !== userId)

    if (recipientUserIds.length === 0) {
      throw ServiceError.badRequest("No recipients")
    }

    // Verify all recipients are family members
    const allowedRecipients = await this.prisma.familyMember.findMany({
      where: { familyId: dto.familyId, userId: { in: recipientUserIds } },
      select: { userId: true }
    })

    if (allowedRecipients.length !== recipientUserIds.length) {
      throw ServiceError.badRequest("Some recipients are not family members")
    }

    // Get telegram IDs
    const users = await this.prisma.user.findMany({
      where: { id: { in: recipientUserIds } },
      select: { id: true, telegramId: true }
    })

    if (users.length !== recipientUserIds.length) {
      throw ServiceError.badRequest("Some recipients do not exist")
    }

    const telegramIds = Array.from(new Set(users.map((u) => u.telegramId).filter(Boolean)))
    if (telegramIds.length === 0) {
      throw ServiceError.badRequest("Recipients have no telegramId")
    }

    // Build message
    let text = `📝 ${list.name}\n`

    if (list.type === LIST_TYPE.SHOPPING) {
      const items = await this.prisma.shoppingListItem.findMany({
        where: { listId },
        include: { locations: { include: { location: true } } },
        orderBy: [
          { isChecked: SORT_ORDER.ASC },
          { sortIndex: SORT_ORDER.ASC },
          { createdAt: SORT_ORDER.ASC }
        ]
      })

      for (const it of items) {
        const mark = it.isChecked ? "[x]" : "[ ]"
        const qty = it.quantity ?? 1
        text += `${mark} ${it.title}${qty !== 1 ? ` x${qty}` : ""}\n`
      }

      // Collect locations
      const locations = new Set<string>()
      for (const it of items) {
        for (const l of it.locations) {
          if (l.location?.title) locations.add(l.location.title)
        }
      }

      const totals = this.formatShoppingTotals(items)
      if (locations.size > 0) text += `\nLocations: ${Array.from(locations).join(", ")}`
      if (totals) text += `\nTotal: ${totals}`
    } else {
      const items = await this.prisma.taskListItem.findMany({
        where: { listId },
        orderBy: [
          { isChecked: SORT_ORDER.ASC },
          { sortIndex: SORT_ORDER.ASC },
          { createdAt: SORT_ORDER.ASC }
        ]
      })

      let totalMinutes = 0
      for (const it of items) {
        const mark = it.isChecked ? "[x]" : "[ ]"
        text += `${mark} ${it.title}\n`
        if (it.durationMinutes) totalMinutes += it.durationMinutes
      }

      if (totalMinutes > 0) {
        const h = Math.floor(totalMinutes / 60)
        const m = totalMinutes % 60
        text += `\nTotal duration: ${h}:${String(m).padStart(2, "0")}`
      }
    }

    // Send messages
    await Promise.all(telegramIds.map((tg) => this.telegram.sendMessage(tg, text)))

    return { ok: true, sent: telegramIds.length }
  }
}
