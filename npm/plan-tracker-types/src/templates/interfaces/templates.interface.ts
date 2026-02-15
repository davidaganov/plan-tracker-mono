import { PRICE_TYPE } from "@/products/enums/price-type.enum.js"

/**
 * DTO for a template item.
 */
export interface TemplateItemDto {
  /** Template item ID */
  id: string
  /** Sort index */
  sortIndex: number
  /** Product ID */
  productId?: string | null
  /** Title */
  title: string
  /** Quantity */
  quantity: number
  /** Price type */
  priceType: PRICE_TYPE
  /** Price currency */
  priceCurrency?: string | null
  /** Price minimum */
  priceMin?: number | null
  /** Price maximum */
  priceMax?: number | null
}

/**
 * DTO for a template.
 */
export interface TemplateDto {
  /** Template ID */
  id: string
  /** Template title */
  title: string
  /** Normalized key */
  normalizedKey: string
  /** Note */
  note?: string | null
  /** Tags */
  tags: string[]
  /** Sort index */
  sortIndex: number
  /** Owner user ID */
  ownerId: string
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
  /** Template items */
  items: TemplateItemDto[]
}

/**
 * Response for templates select.
 */
export interface TemplatesSelectResponse {
  /** Personal templates */
  personal: TemplateDto[]
  /** Family templates */
  family: TemplateDto[]
}

/**
 * DTO for creating a template.
 */
export interface CreateTemplateDto {
  /** Template title */
  title: string
  /** Note */
  note?: string | null
  /** Tags */
  tags?: string[]
}

/**
 * DTO for updating a template.
 */
export interface UpdateTemplateDto {
  /** Template title */
  title?: string
  /** Note */
  note?: string | null
  /** Tags */
  tags?: string[]
}

/**
 * DTO for adding template items.
 */
export interface AddTemplateItemsDto {
  /** Product IDs */
  productIds: string[]
}

/**
 * DTO for updating a template item.
 */
export interface UpdateTemplateItemDto {
  /** Quantity */
  quantity?: number
  /** Price type */
  priceType?: PRICE_TYPE
  /** Price currency */
  priceCurrency?: string | null
  /** Price minimum */
  priceMin?: number | null
  /** Price maximum */
  priceMax?: number | null
  /** Sort index */
  sortIndex?: number
}

/**
 * DTO for sharing a template.
 */
export interface ShareTemplateDto {
  /** Family ID */
  familyId: string
}

/**
 * DTO for setting template sharing.
 */
export interface SetTemplateSharingDto {
  /** Family ID */
  familyId: string
  /** Template IDs */
  templateIds: string[]
}
