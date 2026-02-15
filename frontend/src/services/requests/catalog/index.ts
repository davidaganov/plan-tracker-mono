import { request } from "@/services/request"
import type {
  CreateProductDto,
  ProductDto,
  UpdateProductDto,
  ReorderItemsDto,
  BatchDeleteDto
} from "@plans-tracker/types"

/**
 * List personal products
 */
export const list = async (): Promise<ProductDto[]> => {
  return request.get<ProductDto[]>("/api/products")
}

/**
 * Create a new product
 */
export const create = async (payload: CreateProductDto): Promise<ProductDto> => {
  return request.post<ProductDto>("/api/products", payload)
}

/**
 * Update an existing product
 */
export const update = async (id: string, payload: UpdateProductDto): Promise<ProductDto> => {
  return request.patch<ProductDto>(`/api/products/${id}`, payload)
}

/**
 * Delete a product
 */
export const remove = async (id: string): Promise<{ success: boolean }> => {
  return request.delete<{ success: boolean }>(`/api/products/${id}`)
}

/**
 * Delete multiple products
 */
export const removeBatch = async (ids: string[]): Promise<{ ok: boolean }> => {
  return request.delete<{ ok: boolean }>("/api/products", {
    body: { ids } satisfies BatchDeleteDto
  })
}

/**
 * Reorder products
 */
export const reorder = async (orderedIds: string[]): Promise<{ ok: boolean }> => {
  return request.put<{ ok: boolean }>("/api/products/reorder", {
    orderedIds
  } satisfies ReorderItemsDto)
}
