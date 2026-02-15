<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { VueDraggable } from "vue-draggable-plus"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import {
  CheckCheck,
  CheckSquare,
  FileText,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2
} from "lucide-vue-next"
import { useCatalogStore } from "@/stores/catalog"
import { useListsStore } from "@/stores/lists"
import { calculateListCost, getListItemPriceString } from "@/utils/price"
import BaseEntityDrawer from "@/components/base/BaseEntityDrawer.vue"
import BaseEntityHeader from "@/components/base/BaseEntityHeader.vue"
import BaseItemEditDrawer from "@/components/base/BaseItemEditDrawer.vue"
import BaseOverlayPage from "@/components/base/BaseOverlayPage.vue"
import BaseProductsAddDrawer from "@/components/base/BaseProductsAddDrawer.vue"
import CatalogDrawer from "@/components/pages/products/catalog/CatalogDrawer.vue"
import TemplateSelectorDrawer from "@/components/pages/products/templates/TemplateSelectorDrawer.vue"
import UiCard from "@/components/ui/UiCard.vue"
import UiFloatingFabActions from "@/components/ui/UiFloatingFabActions.vue"
import { Button, Checkbox } from "@/components/ui/shadcn"
import type { FabAction } from "@/types"
import type {
  CreateProductDto,
  ListDto,
  ProductDto,
  ShoppingItemDto,
  UpdateProductDto
} from "@plans-tracker/types"

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const listsStore = useListsStore()
const catalogStore = useCatalogStore()

const list = ref<ListDto | null>(null)
const items = ref<ShoppingItemDto[]>([])
const isLoading = ref(true)
const isTemplateSelectorOpen = ref(false)
const isItemEditDrawerOpen = ref(false)
const isAddProductsDrawerOpen = ref(false)
const isCatalogDrawerOpen = ref(false)
const isListEditDrawerOpen = ref(false)
const editingItem = ref<ShoppingItemDto | null>(null)
const editingProduct = ref<ProductDto | null>(null)
const addProductsDrawerRef = ref<InstanceType<typeof BaseProductsAddDrawer> | null>(null)
const isSelectionMode = ref(false)
const selectedIds = ref<string[]>([])

const onClose = () => router.back()

const mainFabAction = computed<FabAction>(() => {
  if (isSelectionMode.value) {
    return {
      key: "cancel",
      icon: Plus,
      label: t("common.actions.cancel"),
      onClick: () => (isSelectionMode.value = false),
      className: "rotate-45"
    }
  }

  return {
    key: "create",
    icon: Plus,
    label: t("common.actions.create"),
    onClick: () => (isAddProductsDrawerOpen.value = true)
  }
})

const fabActions = computed<FabAction[]>(() => {
  if (isSelectionMode.value) {
    return [
      {
        key: "select-all",
        icon: CheckCheck,
        label: t("common.actions.selectAll"),
        variant: "secondary",
        onClick: selectAll
      },
      {
        key: "delete",
        icon: Trash2,
        label: t("common.actions.delete"),
        variant: "destructive",
        disabled: !hasSelection.value,
        onClick: deleteSelection
      }
    ]
  }

  return [
    {
      key: "template",
      icon: FileText,
      label: t("pages.products.tabs.templates"),
      variant: "secondary",
      onClick: () => (isTemplateSelectorOpen.value = true)
    },
    {
      key: "select-mode",
      icon: CheckSquare,
      label: t("common.actions.select"),
      variant: "secondary",
      onClick: () => (isSelectionMode.value = true)
    }
  ]
})

const hasSelection = computed(() => selectedIds.value.length > 0)

const listId = computed(() => route.params.id as string)

const isDragEnabled = computed(() => {
  return list.value?.sortMode === "manual" || !list.value?.sortMode
})

const isDragAllowed = computed(() => isDragEnabled.value && isSelectionMode.value)

const excludeProductIds = computed(() =>
  items.value.map((i) => i.productId).filter((id): id is string => !!id)
)

const listCost = computed(() => {
  if (!items.value?.length) return null
  return calculateListCost(items.value, catalogStore.products)
})

const loadList = async () => {
  isLoading.value = true
  try {
    const fetchedList = await listsStore.getListById(listId.value)
    if (fetchedList) {
      list.value = fetchedList
      items.value = await listsStore.fetchItems(listId.value)
    } else {
      onClose()
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const getProductById = (productId?: string) => {
  if (!productId) return null
  return catalogStore.products.find((p) => p.id === productId)
}

const handleToggleItem = async (item: ShoppingItemDto) => {
  const originalState = item.isChecked
  item.isChecked = !item.isChecked
  try {
    await listsStore.toggleItem(listId.value, item.id, item.isChecked)
    items.value = await listsStore.fetchItems(listId.value)
  } catch (e) {
    item.isChecked = originalState
    console.error("Failed to toggle item:", e)
  }
}

const toggleSelection = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const selectAll = () => {
  selectedIds.value = items.value.map((i) => i.id)
}

const deleteSelection = async () => {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  try {
    await Promise.all(ids.map((id) => listsStore.deleteItem(listId.value, id)))
    items.value = items.value.filter((i) => !ids.includes(i.id))
  } catch (e) {
    console.error("Failed to delete selection", e)
    items.value = await listsStore.fetchItems(listId.value)
  } finally {
    selectedIds.value = []
    isSelectionMode.value = false
  }
}

const handleEditItem = (item: ShoppingItemDto) => {
  editingItem.value = item
  isItemEditDrawerOpen.value = true
}

const handleSaveItem = async (data: { quantity: number }) => {
  if (!editingItem.value) return
  await listsStore.updateItem(listId.value, editingItem.value.id, data)
  await loadList()
  isItemEditDrawerOpen.value = false
}

const handleAddProducts = async (productIds: string[]) => {
  try {
    const newItems = await Promise.all(
      productIds.map((pid) => listsStore.addItem(listId.value, { productId: pid, quantity: 1 }))
    )

    items.value.push(...newItems)
  } catch (e) {
    console.error("Failed to add items", e)
  } finally {
    isAddProductsDrawerOpen.value = false
  }
}

const handleCreateNewProduct = () => {
  editingProduct.value = null
  isCatalogDrawerOpen.value = true
}

const handleEditProduct = (productId: string) => {
  const product = catalogStore.products.find((p) => p.id === productId)
  if (product) {
    editingProduct.value = product
    isCatalogDrawerOpen.value = true
    isItemEditDrawerOpen.value = false
  }
}

const handleCatalogUpdate = async (id: string, data: UpdateProductDto) => {
  await catalogStore.updateProduct(id, data)
  isCatalogDrawerOpen.value = false
}

const handleCatalogCreate = async (data: CreateProductDto) => {
  const newProduct = await catalogStore.createProduct(data)

  if (addProductsDrawerRef.value) {
    addProductsDrawerRef.value.addProductToSelection(newProduct.id)
  }

  isCatalogDrawerOpen.value = false
}

const handleUpdateList = async (
  id: string,
  data: { name?: string; tags?: string[]; note?: string }
) => {
  if (!data.name) return
  await listsStore.updateList(id, { name: data.name, tags: data.tags, note: data.note })
  await loadList()
  isListEditDrawerOpen.value = false
}

const handleApplyTemplates = async (templateIds: string[]) => {
  await listsStore.applyTemplate(listId.value, templateIds)
  items.value = await listsStore.fetchItems(listId.value)
  isTemplateSelectorOpen.value = false
}

const onDragEnd = async () => {
  try {
    const updates = items.value.map((item, index) => {
      if (item.sortIndex !== index) {
        return listsStore.updateItem(listId.value, item.id, { sortIndex: index })
      }
      return Promise.resolve()
    })
    await Promise.all(updates)
  } catch (e) {
    console.error("Failed to reorder", e)
  }
}

watch(isSelectionMode, (val) => {
  if (!val) selectedIds.value = []
})

onMounted(() => {
  loadList()
  catalogStore.fetchProducts()
})
</script>

<template>
  <BaseOverlayPage :on-close="onClose">
    <BaseEntityHeader
      :title="list?.name || ''"
      :cost="listCost"
      @back="onClose"
      @edit="isListEditDrawerOpen = true"
    />

    <div class="flex-1 overflow-y-auto p-4">
      <div
        v-if="isLoading"
        class="flex justify-center py-8"
      >
        <Loader2 class="text-primary h-8 w-8 animate-spin" />
      </div>

      <div
        v-else-if="items.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <ShoppingCart class="text-muted-foreground mb-4 h-16 w-16" />
        <p class="text-muted-foreground text-center">{{ $t("common.lists.details.empty") }}</p>
      </div>

      <VueDraggable
        v-model="items"
        handle=".drag-handle"
        class="grid gap-3"
        :animation="150"
        :disabled="!isDragAllowed"
        @end="onDragEnd"
      >
        <UiCard
          v-for="item in items"
          class="transition-all"
          :class="{
            'opacity-50': item.isChecked,
            'ring-2 ring-primary': selectedIds.includes(item.id)
          }"
          :key="item.id"
        >
          <div
            class="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2"
            @click="isSelectionMode ? toggleSelection(item.id) : undefined"
          >
            <div
              v-if="isSelectionMode && isDragAllowed"
              class="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground mr-1"
            >
              <GripVertical class="size-4" />
            </div>
            <Checkbox
              class="size-5"
              :model-value="isSelectionMode ? selectedIds.includes(item.id) : item.isChecked"
              @click.stop
              @update:model-value="
                (v) => (isSelectionMode ? toggleSelection(item.id) : handleToggleItem(item))
              "
            />

            <div class="min-w-0 ml-2">
              <div class="font-bold text-base leading-tight mb-1">
                {{ item.title }}
              </div>
              <div class="text-sm text-muted-foreground">
                <div
                  v-if="!item.productId || getProductById(item.productId)?.quantityUnit !== null"
                >
                  {{ $t("common.fields.quantity") }}: {{ item.quantity }}
                </div>
                <div v-if="item.productId && getProductById(item.productId)">
                  <div v-if="getListItemPriceString(getProductById(item.productId)!)">
                    {{ $t("common.fields.price") }}:
                    {{ getListItemPriceString(getProductById(item.productId)!) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <template v-if="!isSelectionMode">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  @click.stop="handleEditItem(item)"
                >
                  <Pencil class="size-4" />
                </Button>
              </template>
            </div>
          </div>
        </UiCard>
      </VueDraggable>
    </div>

    <UiFloatingFabActions
      :main-action="mainFabAction"
      :actions="fabActions"
      :safe-area-inset-bottom="false"
      :teleport="false"
      :appear-delay-ms="300"
    />

    <TemplateSelectorDrawer
      v-model="isTemplateSelectorOpen"
      :list-id="listId"
      @apply="handleApplyTemplates"
    />

    <BaseItemEditDrawer
      v-model="isItemEditDrawerOpen"
      :item="editingItem"
      @save="handleSaveItem"
      @edit-product="handleEditProduct"
    />

    <BaseProductsAddDrawer
      v-model="isAddProductsDrawerOpen"
      :exclude-product-ids="excludeProductIds"
      ref="addProductsDrawerRef"
      @add="handleAddProducts"
      @create-new="handleCreateNewProduct"
    />

    <CatalogDrawer
      v-model="isCatalogDrawerOpen"
      :product="editingProduct"
      @update="handleCatalogUpdate"
      @create="handleCatalogCreate"
    />

    <BaseEntityDrawer
      v-model="isListEditDrawerOpen"
      title-field="name"
      :entity="list ? { ...list, tags: list.tags ?? undefined } : null"
      @update="handleUpdateList"
    />
  </BaseOverlayPage>
</template>
