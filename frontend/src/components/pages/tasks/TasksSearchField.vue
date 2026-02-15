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

const handleUpdate = (value: string) => {
  emit("update:modelValue", value)
}
</script>

<template>
  <div class="relative mt-3">
    <Search class="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
    <Input
      :model-value="props.modelValue"
      :placeholder="props.placeholder"
      class="pl-9"
      @update:model-value="(v: string | number) => handleUpdate(String(v))"
    />
  </div>
</template>
