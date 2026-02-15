import { PrismaClient } from "@prisma/client"
import { ListsAccessService } from "@/modules/lists/services/lists-access.service"
import { ServiceError } from "@/common/errors"
import { isRepeatExpired } from "@/common/utils/dates"
import { normalizeKey } from "@/common/utils/normalize-key"
import {
  SORT_ORDER,
  ACCESS_LEVEL,
  type ShoppingItemDto,
  type CreateShoppingItemDto,
  type UpdateShoppingItemDto
} from "@plans-tracker/types"

/**
 * Service for managing shopping list items.
 * Handles CRUD operations and business logic for shopping lists.
 */
export class ShoppingItemsService {
  private readonly listsAccess: ListsAccessService

  constructor(private readonly prisma: PrismaClient) {
    this.listsAccess = new ListsAccessService(prisma)
  }

  /**
   * Verifies that a product can be used in a list.
   * Products must either belong to the user or be shared to the list's families.
   * @throws ServiceError.badRequest if product is not allowed
   */
  private async ensureProductAllowed(
    userId: string,
    listId: string,
    productId: string
  ): Promise<void> {
    const list = await this.listsAccess.getListOrThrow(listId)

    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw ServiceError.badRequest("Product not found")
    }

    // Owner's own product is always allowed
    if (product.ownerId === userId) return

    // For personal lists, only owner's products work
    if (list.familyShares.length === 0) {
      throw ServiceError.badRequest("Product must belong to current user")
    }

    // Check if product is shared to any of the list's families
    const familyIds = list.familyShares.map((s) => s.familyId)
    const sharedCount = await this.prisma.productFamilyShare.count({
      where: { familyId: { in: familyIds }, productId }
    })

    if (sharedCount === 0) {
      throw ServiceError.badRequest("Product is not available for this list")
    }
  }

  /**
   * Converts a Prisma shopping item to DTO.
   */
  private toDto(item: {
    id: string
    title: string
    productId: string | null
    quantity: number
    repeatEveryDays: number | null
    isChecked: boolean
    checkedAt: Date | null
    sortIndex: number
    createdAt: Date
    updatedAt: Date
  }): ShoppingItemDto {
    return {
      id: item.id,
      title: item.title,
      productId: item.productId ?? "",
      quantity: item.quantity,
      repeatEveryDays: item.repeatEveryDays,
      isChecked: item.isChecked,
      checkedAt: item.checkedAt,
      sortIndex: item.sortIndex,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
  }

  /**
   * Lists all shopping items in a list.
   * SIDE EFFECT: Automatically resets checked items if their repeat period has expired.
   * @param userId - ID of the user requesting the list
   * @param listId - ID of the list
   * @returns Array of shopping items
   */
  async listItems(userId: string, listId: string): Promise<ShoppingItemDto[]> {
    await this.listsAccess.assertAccess(userId, listId, ACCESS_LEVEL.READ)

    const items = await this.prisma.shoppingListItem.findMany({
      where: { listId },
      orderBy: [
        { isChecked: SORT_ORDER.ASC },
        { sortIndex: SORT_ORDER.ASC },
        { createdAt: SORT_ORDER.ASC }
      ]
    })

    // Find and reset expired repeating items
    const expiredIds = items
      .filter((i) => i.isChecked && isRepeatExpired(i.checkedAt, i.repeatEveryDays))
      .map((i) => i.id)

    if (expiredIds.length > 0) {
      await this.prisma.shoppingListItem.updateMany({
        where: { id: { in: expiredIds } },
        data: { isChecked: false, checkedAt: null }
      })

      // Update in-memory data to reflect changes immediately
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
   * Creates a new shopping item.
   * Auto-assigns sort index to end of list.
   */
  async createItem(
    userId: string,
    listId: string,
    dto: CreateShoppingItemDto
  ): Promise<ShoppingItemDto> {
    await this.listsAccess.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    if (dto.productId) {
      await this.ensureProductAllowed(userId, listId, dto.productId)
    }

    // Get next sort index
    const maxSort = await this.prisma.shoppingListItem.aggregate({
      where: { listId, isChecked: false },
      _max: { sortIndex: true }
    })
    const sortIndex = (maxSort._max.sortIndex ?? 0) + 1

    // Determine title: use provided or get from product
    let title = dto.title ?? ""
    if (!title && dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId }
      })
      if (product) title = product.title
    }

    const item = await this.prisma.shoppingListItem.create({
      data: {
        listId,
        title,
        normalizedKey: normalizeKey(title),
        quantity: dto.quantity ?? 1,
        productId: dto.productId,
        repeatEveryDays: dto.repeatEveryDays,
        sortIndex
      }
    })

    return this.toDto(item)
  }

  /**
   * Updates an existing shopping item.
   */
  async updateItem(
    userId: string,
    listId: string,
    itemId: string,
    dto: UpdateShoppingItemDto
  ): Promise<ShoppingItemDto> {
    await this.listsAccess.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    if (dto.productId) {
      await this.ensureProductAllowed(userId, listId, dto.productId)
    }

    const item = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.shoppingListItem.findUnique({
        where: { id: itemId }
      })

      if (!existing || existing.listId !== listId) {
        throw ServiceError.badRequest("Item not found")
      }

      return tx.shoppingListItem.update({
        where: { id: itemId },
        data: {
          quantity: dto.quantity ?? undefined,
          productId: dto.productId,
          title: dto.title ?? undefined,
          repeatEveryDays: dto.repeatEveryDays,
          sortIndex: dto.sortIndex ?? undefined
        }
      })
    })

    return this.toDto(item)
  }

  /**
   * Toggles the checked state of an item.
   * Moves checked items to the bottom of the list.
   */
  async toggleItem(
    userId: string,
    listId: string,
    itemId: string,
    isChecked: boolean
  ): Promise<ShoppingItemDto> {
    await this.listsAccess.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId }
    })

    if (!item || item.listId !== listId) {
      throw ServiceError.badRequest("Item not found")
    }

    const targetChecked = Boolean(isChecked)
    let sortIndex = item.sortIndex

    // When checking: move to end of checked items
    if (targetChecked && !item.isChecked) {
      const maxChecked = await this.prisma.shoppingListItem.aggregate({
        where: { listId, isChecked: true },
        _max: { sortIndex: true }
      })
      sortIndex = (maxChecked._max.sortIndex ?? 0) + 1
    }

    // When unchecking: move to end of active items
    if (!targetChecked && item.isChecked) {
      const maxActive = await this.prisma.shoppingListItem.aggregate({
        where: { listId, isChecked: false },
        _max: { sortIndex: true }
      })
      sortIndex = (maxActive._max.sortIndex ?? 0) + 1
    }

    const updated = await this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        isChecked: targetChecked,
        checkedAt: targetChecked ? new Date() : null,
        sortIndex
      }
    })

    return this.toDto(updated)
  }

  /**
   * Removes an item from the list.
   */
  async removeItem(userId: string, listId: string, itemId: string): Promise<{ ok: boolean }> {
    await this.listsAccess.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    const existing = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId }
    })

    if (!existing || existing.listId !== listId) {
      throw ServiceError.badRequest("Item not found")
    }

    await this.prisma.shoppingListItem.delete({ where: { id: itemId } })

    return { ok: true }
  }

  /**
   * Reorders items in a list.
   * @param checked - Whether to reorder checked or unchecked items
   */
  async reorderItems(
    userId: string,
    listId: string,
    orderedIds: string[],
    checked: boolean
  ): Promise<{ ok: boolean }> {
    await this.listsAccess.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    if (!orderedIds || orderedIds.length === 0) {
      throw ServiceError.badRequest("orderedIds is required")
    }

    const items = await this.prisma.shoppingListItem.findMany({
      where: { id: { in: orderedIds } },
      select: { id: true, listId: true, isChecked: true }
    })

    if (items.some((i) => i.listId !== listId)) {
      throw ServiceError.badRequest("Some items do not belong to list")
    }

    if (items.some((i) => i.isChecked !== checked)) {
      throw ServiceError.badRequest("checked-group mismatch")
    }

    await this.prisma.$transaction(
      orderedIds.map((id, idx) =>
        this.prisma.shoppingListItem.update({
          where: { id },
          data: { sortIndex: idx + 1 }
        })
      )
    )

    return { ok: true }
  }
}
