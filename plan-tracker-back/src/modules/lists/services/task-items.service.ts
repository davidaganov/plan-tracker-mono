import { PrismaClient } from "@prisma/client"
import { ListsAccessService } from "@/modules/lists/services/lists-access.service"
import { ServiceError } from "@/common/errors"
import { isRepeatExpired } from "@/common/utils/dates"
import { normalizeKey } from "@/common/utils/normalize-key"
import {
  SORT_ORDER,
  ACCESS_LEVEL,
  type TaskItemDto,
  type CreateTaskItemDto,
  type UpdateTaskItemDto
} from "@plans-tracker/types"

/**
 * Service for managing task list items.
 */
export class TaskItemsService {
  private readonly access: ListsAccessService

  constructor(private readonly prisma: PrismaClient) {
    this.access = new ListsAccessService(prisma)
  }

  /**
   * Converts a Prisma task item to DTO.
   */
  private toDto(item: {
    id: string
    title: string
    normalizedKey: string
    durationMinutes: number | null
    repeatEveryDays: number | null
    isChecked: boolean
    checkedAt: Date | null
    sortIndex: number
    createdAt: Date
    updatedAt: Date
  }): TaskItemDto {
    return {
      id: item.id,
      title: item.title,
      normalizedKey: item.normalizedKey,
      durationMinutes: item.durationMinutes,
      repeatEveryDays: item.repeatEveryDays,
      isChecked: item.isChecked,
      checkedAt: item.checkedAt,
      sortIndex: item.sortIndex,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
  }

  /**
   * Lists all task items in a list.
   * Automatically resets checked items if their repeat period has expired.
   */
  async listItems(userId: string, listId: string): Promise<TaskItemDto[]> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.READ)

    const items = await this.prisma.taskListItem.findMany({
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
      await this.prisma.taskListItem.updateMany({
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
   * Creates a new task item.
   */
  async createItem(userId: string, listId: string, dto: CreateTaskItemDto): Promise<TaskItemDto> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    // Get next sort index
    const maxSort = await this.prisma.taskListItem.aggregate({
      where: { listId, isChecked: false },
      _max: { sortIndex: true }
    })
    const sortIndex = (maxSort._max.sortIndex ?? 0) + 1

    const item = await this.prisma.taskListItem.create({
      data: {
        listId,
        title: dto.title,
        normalizedKey: normalizeKey(dto.title),
        durationMinutes: dto.durationMinutes,
        repeatEveryDays: dto.repeatEveryDays,
        sortIndex
      }
    })

    return this.toDto(item)
  }

  /**
   * Updates an existing task item.
   */
  async updateItem(
    userId: string,
    listId: string,
    itemId: string,
    dto: UpdateTaskItemDto
  ): Promise<TaskItemDto> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    const existing = await this.prisma.taskListItem.findUnique({
      where: { id: itemId }
    })

    if (!existing || existing.listId !== listId) {
      throw ServiceError.badRequest("Item not found")
    }

    const item = await this.prisma.taskListItem.update({
      where: { id: itemId },
      data: {
        title: dto.title ?? undefined,
        normalizedKey: dto.title ? normalizeKey(dto.title) : undefined,
        durationMinutes: dto.durationMinutes,
        repeatEveryDays: dto.repeatEveryDays
      }
    })

    return this.toDto(item)
  }

  /**
   * Toggles the checked state of an item.
   */
  async toggleItem(
    userId: string,
    listId: string,
    itemId: string,
    isChecked: boolean
  ): Promise<TaskItemDto> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    const item = await this.prisma.taskListItem.findUnique({
      where: { id: itemId }
    })

    if (!item || item.listId !== listId) {
      throw ServiceError.badRequest("Item not found")
    }

    const targetChecked = Boolean(isChecked)
    let sortIndex = item.sortIndex

    // When checking: move to end of checked items
    if (targetChecked && !item.isChecked) {
      const maxChecked = await this.prisma.taskListItem.aggregate({
        where: { listId, isChecked: true },
        _max: { sortIndex: true }
      })
      sortIndex = (maxChecked._max.sortIndex ?? 0) + 1
    }

    // When unchecking: move to end of active items
    if (!targetChecked && item.isChecked) {
      const maxActive = await this.prisma.taskListItem.aggregate({
        where: { listId, isChecked: false },
        _max: { sortIndex: true }
      })
      sortIndex = (maxActive._max.sortIndex ?? 0) + 1
    }

    const updated = await this.prisma.taskListItem.update({
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
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    const existing = await this.prisma.taskListItem.findUnique({
      where: { id: itemId }
    })

    if (!existing || existing.listId !== listId) {
      throw ServiceError.badRequest("Item not found")
    }

    await this.prisma.taskListItem.delete({ where: { id: itemId } })

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
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    if (!orderedIds || orderedIds.length === 0) {
      throw ServiceError.badRequest("orderedIds is required")
    }

    const items = await this.prisma.taskListItem.findMany({
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
        this.prisma.taskListItem.update({
          where: { id },
          data: { sortIndex: idx + 1 }
        })
      )
    )

    return { ok: true }
  }
}
