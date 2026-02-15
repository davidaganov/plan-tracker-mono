import { ref, computed, onMounted, type Ref } from "vue"
import { useSwipeToClose } from "@/composables/useSwipeToClose"
import { ENTITY_TAB_CONFIG, type BaseEntityDto, type EntityUpdateDto } from "@plans-tracker/types"

interface EntityDetailsStore<T, I extends BaseEntityDto> {
  getListById?: (id: string) => Promise<T | null>
  getTemplateById?: (id: string) => Promise<T | null>
  fetchItems?: (id: string) => Promise<I[]>
  addItem?: (listId: string, data: { productId: string; quantity: number }) => Promise<void>
  updateItem?: (listId: string, itemId: string, data: { quantity: number }) => Promise<void>
  deleteItem?: (listId: string, itemId: string) => Promise<void>
  toggleItem?: (listId: string, itemId: string, isChecked: boolean) => Promise<void>
  updateList?: (id: string, data: Partial<EntityUpdateDto>) => Promise<void>
  updateTemplate?: (id: string, data: Partial<EntityUpdateDto>) => Promise<void>
  applyTemplate?: (listId: string, templateIds: string[]) => Promise<void>
  addProductsToTemplate?: (templateId: string, productIds: string[]) => Promise<void>
  removeProductFromTemplate?: (templateId: string, itemId: string) => Promise<void>
  updateTemplateItem?: (
    templateId: string,
    itemId: string,
    data: { quantity: number }
  ) => Promise<void>
}

interface EntityWithItems<I> {
  items?: I[]
}

interface UseEntityDetailsPageOptions<T extends EntityWithItems<I>, I extends BaseEntityDto> {
  entityId: Ref<string>
  entityType:
    | typeof ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY
    | typeof ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY
  store: EntityDetailsStore<T, I>
  onClose: () => void
}

export const useEntityDetailsPage = <T extends EntityWithItems<I>, I extends BaseEntityDto>(
  options: UseEntityDetailsPageOptions<T, I>
) => {
  const { entityId, entityType, store, onClose } = options

  const entity = ref<T | null>(null)
  const items = ref<I[]>([])
  const isLoading = ref(true)
  const containerRef = ref<HTMLElement | null>(null)
  const isItemEditDrawerOpen = ref(false)
  const isAddProductsDrawerOpen = ref(false)
  const isEntityEditDrawerOpen = ref(false)
  const editingItem = ref<I | null>(null)

  const {
    translateY,
    isDragging,
    handleTouchStart: startSwipe,
    handleTouchMove,
    handleTouchEnd
  } = useSwipeToClose({ onClose })

  const containerStyle = computed(() => ({
    transform: translateY.value > 0 ? `translateY(${translateY.value}px)` : undefined,
    transition: isDragging.value ? "none" : "transform 0.3s ease",
    willChange: "transform"
  }))

  const loadEntity = async () => {
    isLoading.value = true
    try {
      let fetchedEntity: T | null = null

      if (entityType === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY && store.getListById) {
        fetchedEntity = await store.getListById(entityId.value)
      } else if (entityType === ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY && store.getTemplateById) {
        fetchedEntity = await store.getTemplateById(entityId.value)
      }

      if (fetchedEntity) {
        entity.value = fetchedEntity
        if (entityType === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY && store.fetchItems) {
          items.value = await store.fetchItems(entityId.value)
        } else if (entityType === ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY) {
          items.value = fetchedEntity.items || []
        }
      } else {
        onClose()
      }
    } catch (error) {
      console.error("Failed to load entity:", error)
      onClose()
    } finally {
      isLoading.value = false
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    const scrollContainer = containerRef.value?.querySelector(".overflow-y-auto")
    if (scrollContainer && scrollContainer.scrollTop > 0) return
    startSwipe(e)
  }

  const handleEditItem = (item: I) => {
    editingItem.value = item
    isItemEditDrawerOpen.value = true
  }

  const handleSaveItem = async (data: { quantity: number }) => {
    if (!editingItem.value) return

    if (entityType === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY && store.updateItem) {
      await store.updateItem(entityId.value, editingItem.value.id, data)
    } else if (entityType === ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY && store.updateTemplateItem) {
      await store.updateTemplateItem(entityId.value, editingItem.value.id, data)
    }

    await loadEntity()
    isItemEditDrawerOpen.value = false
  }

  const handleRemoveItem = async (itemId: string) => {
    if (entityType === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY && store.deleteItem) {
      await store.deleteItem(entityId.value, itemId)
    } else if (
      entityType === ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY &&
      store.removeProductFromTemplate
    ) {
      await store.removeProductFromTemplate(entityId.value, itemId)
    }
    await loadEntity()
  }

  const handleUpdateEntity = async (id: string, data: EntityUpdateDto) => {
    if (entityType === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY && store.updateList) {
      if (!data.name) return
      await store.updateList(id, { name: data.name, tags: data.tags, note: data.note })
    } else if (entityType === ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY && store.updateTemplate) {
      if (!data.title) return
      await store.updateTemplate(id, { title: data.title, tags: data.tags, note: data.note })
    }
    await loadEntity()
    isEntityEditDrawerOpen.value = false
  }

  const openEditDrawer = () => {
    isEntityEditDrawerOpen.value = true
  }

  const openAddProductsDrawer = () => {
    isAddProductsDrawerOpen.value = true
  }

  onMounted(() => {
    loadEntity()
  })

  return {
    entity,
    items,
    isLoading,
    containerRef,
    containerStyle,
    isItemEditDrawerOpen,
    isAddProductsDrawerOpen,
    isEntityEditDrawerOpen,
    editingItem,
    translateY,
    isDragging,
    loadEntity,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleEditItem,
    handleSaveItem,
    handleRemoveItem,
    handleUpdateEntity,
    openEditDrawer,
    openAddProductsDrawer
  }
}
