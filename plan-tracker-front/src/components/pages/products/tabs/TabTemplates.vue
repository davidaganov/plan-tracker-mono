<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { FileText, FilterX, Loader2, RotateCcw } from "lucide-vue-next"
import { useTemplatesStore } from "@/stores/templates"
import { useDeleteSnackbar } from "@/composables/useDeleteSnackbar"
import { useEntityTab } from "@/composables/useEntityTab"
import BaseEntityDrawer from "@/components/base/BaseEntityDrawer.vue"
import BaseEntityList from "@/components/base/BaseEntityList.vue"
import UiDeleteSnackbar from "@/components/ui/UiDeleteSnackbar.vue"
import { Button, MultiSelect } from "@/components/ui/shadcn"
import { ENTITY_TAB_CONFIG, type TemplateDto } from "@plans-tracker/types"

const props = defineProps<{
  selectionMode: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: "update:hasSelection", val: boolean): void
}>()

const router = useRouter()
const templatesStore = useTemplatesStore()

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
  openCreateDrawer,
  selectAll
} = useEntityTab<TemplateDto>({
  router,
  routePrefix: ENTITY_TAB_CONFIG.TEMPLATES.ROUTE_PREFIX,
  navigableItems: true,
  adapter: {
    getItems: () => templatesStore.templates ?? [],
    create: (data) => {
      const { title, tags, note } = data as { title: string; tags?: string[]; note?: string | null }
      templatesStore.createTemplate({ title, tags, note: note ?? undefined })
    },
    update: (id, data) => {
      const { title, tags, note } = data as { title: string; tags?: string[]; note?: string | null }
      templatesStore.updateTemplate(id, { title, tags, note: note ?? undefined })
    },
    deleteMany: (ids) => templatesStore.deleteTemplates(ids),
    fetch: () => templatesStore.fetchTemplates(),
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

const tagOptions = computed(() => {
  return allTags.value.map((tag) => ({
    label: tag,
    value: tag
  }))
})

const isReorderable = computed(() => {
  return (
    filteredItems.value.length === templatesStore.templates.length &&
    selectedTags.value.length === 0
  )
})

const handleReorder = async (ids: string[]) => {
  try {
    await templatesStore.reorderTemplates(ids)
  } catch (e) {
    console.error("Failed to reorder templates", e)
    await templatesStore.fetchTemplates()
  }
}

const handleSingleDelete = (id: string) => {
  softDelete([id])
  showDeleteSnackbar([id], ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY)
}

const handleDeleteSelection = () => {
  const ids = [...selectedIds.value]
  softDelete(ids)
  showDeleteSnackbar(ids, ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY)
}

const handleUndoDelete = () => {
  handleUndo(undoDelete)
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
  selectAll,
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

    <!-- Templates -->
    <div class="flex-1 overflow-y-auto px-1 pb-4">
      <div
        v-if="templatesStore.isLoading"
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
          <FileText class="text-muted-foreground mb-4 h-16 w-16" />
          <p class="text-muted-foreground text-center">
            {{ $t("pages.products.items.templates_empty") }}
          </p>
        </template>
      </div>

      <BaseEntityList
        v-else
        show-cost
        :entity-key="ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY"
        :route-prefix="ENTITY_TAB_CONFIG.TEMPLATES.ROUTE_PREFIX"
        :entities="filteredItems"
        :selection-mode="props.selectionMode"
        :selected-ids="selectedIds"
        :reorderable="isReorderable"
        @update:selected-ids="(ids: string[]) => (selectedIds = ids)"
        @open="(id: string) => handleOpen(id, props.selectionMode)"
        @delete="handleSingleDelete"
        @reorder="handleReorder"
      />
    </div>

    <BaseEntityDrawer
      v-model="isCreateDrawerOpen"
      title-field="title"
      :entity="editingEntity"
      @create="handleCreate"
      @update="handleUpdate"
    />

    <UiDeleteSnackbar
      :state="snackbar"
      @undo="handleUndoDelete"
      @confirm="handleConfirm"
    />
  </div>
</template>
