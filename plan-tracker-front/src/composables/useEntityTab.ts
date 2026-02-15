import { ref, computed, watch, onMounted } from "vue"
import type { Ref, ComputedRef } from "vue"
import type { Router } from "vue-router"

interface EntityWithId {
  id: string
  tags?: string[] | null
}

/**
 * Adapter that defines entity-specific store operations.
 * Each entity tab provides its own adapter, eliminating internal switch/case logic.
 */
interface EntityStoreAdapter<T extends EntityWithId, TCreateData = unknown, TUpdateData = unknown> {
  /** Returns the reactive list of items from the store */
  getItems: () => T[]
  /** Creates a new entity in the store */
  create: (data: TCreateData) => void
  /** Updates an existing entity in the store */
  update: (id: string, data: TUpdateData) => void
  /** Deletes entities by their IDs */
  deleteMany: (ids: string[]) => Promise<void> | void
  /** Optional: fetches entities from the server on mount */
  fetch?: () => void
  /** Optional: validates data before create/update. Defaults to `() => true` */
  validate?: (data: TCreateData | TUpdateData) => boolean
}

interface UseEntityTabOptions<
  T extends EntityWithId,
  TCreateData = unknown,
  TUpdateData = unknown
> {
  router: Router
  routePrefix: string
  adapter: EntityStoreAdapter<T, TCreateData, TUpdateData>
  /**
   * If `true`, clicking an item navigates to its detail page.
   * If `false`, clicking opens the edit drawer instead.
   * @default false
   */
  navigableItems?: boolean
}

interface UseEntityTabReturn<T extends EntityWithId, TCreateData, TUpdateData> {
  selectedIds: Ref<string[]>
  selectedTags: Ref<string[]>
  hiddenIds: Ref<string[]>
  isCreateDrawerOpen: Ref<boolean>
  items: ComputedRef<T[]>
  filteredItems: ComputedRef<T[]>
  editingEntity: ComputedRef<T | null>
  allTags: ComputedRef<string[]>
  handleCreate: (data: TCreateData) => void
  handleUpdate: (id: string, data: TUpdateData) => void
  handleOpen: (id: string, selectionMode: boolean) => void
  handleEdit: (id: string) => void
  openCreateDrawer: () => void
  selectAll: () => void
  handleSelect: (id: string) => void
  softDelete: (ids: string[]) => void
  hardDelete: (ids: string[]) => Promise<void>
  undoDelete: (ids: string[]) => void
}

const DRAWER_CLOSE_DELAY_MS = 300

export const useEntityTab = <T extends EntityWithId, TCreateData = unknown, TUpdateData = unknown>(
  options: UseEntityTabOptions<T, TCreateData, TUpdateData>
): UseEntityTabReturn<T, TCreateData, TUpdateData> => {
  const { router, routePrefix, adapter, navigableItems = false } = options

  const selectedIds = ref<string[]>([]) as Ref<string[]>
  const hiddenIds = ref<string[]>([]) as Ref<string[]>
  const selectedTags = ref<string[]>([]) as Ref<string[]>
  const isCreateDrawerOpen = ref(false)
  const editingId = ref<string | null>(null)

  const items = computed((): T[] => adapter.getItems())

  const editingEntity = computed((): T | null => {
    if (!editingId.value) return null
    return items.value.find((item) => item.id === editingId.value) ?? null
  })

  const allTags = computed((): string[] => {
    const tagSet = new Set<string>()
    for (const item of items.value) {
      item.tags?.forEach((tag) => tagSet.add(tag))
    }
    return Array.from(tagSet).sort()
  })

  const filteredItems = computed((): T[] => {
    let result = items.value.filter((item) => !hiddenIds.value.includes(item.id))

    if (selectedTags.value.length > 0) {
      result = result.filter((item) => item.tags?.some((tag) => selectedTags.value.includes(tag)))
    }

    return result
  })

  const validate = adapter.validate ?? (() => true)

  const handleCreate = (data: TCreateData): void => {
    if (!validate(data)) return
    adapter.create(data)
    isCreateDrawerOpen.value = false
  }

  const handleUpdate = (id: string, data: TUpdateData): void => {
    if (!validate(data)) return
    adapter.update(id, data)
    isCreateDrawerOpen.value = false
  }

  const handleOpen = (id: string, selectionMode: boolean): void => {
    if (selectionMode) {
      handleSelect(id)
      return
    }

    if (navigableItems) {
      router.push(`${routePrefix}/${id}`)
    } else {
      handleEdit(id)
    }
  }

  const handleEdit = (id: string): void => {
    editingId.value = id
    isCreateDrawerOpen.value = true
  }

  const openCreateDrawer = (): void => {
    editingId.value = null
    isCreateDrawerOpen.value = true
  }

  const selectAll = (): void => {
    selectedIds.value = items.value.map((item) => item.id)
  }

  const handleSelect = (id: string): void => {
    const index = selectedIds.value.indexOf(id)
    if (index === -1) {
      selectedIds.value.push(id)
    } else {
      selectedIds.value.splice(index, 1)
    }
  }

  const softDelete = (ids: string[]): void => {
    hiddenIds.value.push(...ids)
    selectedIds.value = []
  }

  const hardDelete = async (ids: string[]): Promise<void> => {
    await adapter.deleteMany(ids)
    hiddenIds.value = hiddenIds.value.filter((id) => !ids.includes(id))
  }

  const undoDelete = (ids: string[]): void => {
    hiddenIds.value = hiddenIds.value.filter((id) => !ids.includes(id))
  }

  watch(isCreateDrawerOpen, (isOpen) => {
    if (!isOpen) {
      setTimeout(() => {
        editingId.value = null
      }, DRAWER_CLOSE_DELAY_MS)
    }
  })

  onMounted(() => {
    adapter.fetch?.()
  })

  return {
    selectedIds,
    selectedTags,
    hiddenIds,
    isCreateDrawerOpen,
    items,
    filteredItems,
    editingEntity,
    allTags,
    handleCreate,
    handleUpdate,
    handleOpen,
    handleEdit,
    openCreateDrawer,
    selectAll,
    handleSelect,
    softDelete,
    hardDelete,
    undoDelete
  }
}
