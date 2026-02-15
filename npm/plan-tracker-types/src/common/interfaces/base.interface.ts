/**
 * Base DTO with common fields for all entities.
 */
export interface BaseEntityDto {
  /** Entity ID */
  id: string
  /** Entity creation date */
  createdAt: Date
  /** Entity update date */
  updatedAt: Date
}

/**
 * Base DTO for items (tasks, shopping items).
 */
export interface BaseItemDto extends BaseEntityDto {
  /** Item title */
  title: string
  /** Item checked state */
  isChecked: boolean
  /** Item checked date */
  checkedAt: Date | null
  /** Item sort index */
  sortIndex: number
}

/**
 * Interface representing the database/Prisma model for an item.
 * Contains fields common to ShoppingListItem and TaskListItem.
 */
export interface BaseItemModel extends BaseItemDto {
  /** Item list ID */
  listId: string
  /** Item normalized key */
  normalizedKey: string
}

/**
 * DTO for updating an entity (list or template).
 */
export interface EntityUpdateDto {
  /** Name (for lists) */
  name?: string
  /** Title (for templates) */
  title?: string
  /** Tags */
  tags?: string[]
  /** Note */
  note?: string | null
}

/**
 * DTO for batch deletion.
 */
export interface BatchDeleteDto {
  /** Array of entity IDs to delete */
  ids: string[]
}
