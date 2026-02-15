<script setup lang="ts" generic="T extends { id: string }">
import { computed } from "vue"
import { VueDraggable } from "vue-draggable-plus"

const props = defineProps<{
  modelValue: T[]
  disabled?: boolean
  handle?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: T[]): void
  (e: "end", event: any): void
}>()

const list = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})
</script>

<template>
  <VueDraggable
    v-model="list"
    class="flex flex-col gap-2"
    :disabled="disabled"
    :animation="150"
    :handle="handle || '.drag-handle'"
    @end="(e) => emit('end', e)"
  >
    <slot />
  </VueDraggable>
</template>
