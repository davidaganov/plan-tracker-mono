<script setup lang="ts">
import { onMounted, watch, computed } from "vue"
import { useRouter } from "vue-router"
import { Loader2, MapPin } from "lucide-vue-next"
import { useLocationsStore } from "@/stores/locations"
import { useDeleteSnackbar } from "@/composables/useDeleteSnackbar"
import { useEntityTab } from "@/composables/useEntityTab"
import BaseEntityList from "@/components/base/BaseEntityList.vue"
import LocationDrawer from "@/components/pages/products/locations/LocationDrawer.vue"
import UiDeleteSnackbar from "@/components/ui/UiDeleteSnackbar.vue"
import { ENTITY_TAB_CONFIG, type LocationDto } from "@plans-tracker/types"

const props = defineProps<{
  selectionMode: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: "update:hasSelection", val: boolean): void
  (e: "delete", id: string): void
}>()

const router = useRouter()
const locationsStore = useLocationsStore()

const {
  selectedIds,
  filteredItems,
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
} = useEntityTab<LocationDto>({
  router,
  routePrefix: ENTITY_TAB_CONFIG.LOCATIONS.ROUTE_PREFIX,
  adapter: {
    getItems: () => locationsStore.locations ?? [],
    create: (data) => {
      const { title, note } = data as { title: string; note?: string }
      locationsStore.createLocation(title, note)
    },
    update: (id, data) => {
      const { title, note } = data as { title: string; note?: string }
      locationsStore.updateLocation(id, title, note)
    },
    deleteMany: (ids) => locationsStore.deleteLocations(ids),
    fetch: () => locationsStore.fetchLocations(),
    validate: (data) => {
      const { title } = data as { title?: string }
      return typeof title === "string" && title.length > 0
    }
  }
})

const { snackbar, showDeleteSnackbar, handleUndo, handleConfirm } = useDeleteSnackbar({
  timeout: 3000,
  onHardDelete: hardDelete
})

const isReorderable = computed(() => {
  return filteredItems.value.length === locationsStore.locations.length
})

const handleReorder = async (ids: string[]) => {
  try {
    await locationsStore.reorderLocations(ids)
  } catch (e) {
    console.error("Failed to reorder locations", e)
    await locationsStore.fetchLocations()
  }
}

const handleDeleteSelection = () => {
  const ids = [...selectedIds.value]
  softDelete(ids)
  showDeleteSnackbar(ids, ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY)
}

const handleCreateLocation = (title: string, note?: string) => {
  handleCreate({ title, note })
}

const handleUpdateLocation = (id: string, title: string, note?: string) => {
  handleUpdate(id, { title, note })
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
  locationsStore.fetchLocations()
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
    <!-- Content -->
    <div class="flex-1 px-1">
      <div
        v-if="locationsStore.isLoading"
        class="flex justify-center p-8"
      >
        <Loader2 class="text-primary h-8 w-8 animate-spin" />
      </div>

      <div
        v-else-if="filteredItems.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <MapPin class="text-muted-foreground mb-4 h-16 w-16" />
        <p class="text-muted-foreground text-center">
          {{ $t("pages.products.items.locations_empty") }}
        </p>
      </div>

      <BaseEntityList
        v-else
        v-model:selected-ids="selectedIds"
        :entity-key="ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY"
        :entities="filteredItems"
        :selection-mode="props.selectionMode"
        :reorderable="isReorderable"
        @edit="handleEdit"
        @reorder="handleReorder"
      />
    </div>

    <!-- Drawers -->
    <LocationDrawer
      v-model="isCreateDrawerOpen"
      :location="editingEntity"
      @create="handleCreateLocation"
      @update="handleUpdateLocation"
    />

    <!-- Snackbar -->
    <UiDeleteSnackbar
      :state="snackbar"
      @undo="handleUndo(undoDelete)"
      @confirm="handleConfirm"
    />
  </div>
</template>
