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
  Trash2
} from "lucide-vue-next"
import { useCatalogStore } from "@/stores/catalog"
import { useTemplatesStore } from "@/stores/templates"
import { calculateTemplateCost, getItemPriceString } from "@/utils/price"
import BaseEntityDrawer from "@/components/base/BaseEntityDrawer.vue"
import BaseEntityHeader from "@/components/base/BaseEntityHeader.vue"
import BaseItemEditDrawer from "@/components/base/BaseItemEditDrawer.vue"
import BaseOverlayPage from "@/components/base/BaseOverlayPage.vue"
import BaseProductsAddDrawer from "@/components/base/BaseProductsAddDrawer.vue"
import CatalogDrawer from "@/components/pages/products/catalog/CatalogDrawer.vue"
import UiCard from "@/components/ui/UiCard.vue"
import UiFloatingFabActions from "@/components/ui/UiFloatingFabActions.vue"
import { Button, Checkbox } from "@/components/ui/shadcn"
import type { FabAction } from "@/types"
import type {
  CreateProductDto,
  ProductDto,
  TemplateDto,
  TemplateItemDto,
  UpdateProductDto,
  UpdateTemplateItemDto
} from "@plans-tracker/types"

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const templatesStore = useTemplatesStore()
const catalogStore = useCatalogStore()

const template = ref<TemplateDto | null>(null)
const isLoading = ref(true)
const isAddProductsDrawerOpen = ref(false)
const isCatalogDrawerOpen = ref(false)
const isEditDrawerOpen = ref(false)
const isEditItemDrawerOpen = ref(false)
const editingItem = ref<TemplateItemDto | null>(null)
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
      key: "select-mode",
      icon: CheckSquare,
      label: t("common.actions.select"),
      variant: "secondary",
      onClick: () => (isSelectionMode.value = true)
    }
  ]
})

const templateId = computed(() => route.params.id as string)
const hasSelection = computed(() => selectedIds.value.length > 0)

const excludeProductIds = computed(() =>
  (template.value?.items || []).map((i) => i.productId).filter((id): id is string => !!id)
)

const templateCost = computed(() => {
  if (!template.value?.items?.length) return null
  return calculateTemplateCost(template.value.items)
})

const toggleSelection = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const selectAll = () => {
  selectedIds.value = (template.value?.items || []).map((i) => i.id)
}

const deleteSelection = async () => {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  try {
    await Promise.all(
      ids.map((id) => templatesStore.removeProductFromTemplate(templateId.value, id))
    )
    const updated = await templatesStore.getTemplateById(templateId.value)
    if (updated) template.value = updated
  } catch (e) {
    console.error("Failed to delete selection", e)
    await loadTemplate()
  } finally {
    selectedIds.value = []
    isSelectionMode.value = false
  }
}

const loadTemplate = async () => {
  isLoading.value = true
  try {
    const fetchedTemplate = await templatesStore.getTemplateById(templateId.value)
    if (fetchedTemplate) {
      template.value = fetchedTemplate
    } else {
      onClose()
    }
  } catch (e) {
    console.error("Failed to load template:", e)
  } finally {
    isLoading.value = false
  }
}

const handleUpdate = async (
  id: string,
  data: { title?: string; tags?: string[]; note?: string }
) => {
  if (!data.title) return
  await templatesStore.updateTemplate(id, { title: data.title, tags: data.tags, note: data.note })
  await loadTemplate()
  isEditDrawerOpen.value = false
}

const handleAddProducts = async (productIds: string[]) => {
  try {
    await templatesStore.addProductsToTemplate(templateId.value, productIds)
    const updated = await templatesStore.getTemplateById(templateId.value)
    if (updated) template.value = updated
  } catch (e) {
    console.error("Failed to add products to template:", e)
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
    isEditItemDrawerOpen.value = false
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

const handleEditItem = (item: TemplateItemDto) => {
  editingItem.value = item
  isEditItemDrawerOpen.value = true
}

const handleSaveItem = async (data: { quantity: number }) => {
  if (!editingItem.value) return
  await templatesStore.updateTemplateItem(templateId.value, editingItem.value.id, data)
  const updated = await templatesStore.getTemplateById(templateId.value)
  if (updated) template.value = updated

  isEditItemDrawerOpen.value = false
}

const onDragEnd = async () => {
  try {
    const templateIdVal = templateId.value
    const updates = (template.value?.items || []).map((item, index) => {
      if (item.sortIndex !== index) {
        item.sortIndex = index
        return templatesStore.updateTemplateItem(templateIdVal, item.id, {
          sortIndex: index
        } satisfies UpdateTemplateItemDto)
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
  loadTemplate()
  catalogStore.fetchProducts()
})
</script>

<template>
  <BaseOverlayPage :on-close="onClose">
    <BaseEntityHeader
      :title="template?.title || ''"
      :cost="templateCost"
      @back="onClose"
      @edit="isEditDrawerOpen = true"
    />

    <div class="flex-1 overflow-y-auto p-4">
      <div
        v-if="isLoading"
        class="flex justify-center py-8"
      >
        <Loader2 class="text-primary h-8 w-8 animate-spin" />
      </div>

      <div
        v-else-if="!template?.items || template.items.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <FileText class="text-muted-foreground mb-4 h-16 w-16" />
        <p class="text-muted-foreground text-center">
          {{ $t("common.lists.templates.templateEmpty") }}
        </p>
      </div>

      <div
        v-else
        class="grid gap-3"
      >
        <VueDraggable
          v-if="template?.items"
          v-model="template.items"
          :animation="150"
          handle=".drag-handle"
          class="grid gap-3"
          :disabled="!isSelectionMode"
          @end="onDragEnd"
        >
          <UiCard
            v-for="item in template.items"
            :class="{ 'ring-2 ring-primary': selectedIds.includes(item.id) }"
            :key="item.id"
          >
            <div
              class="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2"
              @click="isSelectionMode ? toggleSelection(item.id) : undefined"
            >
              <div
                v-if="isSelectionMode"
                class="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground mr-1"
              >
                <GripVertical class="size-4" />
              </div>

              <div class="flex items-center justify-center w-5 shrink-0">
                <Checkbox
                  v-if="isSelectionMode"
                  class="size-5"
                  :model-value="selectedIds.includes(item.id)"
                  @click.stop
                  @update:model-value="() => toggleSelection(item.id)"
                />
              </div>

              <div class="min-w-0">
                <div class="font-bold text-base leading-tight mb-1">
                  {{ item.title }}
                </div>
                <div class="text-sm text-muted-foreground">
                  <div
                    v-if="
                      !item.productId ||
                      catalogStore.products.find((p) => p.id === item.productId)?.quantityUnit !==
                        null
                    "
                  >
                    {{ $t("common.fields.quantity") }}: {{ item.quantity }}
                  </div>
                  <div v-if="getItemPriceString(item)">
                    {{ $t("common.fields.price") }}: {{ getItemPriceString(item) }}
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
    </div>

    <UiFloatingFabActions
      :main-action="mainFabAction"
      :actions="fabActions"
      :safe-area-inset-bottom="false"
      :teleport="false"
      :appear-delay-ms="300"
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
      v-model="isEditDrawerOpen"
      title-field="title"
      :entity="template"
      @update="handleUpdate"
    />

    <BaseItemEditDrawer
      v-model="isEditItemDrawerOpen"
      :item="editingItem"
      @save="handleSaveItem"
      @edit-product="handleEditProduct"
    />
  </BaseOverlayPage>
</template>
