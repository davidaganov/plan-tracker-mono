import { PrismaClient } from "@prisma/client"
import { ServiceError } from "@/common/errors"
import { normalizeKey } from "@/common/utils/normalize-key"
import { LIST_TYPE, SEARCH_SCOPE, SORT_ORDER } from "@plans-tracker/types"
import type { SearchItemsQuery, SearchItemResult } from "@plans-tracker/types"

/**
 * Service for searching items across lists.
 */
export class SearchItemsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Searches for items across accessible lists.
   */
  async searchItems(userId: string, query: SearchItemsQuery): Promise<SearchItemResult[]> {
    const q = (query.query ?? "").trim()
    if (!q) {
      throw ServiceError.badRequest("query is required")
    }

    const type = query.type
    const scope = query.scope ?? SEARCH_SCOPE.ALL
    const familyId = query.familyId

    if (scope === SEARCH_SCOPE.FAMILY && !familyId) {
      throw ServiceError.badRequest("familyId is required for scope=family")
    }

    // Build list filter
    const listWhere: Record<string, unknown> = {}
    if (type) listWhere.type = type

    if (scope === SEARCH_SCOPE.PERSONAL) {
      listWhere.ownerId = userId
      listWhere.familyShares = { none: {} }
    } else if (scope === SEARCH_SCOPE.FAMILY) {
      listWhere.familyShares = {
        some: {
          familyId,
          family: { members: { some: { userId } } }
        }
      }
    } else {
      listWhere.OR = [
        { ownerId: userId },
        { familyShares: { some: { family: { members: { some: { userId } } } } } }
      ]
    }

    // Get accessible lists
    const lists = await this.prisma.list.findMany({
      where: listWhere,
      select: { id: true, type: true, name: true }
    })

    const listIds = lists.map((l) => l.id)
    if (listIds.length === 0) return []

    const listById = new Map(lists.map((l) => [l.id, l] as const))
    const normalizedQuery = normalizeKey(q)

    // Search by type
    if (type === LIST_TYPE.TASKS) {
      return this.searchTaskItems(listIds, normalizedQuery, listById)
    }

    if (type === LIST_TYPE.SHOPPING) {
      return this.searchShoppingItems(listIds, normalizedQuery, listById)
    }

    // Search both types
    const [shopping, tasks] = await this.prisma.$transaction([
      this.prisma.shoppingListItem.findMany({
        where: {
          listId: { in: listIds },
          normalizedKey: { contains: normalizedQuery }
        },
        select: {
          id: true,
          listId: true,
          title: true,
          quantity: true,
          isChecked: true,
          sortIndex: true
        },
        orderBy: [
          { isChecked: SORT_ORDER.ASC },
          { sortIndex: SORT_ORDER.ASC },
          { createdAt: SORT_ORDER.ASC }
        ]
      }),
      this.prisma.taskListItem.findMany({
        where: {
          listId: { in: listIds },
          normalizedKey: { contains: normalizedQuery }
        },
        select: {
          id: true,
          listId: true,
          title: true,
          isChecked: true,
          sortIndex: true
        },
        orderBy: [
          { isChecked: SORT_ORDER.ASC },
          { sortIndex: SORT_ORDER.ASC },
          { createdAt: SORT_ORDER.ASC }
        ]
      })
    ])

    return [
      ...shopping.map((i) => ({
        id: i.id,
        listId: i.listId,
        title: i.title,
        isChecked: i.isChecked,
        sortIndex: i.sortIndex,
        listType: LIST_TYPE.SHOPPING,
        listName: listById.get(i.listId)?.name ?? "",
        quantity: i.quantity
      })),
      ...tasks.map((i) => ({
        id: i.id,
        listId: i.listId,
        title: i.title,
        isChecked: i.isChecked,
        sortIndex: i.sortIndex,
        listType: LIST_TYPE.TASKS,
        listName: listById.get(i.listId)?.name ?? ""
      }))
    ]
  }

  private async searchTaskItems(
    listIds: string[],
    normalizedQuery: string,
    listById: Map<string, { id: string; type: string; name: string }>
  ): Promise<SearchItemResult[]> {
    const items = await this.prisma.taskListItem.findMany({
      where: {
        listId: { in: listIds },
        normalizedKey: { contains: normalizedQuery }
      },
      select: {
        id: true,
        listId: true,
        title: true,
        isChecked: true,
        sortIndex: true
      },
      orderBy: [
        { isChecked: SORT_ORDER.ASC },
        { sortIndex: SORT_ORDER.ASC },
        { createdAt: SORT_ORDER.ASC }
      ]
    })

    return items.map((i) => ({
      id: i.id,
      listId: i.listId,
      title: i.title,
      isChecked: i.isChecked,
      sortIndex: i.sortIndex,
      listType: LIST_TYPE.TASKS,
      listName: listById.get(i.listId)?.name ?? ""
    }))
  }

  private async searchShoppingItems(
    listIds: string[],
    normalizedQuery: string,
    listById: Map<string, { id: string; type: string; name: string }>
  ): Promise<SearchItemResult[]> {
    const items = await this.prisma.shoppingListItem.findMany({
      where: {
        listId: { in: listIds },
        normalizedKey: { contains: normalizedQuery }
      },
      select: {
        id: true,
        listId: true,
        title: true,
        quantity: true,
        isChecked: true,
        sortIndex: true
      },
      orderBy: [
        { isChecked: SORT_ORDER.ASC },
        { sortIndex: SORT_ORDER.ASC },
        { createdAt: SORT_ORDER.ASC }
      ]
    })

    return items.map((i) => ({
      id: i.id,
      listId: i.listId,
      title: i.title,
      isChecked: i.isChecked,
      sortIndex: i.sortIndex,
      listType: LIST_TYPE.SHOPPING,
      listName: listById.get(i.listId)?.name ?? "",
      quantity: i.quantity
    }))
  }
}
