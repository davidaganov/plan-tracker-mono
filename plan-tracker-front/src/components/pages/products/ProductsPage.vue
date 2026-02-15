<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import ProductsToolbar from "@/components/pages/products/ProductsToolbar.vue"
import TabCatalog from "@/components/pages/products/tabs/TabCatalog.vue"
import TabLists from "@/components/pages/products/tabs/TabLists.vue"
import TabLocations from "@/components/pages/products/tabs/TabLocations.vue"
import TabTemplates from "@/components/pages/products/tabs/TabTemplates.vue"
import UiTabs from "@/components/ui/UiTabs.vue"
import { ENTITY_TAB_CONFIG, type EntityTabConfig } from "@plans-tracker/types"

interface TabRef {
  selectedIds: string[]
  selectAll: () => void
  deleteSelection: () => void
  openCreateDrawer?: () => void
}

const { t } = useI18n()

const tab = ref<EntityTabConfig["ENTITY_KEY"]>(ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY)
const isSelectionMode = ref(false)
const hasSelection = ref(false)

const listsTabRef = ref<TabRef>()
const catalogTabRef = ref<TabRef>()
const templatesTabRef = ref<TabRef>()
const locationsTabRef = ref<TabRef>()

const tabs = computed(() => [
  { value: ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY, titleKey: t("pages.products.tabs.lists") },
  { value: ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY, titleKey: t("pages.products.tabs.catalog") },
  { value: ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY, titleKey: t("pages.products.tabs.templates") },
  { value: ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY, titleKey: t("pages.products.tabs.locations") }
])

const getTabRef = (tabValue: EntityTabConfig["ENTITY_KEY"]): TabRef | undefined => {
  const refMap: Record<EntityTabConfig["ENTITY_KEY"], typeof listsTabRef> = {
    [ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY]: listsTabRef,
    [ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY]: catalogTabRef,
    [ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY]: templatesTabRef,
    [ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY]: locationsTabRef
  }

  return refMap[tabValue]?.value
}

const handleCreate = () => {
  const tabRef = getTabRef(tab.value)
  if (tabRef?.openCreateDrawer) {
    tabRef.openCreateDrawer()
  }
}

const handleDelete = () => {
  const tabRef = getTabRef(tab.value)
  if (tabRef?.deleteSelection) {
    tabRef.deleteSelection()
  }
  isSelectionMode.value = false
}

const handleSelectAll = () => {
  const tabRef = getTabRef(tab.value)
  tabRef?.selectAll()
}

const updateHasSelection = (value: boolean) => {
  hasSelection.value = value
}

watch(tab, () => {
  hasSelection.value = false
  isSelectionMode.value = false
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="max-w-container flex-none">
      <UiTabs
        v-model="tab"
        class="mb-2"
        :items="tabs"
      />

      <ProductsToolbar
        v-model="isSelectionMode"
        :has-selection="hasSelection"
        @select-all="handleSelectAll"
        @create="handleCreate"
        @delete="handleDelete"
      />
    </div>

    <div class="flex-1 h-full">
      <TabLists
        v-show="tab === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY"
        :is-active="tab === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY"
        :selection-mode="isSelectionMode"
        :ref="ENTITY_TAB_CONFIG.LISTS.REF_KEY"
        @update:has-selection="updateHasSelection"
      />

      <TabCatalog
        v-show="tab === ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY"
        :is-active="tab === ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY"
        :selection-mode="isSelectionMode"
        :ref="ENTITY_TAB_CONFIG.CATALOG.REF_KEY"
        @update:has-selection="updateHasSelection"
      />

      <TabTemplates
        v-show="tab === ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY"
        :is-active="tab === ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY"
        :selection-mode="isSelectionMode"
        :ref="ENTITY_TAB_CONFIG.TEMPLATES.REF_KEY"
        @update:has-selection="updateHasSelection"
      />

      <TabLocations
        v-show="tab === ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY"
        :is-active="tab === ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY"
        :selection-mode="isSelectionMode"
        :ref="ENTITY_TAB_CONFIG.LOCATIONS.REF_KEY"
        @update:has-selection="updateHasSelection"
      />
    </div>
  </div>
</template>
