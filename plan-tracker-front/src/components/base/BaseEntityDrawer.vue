<script setup lang="ts">
import { ref, computed, watch } from "vue"
import UiDrawer from "@/components/ui/UiDrawer.vue"
import { Button, Input, Textarea } from "@/components/ui/shadcn"

interface EntityData {
  id?: string
  name?: string
  title?: string
  tags?: string[] | null
  note?: string | null
}

const props = defineProps<{
  modelValue: boolean
  entity?: EntityData | null
  titleField: "name" | "title"
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "create", data: { name?: string; title?: string; tags?: string[]; note?: string }): void
  (
    e: "update",
    id: string,
    data: { name?: string; title?: string; tags?: string[]; note?: string }
  ): void
}>()

const form = ref({
  titleValue: "",
  tags: [] as string[],
  note: ""
})

const isEditMode = computed(() => !!props.entity)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const titleLabel = computed(() => {
  return props.titleField === "name"
    ? "common.lists.create.namePlaceholder"
    : "pages.products.create.templateName"
})

const handleTagInput = (e: KeyboardEvent) => {
  if (e.key !== "Enter") return
  const target = e.target as HTMLInputElement
  const val = target.value.trim()
  if (val && !form.value.tags.includes(val)) {
    form.value.tags.push(val)
    target.value = ""
  }
}

const handleSubmit = () => {
  if (!form.value.titleValue.trim()) return

  const data = {
    [props.titleField]: form.value.titleValue,
    tags: form.value.tags,
    note: form.value.note
  }

  if (isEditMode.value && props.entity?.id) {
    emit("update", props.entity.id, data)
  } else {
    emit("create", data)
  }
  isOpen.value = false
}

watch(
  () => props.entity,
  (newEntity) => {
    if (newEntity) {
      form.value = {
        titleValue: newEntity[props.titleField] || "",
        tags: newEntity.tags ?? [],
        note: newEntity.note || ""
      }
    } else {
      form.value = { titleValue: "", tags: [], note: "" }
    }
  },
  { immediate: true }
)

watch(isOpen, (val) => {
  if (!val && !props.entity) {
    form.value = { titleValue: "", tags: [], note: "" }
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
        :model-value="form.titleValue"
        :placeholder="$t(titleLabel)"
        @keydown.enter="handleSubmit"
        @update:model-value="(v: string | number) => (form.titleValue = String(v))"
      />

      <div class="grid gap-1">
        <div class="text-sm font-medium">
          {{ $t("pages.products.create.tagsLabel") }}
        </div>
        <div class="flex flex-wrap gap-1">
          <div
            v-for="(tag, index) in form.tags"
            class="bg-primary/15 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
            :key="tag"
          >
            {{ tag }}
            <Button
              class="hover:text-primary/70 ml-1"
              @click="form.tags.splice(index, 1)"
            >
              ×
            </Button>
          </div>
        </div>
        <Input
          :model-value="''"
          :placeholder="$t('pages.products.create.tagsPlaceholder')"
          @keydown.enter="handleTagInput"
        />
      </div>

      <Textarea
        :model-value="form.note"
        :placeholder="$t('common.fields.note')"
        rows="3"
        @update:model-value="(v: string | number) => (form.note = String(v))"
      />

      <Button
        class="mt-4 h-12 w-full"
        :disabled="!form.titleValue.trim()"
        @click="handleSubmit"
      >
        {{ isEditMode ? $t("common.actions.save") : $t("common.actions.create") }}
      </Button>
    </div>
  </UiDrawer>
</template>
