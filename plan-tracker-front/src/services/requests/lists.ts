import { request } from "@/services/request"
import type {
  ApplyTemplatesDto,
  CreateListDto,
  CreateShoppingItemDto,
  ListDto,
  LIST_TYPE,
  SendListDto,
  ShoppingItemDto,
  ToggleItemDto,
  UpdateListDto,
  UpdateShoppingItemDto,
  ReorderItemsDto,
  BatchDeleteDto
} from "@plans-tracker/types"

export const list = (params?: { type?: LIST_TYPE; familyId?: string }) =>
  request.get<ListDto[]>("/api/lists", { params })

export const get = (id: string) => request.get<ListDto>(`/api/lists/${id}`)

export const create = (data: CreateListDto) => request.post<ListDto>("/api/lists", data)

export const update = (id: string, data: UpdateListDto) =>
  request.patch<ListDto>(`/api/lists/${id}`, data)

export const remove = (id: string) => request.delete(`/api/lists/${id}`)

export const removeBatch = (ids: string[]) =>
  request.delete("/api/lists", { body: { ids } satisfies BatchDeleteDto })

export const share = (id: string, familyId: string) =>
  request.post(`/api/lists/${id}/share`, { familyId } satisfies { familyId: string })

export const unshare = (id: string, familyId: string) =>
  request.post(`/api/lists/${id}/unshare`, { familyId } satisfies { familyId: string })

export const reorder = (orderedIds: string[]) =>
  request.put<{ ok: boolean }>("/api/lists/reorder", { orderedIds } satisfies ReorderItemsDto)

// Items
export const listItems = (listId: string) =>
  request.get<ShoppingItemDto[]>(`/api/lists/${listId}/shopping-items`)

export const createItem = (listId: string, data: CreateShoppingItemDto) =>
  request.post<ShoppingItemDto>(`/api/lists/${listId}/shopping-items`, data)

export const updateItem = (listId: string, itemId: string, data: UpdateShoppingItemDto) =>
  request.patch<ShoppingItemDto>(`/api/lists/${listId}/shopping-items/${itemId}`, data)

export const toggleItem = (listId: string, itemId: string, isChecked: boolean) =>
  request.post<ShoppingItemDto>(`/api/lists/${listId}/shopping-items/${itemId}/toggle`, {
    isChecked
  } satisfies ToggleItemDto)

export const removeItem = (listId: string, itemId: string) =>
  request.delete(`/api/lists/${listId}/shopping-items/${itemId}`)

export const applyTemplates = (listId: string, templateIds: string[]) =>
  request.post<{ ok: boolean; created: number; updated: number }>(
    `/api/lists/${listId}/shopping-items/apply-templates`,
    { templateIds } satisfies ApplyTemplatesDto
  )

export const sendList = (listId: string, payload: SendListDto) =>
  request.post<{ ok: boolean; sent: number }>(`/api/lists/${listId}/shopping-items/send`, payload)
