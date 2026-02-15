import { PrismaClient } from "@prisma/client"
import { ListsAccessService } from "@/modules/lists/services/lists-access.service"
import { ServiceError } from "@/common/errors"
import { isRepeatExpired } from "@/common/utils/dates"
import {
  type BaseItemDto,
  type BaseItemModel,
  ACCESS_LEVEL,
  SORT_ORDER
} from "@plans-tracker/types"

/**
 * Abstract base class for list item services.
 * Consolidates common logic for ShoppingItemsService and TaskItemsService.
 */
export abstract class BaseItemsService<TItem extends BaseItemModel, TDto extends BaseItemDto> {
  protected readonly access: ListsAccessService

  private hasRepeatEveryDays(item: TItem): item is TItem & { repeatEveryDays: number | null } {
    return "repeatEveryDays" in item
  }

  constructor(protected readonly prisma: PrismaClient) {
    this.access = new ListsAccessService(prisma)
  }

  /**
   * Abstract methods to be implemented by subclasses.
   */
  protected abstract findMany(args: {
    where: { listId: string }
    orderBy: Array<Record<string, string>>
  }): Promise<TItem[]>

  protected abstract updateMany(args: {
    where: { id: { in: string[] } }
    data: { isChecked: boolean; checkedAt: null }
  }): Promise<{ count: number }>

  protected abstract findUnique(args: { where: { id: string } }): Promise<TItem | null>

  protected abstract update(args: { where: { id: string }; data: Partial<TItem> }): Promise<TItem>

  protected abstract delete(args: { where: { id: string } }): Promise<TItem>

  protected abstract aggregate(args: {
    where: { listId: string; isChecked: boolean }
    _max: { sortIndex: true }
  }): Promise<{ _max: { sortIndex: number | null } }>

  /**
   * Converts Prisma item to DTO.
   */
  protected abstract toDto(item: TItem): TDto

  /**
   * Lists all items in a list.
   * Automatically resets checked items if their repeat period has expired.
   */
  async listItems(userId: string, listId: string): Promise<TDto[]> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.READ)

    const items = await this.findMany({
      where: { listId },
      orderBy: [
        { isChecked: SORT_ORDER.ASC },
        { sortIndex: SORT_ORDER.ASC },
        { createdAt: SORT_ORDER.ASC }
      ]
    })

    // Find and reset expired repeating items
    const expiredIds = items
      .filter(
        (i) =>
          i.isChecked &&
          isRepeatExpired(i.checkedAt, this.hasRepeatEveryDays(i) ? i.repeatEveryDays : null)
      )
      .map((i) => i.id)

    if (expiredIds.length > 0) {
      await this.updateMany({
        where: { id: { in: expiredIds } },
        data: { isChecked: false, checkedAt: null }
      })

      // Update in-memory data
      for (const item of items) {
        if (expiredIds.includes(item.id)) {
          item.isChecked = false
          item.checkedAt = null
        }
      }
    }

    return items.map((i) => this.toDto(i))
  }

  /**
   * Toggles the checked state of an item.
   * Moves items to end of their respective groups when toggled.
   */
  async toggleItem(
    userId: string,
    listId: string,
    itemId: string,
    isChecked: boolean
  ): Promise<TDto> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    const item = await this.findUnique({ where: { id: itemId } })

    if (!item || item.listId !== listId) {
      throw ServiceError.badRequest("Item not found")
    }

    const targetChecked = Boolean(isChecked)
    let sortIndex = item.sortIndex

    // When checking: move to end of checked items
    if (targetChecked && !item.isChecked) {
      const maxChecked = await this.aggregate({
        where: { listId, isChecked: true },
        _max: { sortIndex: true }
      })
      sortIndex = (maxChecked._max.sortIndex ?? 0) + 1
    }

    // When unchecking: move to end of active items
    if (!targetChecked && item.isChecked) {
      const maxActive = await this.aggregate({
        where: { listId, isChecked: false },
        _max: { sortIndex: true }
      })
      sortIndex = (maxActive._max.sortIndex ?? 0) + 1
    }

    const updated = await this.update({
      where: { id: itemId },
      data: {
        isChecked: targetChecked,
        checkedAt: targetChecked ? new Date() : null,
        sortIndex
      } as Partial<TItem>
    })

    return this.toDto(updated)
  }

  /**
   * Removes an item from the list.
   */
  async removeItem(userId: string, listId: string, itemId: string): Promise<{ ok: boolean }> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    const existing = await this.findUnique({ where: { id: itemId } })

    if (!existing || existing.listId !== listId) {
      throw ServiceError.badRequest("Item not found")
    }

    await this.delete({ where: { id: itemId } })

    return { ok: true }
  }
}
