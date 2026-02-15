<script setup lang="ts">
import { Search } from "lucide-vue-next"
import { Input } from "@/components/ui/shadcn"

const props = withDefaults(
  defineProps<{
    placeholder: string
    modelValue?: string
  }>(),
  {
    modelValue: ""
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const handleUpdate = (value: string | number) => {
  emit("update:modelValue", String(value))
}
</script>

<template>
  <div class="relative mt-3">
    <Search
      class="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
    />
    <Input
      class="pl-10"
      :placeholder="placeholder"
      :model-value="props.modelValue"
      @update:model-value="handleUpdate"
    />
  </div>
</template>
