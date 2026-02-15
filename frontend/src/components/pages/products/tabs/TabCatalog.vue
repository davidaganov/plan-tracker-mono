<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue"
import { useRouter } from "vue-router"
import { FilterX, Loader2, Package, RotateCcw } from "lucide-vue-next"
import { useCatalogStore } from "@/stores/catalog"
import { useLocationsStore } from "@/stores/locations"
import { useDeleteSnackbar } from "@/composables/useDeleteSnackbar"
import { useEntityTab } from "@/composables/useEntityTab"
import BaseEntityList from "@/components/base/BaseEntityList.vue"
import CatalogDrawer from "@/components/pages/products/catalog/CatalogDrawer.vue"
import UiDeleteSnackbar from "@/components/ui/UiDeleteSnackbar.vue"
import {
  Button,
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/shadcn"
import {
  PRICE_TYPE,
  SORT_ORDER,
  ENTITY_TAB_CONFIG,
  type ProductDto,
  type CreateProductDto,
  type UpdateProductDto
} from "@plans-tracker/types"

const props = defineProps<{
  selectionMode: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: "update:hasSelection", val: boolean): void
  (e: "delete", id: string): void
}>()

const router = useRouter()

const catalogStore = useCatalogStore()
const locationsStore = useLocationsStore()

const {
  selectedIds,
  items,
  hiddenIds,
  isCreateDrawerOpen,
  editingEntity,
  handleCreate,
  handleUpdate,
  handleEdit,
  softDelete,
  hardDelete,
  undoDelete,
  openCreateDrawer,
  selectAll
} = useEntityTab<ProductDto, CreateProductDto, UpdateProductDto>({
  router,
  routePrefix: ENTITY_TAB_CONFIG.CATALOG.ROUTE_PREFIX,
  adapter: {
    getItems: () => catalogStore.products ?? [],
    create: (data) => catalogStore.createProduct(data),
    update: (id, data) => catalogStore.updateProduct(id, data),
    deleteMany: (ids) => catalogStore.deleteProducts(ids),
    fetch: () => catalogStore.fetchProducts()
  }
})

const priceSort = ref<SORT_ORDER | null>(null)
const locationFilter = ref<string[]>([])
const isMounted = ref(false)

const locationOptions = computed(() => {
  return locationsStore.locations.map((loc) => ({
    label: loc.title,
    value: loc.id
  }))
})

const displayedProducts = computed(() => {
  let result = items.value.filter((p) => !hiddenIds.value.includes(p.id))

  // Filter by location
  if (locationFilter.value.length > 0) {
    result = result.filter((p) =>
      p.defaultLocationIds.some((locId) => locationFilter.value.includes(locId))
    )
  }

  // Sort by price
  if (priceSort.value) {
    result = [...result].sort((a, b) => {
      const priceA = a.defaultPriceType === PRICE_TYPE.NONE ? -1 : a.defaultPriceMin || 0
      const priceB = b.defaultPriceType === PRICE_TYPE.NONE ? -1 : b.defaultPriceMin || 0
      return priceSort.value === SORT_ORDER.ASC ? priceA - priceB : priceB - priceA
    })
  }

  return result
})

const { snackbar, showDeleteSnackbar, handleUndo, handleConfirm } = useDeleteSnackbar({
  timeout: 3000,
  onHardDelete: hardDelete
})

const isReorderable = computed(() => {
  return (
    displayedProducts.value.length === items.value.length &&
    !priceSort.value &&
    locationFilter.value.length === 0
  )
})

const handleReorder = async (ids: string[]) => {
  try {
    await catalogStore.reorderProducts(ids)
  } catch (e) {
    console.error("Failed to reorder products", e)
    await catalogStore.fetchProducts()
  }
}

const handleDeleteSelection = () => {
  const ids = [...selectedIds.value]
  softDelete(ids)
  showDeleteSnackbar(ids, ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY)
}

const handleClearFilters = () => {
  locationFilter.value = []
  priceSort.value = null
}

watch(
  selectedIds,
  (newVal) => {
    emit("update:hasSelection", newVal.length > 0)
  },
  { deep: true }
)

watch(
  () => props.selectionMode,
  (newVal) => {
    if (!newVal) selectedIds.value = []
  }
)

onMounted(() => {
  catalogStore.fetchProducts()
  locationsStore.fetchLocations()
  isMounted.value = true
})

defineExpose({
  selectedIds,
  openCreateDrawer,
  softDelete,
  hardDelete,
  undoDelete,
  selectAll,
  deleteSelection: handleDeleteSelection
})
</script>

<template>
  <div class="h-full flex flex-col">
    <Teleport
      v-if="props.isActive && isMounted"
      to="#product-toolbar-filters"
    >
      <div class="flex gap-2 items-center w-full">
        <div class="grid grid-flow-col auto-cols-fr gap-2 grow">
          <Select
            :model-value="priceSort ?? undefined"
            @update:model-value="(v) => (priceSort = v as SORT_ORDER | null)"
          >
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="$t('common.sort.label')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="SORT_ORDER.ASC">
                {{ $t("common.sort.priceAsc") }}
              </SelectItem>
              <SelectItem :value="SORT_ORDER.DESC">
                {{ $t("common.sort.priceDesc") }}
              </SelectItem>
            </SelectContent>
          </Select>

          <MultiSelect
            v-model="locationFilter"
            class-name="w-full"
            :options="locationOptions"
            :placeholder="$t('pages.products.filter.locations')"
            :search-placeholder="$t('common.actions.search')"
          />
        </div>

        <Button
          v-if="locationFilter.length > 0 || priceSort !== null"
          variant="ghost"
          size="icon"
          class="shrink-0"
          @click="handleClearFilters"
        >
          <RotateCcw class="size-4" />
        </Button>
      </div>
    </Teleport>

    <!-- Content -->
    <div class="flex-1 px-1">
      <div
        v-if="catalogStore.isLoading"
        class="flex justify-center p-8"
      >
        <Loader2 class="text-primary h-8 w-8 animate-spin" />
      </div>

      <div
        v-else-if="displayedProducts.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <template v-if="locationFilter.length > 0 || priceSort !== null">
          <FilterX class="text-muted-foreground mb-4 h-16 w-16" />
          <p class="text-muted-foreground text-center">
            {{ $t("common.messages.noFilterResults") }}
          </p>
          <Button
            variant="ghost"
            class="mt-2"
            @click="handleClearFilters"
          >
            {{ $t("common.actions.clearFilters") }}
          </Button>
        </template>
        <template v-else>
          <Package class="text-muted-foreground mb-4 h-16 w-16" />
          <p class="text-muted-foreground text-center">
            {{ $t("pages.products.items.catalog_empty") }}
          </p>
        </template>
      </div>

      <BaseEntityList
        v-else
        v-model:selected-ids="selectedIds"
        :entity-key="ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY"
        :entities="displayedProducts"
        :selection-mode="props.selectionMode"
        :reorderable="isReorderable"
        @edit="handleEdit"
        @reorder="handleReorder"
      />
    </div>

    <!-- Drawers -->
    <CatalogDrawer
      v-model="isCreateDrawerOpen"
      :product="editingEntity"
      @create="handleCreate"
      @update="handleUpdate"
    />

    <!-- Snackbar -->
    <UiDeleteSnackbar
      :state="snackbar"
      @undo="handleUndo(undoDelete)"
      @confirm="handleConfirm"
    />
  </div>
</template>
