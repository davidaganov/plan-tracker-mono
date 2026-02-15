import { PRICE_TYPE, QUANTITY_UNIT } from "@/products/enums"

/**
 * DTO for a product.
 */
export interface ProductDto {
  /** Product ID */
  id: string
  /** Product title */
  title: string
  /** Normalized key */
  normalizedKey: string
  /** Note */
  note?: string | null
  /** Default price type */
  defaultPriceType: PRICE_TYPE
  /** Default price currency */
  defaultPriceCurrency?: string | null
  /** Default price minimum */
  defaultPriceMin?: number | null
  /** Default price maximum */
  defaultPriceMax?: number | null
  /** Owner user ID */
  ownerId: string
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
  /** Default location IDs */
  defaultLocationIds: string[]
  /** Sort index */
  sortIndex: number
  /** Quantity unit */
  quantityUnit?: QUANTITY_UNIT | null
}

/**
 * Response for products select.
 */
export interface ProductsSelectResponse {
  /** Personal products */
  personal: ProductDto[]
  /** Family products */
  family: ProductDto[]
}

/**
 * DTO for creating a product.
 */
export interface CreateProductDto {
  /** Product title */
  title: string
  /** Note */
  note?: string | null
  /** Default location IDs */
  defaultLocationIds?: string[]
  /** Quantity unit */
  quantityUnit?: QUANTITY_UNIT | null
  /** Default price type */
  defaultPriceType?: PRICE_TYPE
  /** Default price currency */
  defaultPriceCurrency?: string | null
  /** Default price minimum */
  defaultPriceMin?: number | null
  /** Default price maximum */
  defaultPriceMax?: number | null
}

/**
 * DTO for updating a product.
 */
export interface UpdateProductDto {
  /** Product title */
  title?: string
  /** Note */
  note?: string | null
  /** Default location IDs */
  defaultLocationIds?: string[]
  /** Quantity unit */
  quantityUnit?: QUANTITY_UNIT | null
  /** Default price type */
  defaultPriceType?: PRICE_TYPE
  /** Default price currency */
  defaultPriceCurrency?: string | null
  /** Default price minimum */
  defaultPriceMin?: number | null
  /** Default price maximum */
  defaultPriceMax?: number | null
}

/**
 * DTO for sharing a product.
 */
export interface ShareProductDto {
  /** Family ID */
  familyId: string
}

/**
 * DTO for setting product sharing.
 */
export interface SetProductSharingDto {
  /** Family ID */
  familyId: string
  /** Product IDs */
  productIds: string[]
}
