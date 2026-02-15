import { PrismaClient } from "@prisma/client"
import { ListsAccessService } from "@/modules/lists/services/lists-access.service"
import { ServiceError } from "@/common/errors"
import { normalizeKey } from "@/common/utils/normalize-key"
import { ACCESS_LEVEL, SORT_ORDER, LIST_TYPE } from "@plans-tracker/types"

/**
 * Service for applying templates to shopping lists.
 */
export class ShoppingListTemplateService {
  private readonly access: ListsAccessService

  constructor(private readonly prisma: PrismaClient) {
    this.access = new ListsAccessService(prisma)
  }

  /**
   * Applies templates to a shopping list.
   * Creates new items or increments quantity of existing ones.
   */
  async applyTemplates(
    userId: string,
    listId: string,
    templateIds: string[]
  ): Promise<{ ok: boolean; created: number; updated: number }> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    if (!templateIds || templateIds.length === 0) {
      throw ServiceError.badRequest("templateIds is required")
    }

    const list = await this.access.getListOrThrow(listId)
    if (list.type !== LIST_TYPE.SHOPPING) {
      throw ServiceError.badRequest("Templates can be applied only to shopping lists")
    }

    const incoming = await this.fetchTemplateItems(userId, templateIds)
    if (incoming.length === 0) {
      return { ok: true, created: 0, updated: 0 }
    }

    const existing = await this.fetchExistingItems(listId)
    const { byProductId, byNorm } = this.buildDeduplicationMaps(existing)

    return this.executeItemMerge(listId, incoming, byProductId, byNorm)
  }

  private async fetchTemplateItems(userId: string, templateIds: string[]) {
    const templates = await this.prisma.template.findMany({
      where: {
        id: { in: templateIds },
        OR: [
          { ownerId: userId },
          { shares: { some: { family: { members: { some: { userId } } } } } }
        ]
      },
      include: { items: { orderBy: { sortIndex: SORT_ORDER.ASC } } }
    })

    if (templates.length === 0) {
      throw ServiceError.badRequest("No templates found")
    }

    return templates.flatMap((t) => t.items)
  }

  private async fetchExistingItems(listId: string) {
    return this.prisma.shoppingListItem.findMany({
      where: { listId },
      select: { id: true, productId: true, normalizedKey: true }
    })
  }

  private buildDeduplicationMaps(
    existing: Array<{ id: string; productId: string | null; normalizedKey: string }>
  ) {
    const byProductId = new Map<string, string>()
    const byNorm = new Map<string, string>()

    for (const e of existing) {
      if (e.productId) byProductId.set(e.productId, e.id)
      byNorm.set(e.normalizedKey, e.id)
    }

    return { byProductId, byNorm }
  }

  private async executeItemMerge(
    listId: string,
    incoming: Array<{ title: string; productId: string | null }>,
    byProductId: Map<string, string>,
    byNorm: Map<string, string>
  ): Promise<{ ok: boolean; created: number; updated: number }> {
    let created = 0
    let updated = 0

    await this.prisma.$transaction(async (tx) => {
      const maxSort = await tx.shoppingListItem.aggregate({
        where: { listId, isChecked: false },
        _max: { sortIndex: true }
      })

      let nextSortIndex = (maxSort._max.sortIndex ?? 0) + 1

      for (const it of incoming) {
        const norm = normalizeKey(it.title)
        const targetId = it.productId ? byProductId.get(it.productId) : byNorm.get(norm)

        if (targetId) {
          await tx.shoppingListItem.update({
            where: { id: targetId },
            data: { quantity: { increment: 1 } }
          })
          updated++
        } else {
          const createdItem = await tx.shoppingListItem.create({
            data: {
              listId,
              title: it.title,
              normalizedKey: norm,
              quantity: 1,
              productId: it.productId,
              sortIndex: nextSortIndex
            },
            select: { id: true, productId: true, normalizedKey: true }
          })

          nextSortIndex++

          if (createdItem.productId) {
            byProductId.set(createdItem.productId, createdItem.id)
          }
          byNorm.set(createdItem.normalizedKey, createdItem.id)
          created++
        }
      }
    })

    return { ok: true, created, updated }
  }
}
