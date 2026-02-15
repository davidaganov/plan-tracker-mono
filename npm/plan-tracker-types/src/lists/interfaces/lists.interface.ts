import { LIST_TYPE, LIST_SORT_MODE, SEARCH_SCOPE } from "@/lists/enums"

/**
 * DTO for a list.
 */
export interface ListDto {
  /** List ID */
  id: string
  /** List type */
  type: LIST_TYPE
  /** List name */
  name: string
  /** List icon */
  icon?: string | null
  /** List color */
  color?: string | null
  /** Sort mode */
  sortMode: LIST_SORT_MODE
  /** Whether to group by locations */
  groupByLocations: boolean
  /** Owner user ID */
  ownerId: string
  /** Family IDs */
  familyIds: string[]
  /** Tags */
  tags?: string[] | null
  /** Note */
  note?: string | null
  /** Sort index */
  sortIndex: number
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
}

/**
 * DTO for a shopping item.
 */
export interface ShoppingItemDto {
  /** Item ID */
  id: string
  /** Item title */
  title: string
  /** Product ID */
  productId: string
  /** Quantity */
  quantity: number
  /** Repeat every days */
  repeatEveryDays: number | null
  /** Whether checked */
  isChecked: boolean
  /** Checked date */
  checkedAt: Date | null
  /** Sort index */
  sortIndex: number
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
}

/**
 * DTO for a task item.
 */
export interface TaskItemDto {
  /** Item ID */
  id: string
  /** Item title */
  title: string
  /** Normalized key */
  normalizedKey: string
  /** Duration in minutes */
  durationMinutes: number | null
  /** Repeat every days */
  repeatEveryDays: number | null
  /** Whether checked */
  isChecked: boolean
  /** Checked date */
  checkedAt: Date | null
  /** Sort index */
  sortIndex: number
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
}

/**
 * DTO for search item result.
 */
export interface SearchItemResult {
  /** Item ID */
  id: string
  /** List ID */
  listId: string
  /** Item title */
  title: string
  /** Whether checked */
  isChecked: boolean
  /** Sort index */
  sortIndex: number
  /** List type */
  listType: LIST_TYPE
  /** List name */
  listName: string
  /** Quantity */
  quantity?: number
}

/**
 * DTO for creating a list.
 */
export interface CreateListDto {
  /** List type */
  type: LIST_TYPE
  /** List name */
  name: string
  /** List icon */
  icon?: string | null
  /** List color */
  color?: string | null
  /** Sort mode */
  sortMode?: LIST_SORT_MODE
  /** Whether to group by locations */
  groupByLocations?: boolean
  /** Tags */
  tags?: string[]
  /** Note */
  note?: string | null
}

/**
 * DTO for updating a list.
 */
export interface UpdateListDto {
  /** List name */
  name?: string
  /** List icon */
  icon?: string | null
  /** List color */
  color?: string | null
  /** Sort mode */
  sortMode?: LIST_SORT_MODE
  /** Whether to group by locations */
  groupByLocations?: boolean
  /** Tags */
  tags?: string[]
  /** Note */
  note?: string | null
}

/**
 * DTO for sharing a list.
 */
export interface ShareListDto {
  /** Family ID */
  familyId: string
}

/**
 * Interface for list ID parameter.
 */
export interface ListIdParam {
  /** List ID */
  listId: string
}

/**
 * DTO for creating a shopping item.
 */
export interface CreateShoppingItemDto {
  /** Item title */
  title?: string | null
  /** Product ID */
  productId?: string | null
  /** Quantity */
  quantity?: number | null
  /** Repeat every days */
  repeatEveryDays?: number | null
}

/**
 * DTO for updating a shopping item.
 */
export interface UpdateShoppingItemDto {
  /** Item title */
  title?: string | null
  /** Product ID */
  productId?: string | null
  /** Quantity */
  quantity?: number | null
  /** Repeat every days */
  repeatEveryDays?: number | null
  /** Sort index */
  sortIndex?: number | null
}

/**
 * DTO for toggling an item.
 */
export interface ToggleItemDto {
  /** Whether checked */
  isChecked: boolean
}

/**
 * DTO for reordering items.
 */
export interface ReorderItemsDto {
  /** Ordered item IDs */
  orderedIds: string[]
}

/**
 * DTO for applying templates.
 */
export interface ApplyTemplatesDto {
  /** Template IDs */
  templateIds: string[]
}

/**
 * DTO for sending a list.
 */
export interface SendListDto {
  /** Family ID */
  /** Family ID */
  familyId: string
  /** Recipient user IDs */
  recipientUserIds?: string[]
  /** Whether to send to all except me */
  allExceptMe?: boolean
}

/**
 * Interface for shopping item ID parameter.
 */
export interface ShoppingItemIdParam {
  /** List ID */
  listId: string
  /** Item ID */
  itemId: string
}

/**
 * DTO for creating a task item.
 */
export interface CreateTaskItemDto {
  /** Item title */
  title: string
  /** Duration in minutes */
  durationMinutes?: number | null
  /** Repeat every days */
  repeatEveryDays?: number | null
}

/**
 * DTO for updating a task item.
 */
export interface UpdateTaskItemDto {
  /** Item title */
  title?: string | null
  /** Duration in minutes */
  durationMinutes?: number | null
  /** Repeat every days */
  repeatEveryDays?: number | null
}

/**
 * Interface for task item ID parameter.
 */
export interface TaskItemIdParam {
  /** List ID */
  listId: string
  /** Item ID */
  itemId: string
}

/**
 * Interface for search items query.
 */
export interface SearchItemsQuery {
  /** Search query */
  query: string
  /** List type */
  type?: LIST_TYPE
  /** Family ID */
  familyId?: string
  /** Search scope */
  scope?: SEARCH_SCOPE
}
