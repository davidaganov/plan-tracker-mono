import { ref } from "vue"
import { defineStore } from "pinia"
import { ApiClient } from "@/services/client"
import {
  LIST_SORT_MODE,
  LIST_TYPE,
  type CreateListDto,
  type CreateShoppingItemDto,
  type ListDto,
  type ShoppingItemDto,
  type UpdateListDto,
  type UpdateShoppingItemDto
} from "@plans-tracker/types"

export const useListsStore = defineStore("lists", () => {
  const items = ref<ListDto[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchLists = async () => {
    isLoading.value = true
    try {
      items.value = await ApiClient.lists.list({ type: LIST_TYPE.SHOPPING })
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load lists"
    } finally {
      isLoading.value = false
    }
  }

  const getListById = async (id: string): Promise<ListDto | null> => {
    try {
      return await ApiClient.lists.get(id)
    } catch (e) {
      console.error("Failed to get list", e)
      return null
    }
  }

  const createList = async (
    name: string,
    options?: { icon?: string; color?: string; tags?: string[]; note?: string | null }
  ) => {
    try {
      const newList = await ApiClient.lists.create({
        type: LIST_TYPE.SHOPPING,
        name,
        icon: options?.icon,
        color: options?.color,
        tags: options?.tags,
        note: options?.note,
        sortMode: LIST_SORT_MODE.CREATED_AT,
        groupByLocations: false
      } satisfies CreateListDto)
      items.value.push(newList)
      return newList
    } catch (e) {
      throw e
    }
  }

  const updateList = async (id: string, data: UpdateListDto) => {
    try {
      const updated = await ApiClient.lists.update(id, data)
      const index = items.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        items.value[index] = updated
      }
      return updated
    } catch (e) {
      throw e
    }
  }

  const deleteList = async (id: string) => {
    try {
      await ApiClient.lists.remove(id)
      items.value = items.value.filter((l) => l.id !== id)
    } catch (e) {
      throw e
    }
  }

  const deleteLists = async (ids: string[]) => {
    try {
      await ApiClient.lists.removeBatch(ids)
      items.value = items.value.filter((l) => !ids.includes(l.id))
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to delete lists"
      throw e
    }
  }

  const shareList = async (listId: string, familyId: string) => {
    await ApiClient.lists.share(listId, familyId)
    // Optionally refresh list or optimize locally
    await fetchLists()
  }

  const unshareList = async (listId: string, familyId: string) => {
    await ApiClient.lists.unshare(listId, familyId)
    await fetchLists()
  }

  const fetchItems = async (listId: string): Promise<ShoppingItemDto[]> => {
    return await ApiClient.lists.listItems(listId)
  }

  const addItem = async (listId: string, data: CreateShoppingItemDto) => {
    // Determine quantity defaulting to 1 if not provided? Backend handles it.
    return await ApiClient.lists.createItem(listId, { ...data, quantity: data.quantity ?? 1 })
  }

  const updateItem = async (listId: string, itemId: string, data: UpdateShoppingItemDto) => {
    return await ApiClient.lists.updateItem(listId, itemId, data)
  }

  const toggleItem = async (listId: string, itemId: string, isChecked: boolean) => {
    return await ApiClient.lists.toggleItem(listId, itemId, isChecked)
  }

  const deleteItem = async (listId: string, itemId: string) => {
    await ApiClient.lists.removeItem(listId, itemId)
  }

  const applyTemplate = async (listId: string, templateIds: string[]) => {
    return await ApiClient.lists.applyTemplates(listId, templateIds)
  }

  const reorderLists = async (orderedIds: string[]) => {
    const orderMap = new Map(orderedIds.map((id, index) => [id, index]))
    items.value.sort((a, b) => {
      const indexA = orderMap.get(a.id) ?? Infinity
      const indexB = orderMap.get(b.id) ?? Infinity
      return indexA - indexB
    })

    return await ApiClient.lists.reorder(orderedIds)
  }

  return {
    items,
    isLoading,
    error,
    fetchLists,
    getListById,
    createList,
    updateList,
    deleteList,
    deleteLists,
    shareList,
    unshareList,
    fetchItems,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    applyTemplate,
    reorderLists
  }
})
