<script setup lang="ts">
import { ref, computed, watch } from "vue"
import UiDrawer from "@/components/ui/UiDrawer.vue"
import { Button, Input, Textarea } from "@/components/ui/shadcn"
import type { LocationDto } from "@plans-tracker/types"

const props = defineProps<{
  modelValue: boolean
  location?: LocationDto | null
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "create", title: string, note?: string): void
  (e: "update", id: string, title: string, note?: string): void
}>()

const title = ref("")
const note = ref("")

const isEditMode = computed(() => !!props.location)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const handleSubmit = () => {
  if (!title.value.trim()) return
  if (isEditMode.value && props.location) {
    emit("update", props.location.id, title.value, note.value)
  } else {
    emit("create", title.value, note.value)
  }
  isOpen.value = false
  title.value = ""
  note.value = ""
}

watch(
  () => props.location,
  (newLoc) => {
    if (newLoc) {
      title.value = newLoc.title
      note.value = newLoc.note || ""
    } else {
      title.value = ""
      note.value = ""
    }
  },
  { immediate: true }
)

watch(isOpen, (val) => {
  if (!val && !props.location) {
    title.value = ""
    note.value = ""
  }
})
</script>

<template>
  <UiDrawer
    v-model:visible="isOpen"
    :title="isEditMode ? $t('common.actions.edit') : $t('common.actions.create')"
  >
    <div class="grid gap-2.5">
      <Input
        :model-value="title"
        :placeholder="$t('pages.products.create.locationPlaceholder')"
        @keydown.enter="handleSubmit"
        @update:model-value="(v: string | number) => (title = String(v))"
      />

      <Textarea
        rows="3"
        :model-value="note"
        :placeholder="$t('common.fields.note')"
        @update:model-value="(v: string | number) => (note = String(v))"
      />

      <Button
        class="mt-4 h-12 w-full"
        :disabled="!title.trim()"
        @click="handleSubmit"
      >
        {{ isEditMode ? $t("common.actions.save") : $t("common.actions.create") }}
      </Button>
    </div>
  </UiDrawer>
</template>
