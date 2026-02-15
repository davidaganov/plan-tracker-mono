<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { FilterX, ListChecks, Loader2, RotateCcw } from "lucide-vue-next"
import { useListsStore } from "@/stores/lists"
import { useDeleteSnackbar } from "@/composables/useDeleteSnackbar"
import { useEntityTab } from "@/composables/useEntityTab"
import BaseEntityDrawer from "@/components/base/BaseEntityDrawer.vue"
import BaseEntityList from "@/components/base/BaseEntityList.vue"
import UiDeleteSnackbar from "@/components/ui/UiDeleteSnackbar.vue"
import { Button, MultiSelect } from "@/components/ui/shadcn"
import { ENTITY_TAB_CONFIG, type ListDto } from "@plans-tracker/types"

const props = defineProps<{
  selectionMode: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: "update:hasSelection", val: boolean): void
}>()

const router = useRouter()
const listsStore = useListsStore()

const isMounted = ref(false)

const {
  selectedIds,
  selectedTags,
  allTags,
  filteredItems,
  isCreateDrawerOpen,
  editingEntity,
  handleCreate,
  handleUpdate,
  handleOpen,
  softDelete,
  hardDelete,
  undoDelete,
  openCreateDrawer
} = useEntityTab<ListDto>({
  router,
  routePrefix: ENTITY_TAB_CONFIG.LISTS.ROUTE_PREFIX,
  navigableItems: true,
  adapter: {
    getItems: () => listsStore.items ?? [],
    create: (data) => {
      const { name, tags, note } = data as { name: string; tags?: string[]; note?: string | null }
      listsStore.createList(name, { tags, note: note ?? null })
    },
    update: (id, data) => {
      const { name, tags, note } = data as { name: string; tags?: string[]; note?: string | null }
      listsStore.updateList(id, { name, tags, note: note ?? null })
    },
    deleteMany: (ids) => listsStore.deleteLists(ids),
    fetch: () => listsStore.fetchLists(),
    validate: (data) => {
      const { name } = data as { name?: string }
      return typeof name === "string" && name.length > 0
    }
  }
})

const { snackbar, showDeleteSnackbar, handleUndo, handleConfirm } = useDeleteSnackbar({
  timeout: 3000,
  onHardDelete: hardDelete
})

const tagOptions = computed(() => {
  return allTags.value.map((tag) => ({
    label: tag,
    value: tag
  }))
})

const isReorderable = computed(() => {
  return filteredItems.value.length === listsStore.items.length && selectedTags.value.length === 0
})

const handleReorder = async (ids: string[]) => {
  try {
    await listsStore.reorderLists(ids)
  } catch (e) {
    console.error("Failed to reorder lists", e)
    await listsStore.fetchLists()
  }
}

const onSendList = (id: string) => {
  console.log("Send list", id)
}

const handleDeleteSelection = () => {
  const ids = [...selectedIds.value]
  softDelete(ids)
  showDeleteSnackbar(ids, ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY)
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
  isMounted.value = true
})

defineExpose({
  isReorderable,
  handleReorder,
  deleteSelection: handleDeleteSelection,
  openCreateDrawer
})
</script>

<template>
  <div class="h-full flex flex-col">
    <Teleport
      v-if="props.isActive && isMounted"
      to="#product-toolbar-filters"
      class="flex gap-2 items-center"
    >
      <MultiSelect
        v-model="selectedTags"
        class-name="w-full"
        :options="tagOptions"
        :placeholder="$t('pages.products.filter.tags')"
        :search-placeholder="$t('common.actions.search')"
      />
      <Button
        v-if="selectedTags.length > 0"
        variant="ghost"
        size="icon"
        class="shrink-0"
        @click="selectedTags = []"
      >
        <RotateCcw class="size-4" />
      </Button>
    </Teleport>

    <!-- Lists -->
    <div class="flex-1 overflow-y-auto pb-4 px-1">
      <div
        v-if="listsStore.isLoading"
        class="flex justify-center py-8"
      >
        <Loader2 class="text-primary h-8 w-8 animate-spin" />
      </div>

      <div
        v-else-if="filteredItems.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <template v-if="selectedTags.length > 0">
          <FilterX class="text-muted-foreground mb-4 h-16 w-16" />
          <p class="text-muted-foreground text-center">
            {{ $t("common.messages.noFilterResults") }}
          </p>
          <Button
            variant="ghost"
            class="mt-2"
            @click="selectedTags = []"
          >
            {{ $t("common.actions.clearFilters") }}
          </Button>
        </template>
        <template v-else>
          <ListChecks class="text-muted-foreground mb-4 h-16 w-16" />
          <p class="text-muted-foreground text-center">
            {{ $t("pages.products.items.lists_empty") }}
          </p>
        </template>
      </div>

      <BaseEntityList
        v-else
        show-scope
        :entity-key="ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY"
        :route-prefix="ENTITY_TAB_CONFIG.LISTS.ROUTE_PREFIX"
        :entities="filteredItems"
        :selection-mode="props.selectionMode"
        :selected-ids="selectedIds"
        :reorderable="isReorderable"
        @update:selected-ids="(ids: string[]) => (selectedIds = ids)"
        @open="(id: string) => handleOpen(id, props.selectionMode)"
        @send="onSendList"
        @reorder="handleReorder"
      />
    </div>

    <!-- Drawer -->
    <BaseEntityDrawer
      v-model="isCreateDrawerOpen"
      title-field="name"
      :entity="editingEntity"
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
