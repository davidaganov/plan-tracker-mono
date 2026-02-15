<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { Plus } from "lucide-vue-next"
import { useCatalogStore } from "@/stores/catalog"
import UiDrawer from "@/components/ui/UiDrawer.vue"
import { Button, MultiSelect } from "@/components/ui/shadcn"

const props = defineProps<{
  modelValue: boolean
  excludeProductIds?: string[]
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "add", productIds: string[]): void
  (e: "create-new"): void
}>()

const catalogStore = useCatalogStore()

const selectedProductIds = ref<string[]>([])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const availableProducts = computed(() => {
  const excludeIds = new Set(props.excludeProductIds || [])
  return catalogStore.products
    .filter((p) => !excludeIds.has(p.id))
    .map((p) => ({
      label: p.title,
      value: p.id
    }))
})

const handleAdd = () => {
  if (selectedProductIds.value.length === 0) return
  emit("add", selectedProductIds.value)
  selectedProductIds.value = []
  isOpen.value = false
}

const handleCreateNew = () => {
  emit("create-new")
}

const addProductToSelection = (productId: string) => {
  if (!selectedProductIds.value.includes(productId)) {
    selectedProductIds.value.push(productId)
  }
}

watch(isOpen, (newVal) => {
  if (!newVal) {
    selectedProductIds.value = []
  }
})

defineExpose({
  addProductToSelection
})
</script>

<template>
  <UiDrawer
    v-model:visible="isOpen"
    :title="$t('pages.products.addProduct')"
  >
    <div class="grid gap-2 mt-2">
      <MultiSelect
        v-model="selectedProductIds"
        :options="availableProducts"
        :placeholder="$t('pages.products.create.selectProducts')"
        :search-placeholder="$t('common.actions.search')"
      />

      <Button
        variant="outline"
        class="h-12 w-full gap-2"
        @click="handleCreateNew"
      >
        <Plus class="size-4" />
        {{ $t("pages.products.newProduct") }}
      </Button>

      <Button
        class="mt-4 h-12 w-full"
        :disabled="selectedProductIds.length === 0"
        @click="handleAdd"
      >
        {{ $t("common.actions.add") }}
        <span
          v-if="selectedProductIds.length > 0"
          class="ml-1"
        >
          ({{ selectedProductIds.length }})
        </span>
      </Button>
    </div>
  </UiDrawer>
</template>
