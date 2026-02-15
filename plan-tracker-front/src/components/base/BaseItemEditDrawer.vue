<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { Minus, Pencil, Plus } from "lucide-vue-next"
import { useCatalogStore } from "@/stores/catalog"
import UiDrawer from "@/components/ui/UiDrawer.vue"
import { Button, Input } from "@/components/ui/shadcn"

interface ItemData {
  id: string
  title: string
  quantity: number
  productId?: string | null
}

const props = defineProps<{
  modelValue: boolean
  item: ItemData | null
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "save", data: { quantity: number }): void
  (e: "edit-product", productId: string): void
}>()

const catalogStore = useCatalogStore()

const quantity = ref(1)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const product = computed(() => {
  if (!props.item?.productId) return null
  return catalogStore.products.find((p) => p.id === props.item!.productId)
})

const quantityUnit = computed(() => product.value?.quantityUnit)

const isQuantityDisabled = computed(() => {
  return !!product.value && quantityUnit.value === null
})

const quantityStep = computed(() => {
  if (!quantityUnit.value) return 1
  switch (quantityUnit.value) {
    case "ml":
      return 100
    case "g":
      return 50
    default:
      return 1
  }
})

const handleSubmit = () => {
  emit("save", {
    quantity: quantity.value
  })
}

const handleQuantityMinus = () => {
  // If unit is ml/g, we might want to go down by step, but min is usually 1 or step?
  // Let's say min is step.
  const step = quantityStep.value
  const newVal = quantity.value - step
  quantity.value = Math.max(step, newVal)
}

const handleQuantityPlus = () => {
  quantity.value += quantityStep.value
}

const handleEditProduct = () => {
  if (props.item?.productId) {
    emit("edit-product", props.item.productId)
  }
}

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      quantity.value = newItem.quantity || 1
    } else {
      quantity.value = 1
    }
  },
  { immediate: true }
)
</script>

<template>
  <UiDrawer
    v-model:visible="isOpen"
    :title="props.item?.title || ''"
  >
    <div class="grid gap-4 mt-2">
      <div class="grid gap-2">
        <label
          class="text-xs font-bold uppercase tracking-wider text-gray-400 px-1"
          for="quantity"
        >
          {{ $t("common.fields.quantity") }}
        </label>
        <div
          v-if="!isQuantityDisabled"
          class="flex items-center gap-3"
        >
          <Button
            variant="outline"
            size="icon"
            @click="handleQuantityMinus"
          >
            <Minus class="size-4" />
          </Button>

          <Input
            type="number"
            class="text-center"
            :model-value="quantity"
            id="quantity"
            @keydown.enter="handleSubmit"
            @update:model-value="(v: string | number) => (quantity = Number(v))"
          />

          <Button
            variant="outline"
            size="icon"
            @click="handleQuantityPlus"
          >
            <Plus class="size-4" />
          </Button>
        </div>
        <div
          v-else
          class="text-sm text-gray-500 italic pl-1"
        >
          {{ $t("common.fields.quantityDisabled") }}
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <Button
          v-if="props.item && props.item.productId"
          variant="outline"
          class="h-12 gap-2"
          @click="handleEditProduct"
        >
          <Pencil class="size-4" />
          {{ $t("common.actions.edit") }}
        </Button>

        <Button
          class="h-12"
          @click="handleSubmit"
        >
          {{ $t("common.actions.save") }}
        </Button>
      </div>
    </div>
  </UiDrawer>
</template>
