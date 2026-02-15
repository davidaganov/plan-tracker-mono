import {
  PrismaClient,
  List,
  ListFamilyShare,
  Prisma,
  LIST_TYPE as DbListType,
  LIST_SORT_MODE as DbListSortMode
} from "@prisma/client"
import { ListsAccessService } from "@/modules/lists/services/lists-access.service"
import { ServiceError } from "@/common/errors"
import {
  LIST_SORT_MODE,
  SORT_ORDER,
  LIST_TYPE,
  ACCESS_LEVEL,
  FAMILY_ROLE,
  type ListDto,
  type CreateListDto,
  type UpdateListDto
} from "@plans-tracker/types"

type ListWithShares = List & { familyShares: ListFamilyShare[] }

/**
 * Service for managing lists (CRUD operations).
 */
export class ListsService {
  private readonly access: ListsAccessService

  constructor(private readonly prisma: PrismaClient) {
    this.access = new ListsAccessService(prisma)
  }

  /**
   * Converts Prisma list entity to DTO.
   */
  private toDto(list: ListWithShares): ListDto {
    const tags = Array.isArray(list.tags)
      ? list.tags.filter((t): t is string => typeof t === "string")
      : []

    return {
      id: list.id,
      type: list.type as unknown as LIST_TYPE,
      name: list.name,
      icon: list.icon,
      color: list.color,
      sortMode: list.sortMode as unknown as LIST_SORT_MODE,
      groupByLocations: list.groupByLocations,
      ownerId: list.ownerId,
      familyIds: list.familyShares.map((s) => s.familyId),
      tags,
      sortIndex: list.sortIndex,
      note: list.note,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt
    }
  }

  /**
   * Lists all lists accessible to the user.
   */
  async listMyLists(
    userId: string,
    filter: { type?: LIST_TYPE; familyId?: string | null }
  ): Promise<ListDto[]> {
    const typeFilter = filter.type ? { type: filter.type as unknown as DbListType } : {}

    // Personal lists only (not shared)
    if (filter.familyId === null) {
      const lists = await this.prisma.list.findMany({
        where: {
          ownerId: userId,
          ...typeFilter,
          familyShares: { none: {} }
        },
        include: { familyShares: true },
        orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
      })
      return lists.map((l) => this.toDto(l))
    }

    // Family lists only
    if (filter.familyId) {
      const lists = await this.prisma.list.findMany({
        where: {
          ...typeFilter,
          familyShares: {
            some: {
              familyId: filter.familyId,
              family: { members: { some: { userId } } }
            }
          }
        },
        include: { familyShares: true },
        orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
      })
      return lists.map((l) => this.toDto(l))
    }

    // All accessible lists (owned + shared via family)
    const [owned, shared] = await this.prisma.$transaction([
      this.prisma.list.findMany({
        where: { ownerId: userId, ...typeFilter },
        include: { familyShares: true },
        orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
      }),
      this.prisma.list.findMany({
        where: {
          ...typeFilter,
          familyShares: { some: { family: { members: { some: { userId } } } } }
        },
        include: { familyShares: true },
        orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
      })
    ])

    // Deduplicate by id
    const byId = new Map<string, ListWithShares>()
    for (const l of [...owned, ...shared]) {
      byId.set(l.id, l)
    }

    return Array.from(byId.values()).map((l) => this.toDto(l))
  }

  /**
   * Gets a single list by ID.
   */
  async getList(userId: string, listId: string): Promise<ListDto> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.READ)

    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { familyShares: true }
    })

    if (!list) {
      throw ServiceError.notFound("List not found")
    }

    return this.toDto(list)
  }

  /**
   * Creates a new list.
   */
  async createList(userId: string, dto: CreateListDto): Promise<ListDto> {
    const list = await this.prisma.list.create({
      data: {
        ownerId: userId,
        type: dto.type as unknown as DbListType,
        name: dto.name,
        icon: dto.icon,
        color: dto.color,
        sortMode: (dto.sortMode ?? LIST_SORT_MODE.CREATED_AT) as unknown as DbListSortMode,
        groupByLocations: dto.groupByLocations ?? false,
        tags: dto.tags ?? Prisma.JsonNull,
        note: dto.note
      },
      include: { familyShares: true }
    })

    return this.toDto(list)
  }

  /**
   * Updates an existing list.
   */
  async updateList(userId: string, listId: string, dto: UpdateListDto): Promise<ListDto> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    const list = await this.prisma.list.update({
      where: { id: listId },
      data: {
        name: dto.name ?? undefined,
        icon: dto.icon,
        color: dto.color,
        sortMode: (dto.sortMode ?? undefined) as unknown as DbListSortMode | undefined,
        groupByLocations: dto.groupByLocations ?? undefined,
        tags: dto.tags === null ? Prisma.JsonNull : (dto.tags ?? undefined),
        note: dto.note
      },
      include: { familyShares: true }
    })

    return this.toDto(list)
  }

  /**
   * Deletes a list and all its items.
   */
  async deleteList(userId: string, listId: string): Promise<{ ok: boolean }> {
    await this.access.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)

    await this.prisma.$transaction(async (tx) => {
      await tx.listFamilyShare.deleteMany({ where: { listId } })
      await tx.shoppingListItem.deleteMany({ where: { listId } })
      await tx.taskListItem.deleteMany({ where: { listId } })
      await tx.list.delete({ where: { id: listId } })
    })

    return { ok: true }
  }

  /**
   * Deletes multiple lists.
   */
  async deleteLists(userId: string, listIds: string[]): Promise<{ ok: boolean }> {
    const lists = await this.prisma.list.findMany({
      where: { id: { in: listIds }, ownerId: userId }
    })

    if (lists.length !== listIds.length) {
      throw ServiceError.forbidden("Some lists not found or not owned by you")
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.listFamilyShare.deleteMany({ where: { listId: { in: listIds } } })
      await tx.shoppingListItem.deleteMany({ where: { listId: { in: listIds } } })
      await tx.taskListItem.deleteMany({ where: { listId: { in: listIds } } })
      await tx.list.deleteMany({ where: { id: { in: listIds } } })
    })

    return { ok: true }
  }

  /**
   * Shares a list with a family.
   */
  async shareList(userId: string, listId: string, familyId: string): Promise<{ ok: boolean }> {
    const list = await this.access.getListOrThrow(listId)

    if (list.ownerId !== userId) {
      throw ServiceError.forbidden("Only list owner can change sharing")
    }

    const member = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })

    if (!member || member.role !== FAMILY_ROLE.ADMIN) {
      throw ServiceError.forbidden("Family admin role required to share")
    }

    await this.prisma.listFamilyShare.upsert({
      where: { listId_familyId: { listId, familyId } },
      create: { listId, familyId },
      update: {}
    })

    return { ok: true }
  }

  /**
   * Removes list sharing from a family.
   */
  async unshareList(userId: string, listId: string, familyId: string): Promise<{ ok: boolean }> {
    const list = await this.access.getListOrThrow(listId)

    if (list.ownerId !== userId) {
      throw ServiceError.forbidden("Only list owner can change sharing")
    }

    await this.prisma.listFamilyShare.delete({
      where: { listId_familyId: { listId, familyId } }
    })

    return { ok: true }
  }

  /**
   * Reorders lists.
   */
  async reorderLists(userId: string, orderedIds: string[]): Promise<{ ok: boolean }> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.list.update({
          where: { id },
          data: { sortIndex: index }
        })
      )
    )

    return { ok: true }
  }
}
