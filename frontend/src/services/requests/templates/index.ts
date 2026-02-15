import { request } from "@/services/request"
import type {
  CreateTemplateDto,
  TemplateDto,
  UpdateTemplateDto,
  UpdateTemplateItemDto,
  ReorderItemsDto,
  BatchDeleteDto
} from "@plans-tracker/types"

/**
 * List personal templates
 */
export const list = async (): Promise<TemplateDto[]> => {
  return request.get<TemplateDto[]>("/api/templates")
}

/**
 * Get template by ID
 */
export const get = async (id: string): Promise<TemplateDto> => {
  return request.get<TemplateDto>(`/api/templates/${id}`)
}

/**
 * Create a new template
 */
export const create = async (payload: CreateTemplateDto): Promise<TemplateDto> => {
  return request.post<TemplateDto>("/api/templates", payload)
}

/**
 * Update an existing template
 */
export const update = async (id: string, payload: UpdateTemplateDto): Promise<TemplateDto> => {
  return request.patch<TemplateDto>(`/api/templates/${id}`, payload)
}

/**
 * Add items to a template
 */
export const addItems = async (templateId: string, productIds: string[]): Promise<TemplateDto> => {
  return request.post<TemplateDto>(`/api/templates/${templateId}/items`, { productIds })
}

/**
 * Remove an item from a template
 */
export const removeItem = async (templateId: string, itemId: string): Promise<TemplateDto> => {
  return request.delete<TemplateDto>(`/api/templates/${templateId}/items/${itemId}`)
}

/**
 * Delete a template
 */
export const remove = async (id: string): Promise<{ ok: boolean }> => {
  return request.delete<{ ok: boolean }>(`/api/templates/${id}`)
}

/**
 * Delete multiple templates
 */
export const removeBatch = async (ids: string[]): Promise<{ ok: boolean }> => {
  return request.delete<{ ok: boolean }>("/api/templates", {
    body: { ids } satisfies BatchDeleteDto
  })
}

/**
 * Update an item in a template
 */
export const updateItem = async (
  templateId: string,
  itemId: string,
  payload: UpdateTemplateItemDto
): Promise<TemplateDto> => {
  return request.patch<TemplateDto>(`/api/templates/${templateId}/items/${itemId}`, payload)
}

/**
 * Reorder templates
 */
export const reorder = async (orderedIds: string[]): Promise<{ ok: boolean }> => {
  return request.put<{ ok: boolean }>("/api/templates/reorder", {
    orderedIds
  } satisfies ReorderItemsDto)
}
