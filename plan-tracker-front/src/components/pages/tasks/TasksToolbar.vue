<script setup lang="ts">
import { Plus } from "lucide-vue-next"
import type { ListFilterValue } from "@/config/listFilters"
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/shadcn"

const props = defineProps<{
  modelValue: ListFilterValue
  items: Array<{ title: string; value: ListFilterValue }>
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: ListFilterValue): void
  (e: "create"): void
}>()

const handleCreate = () => {
  emit("create")
}

const handleUpdate = (value: ListFilterValue) => {
  emit("update:modelValue", value)
}
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="min-w-0 flex-1">
      <Select
        :model-value="props.modelValue"
        @update:model-value="(v) => handleUpdate(v as ListFilterValue)"
      >
        <SelectTrigger class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="item in props.items"
            :value="item.value"
            :key="item.value"
          >
            {{ item.title }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <Button
      size="icon"
      @click="handleCreate"
    >
      <Plus class="size-4" />
    </Button>
  </div>
</template>
