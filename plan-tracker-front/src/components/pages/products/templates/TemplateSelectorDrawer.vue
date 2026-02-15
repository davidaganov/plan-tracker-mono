<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useTemplatesStore } from "@/stores/templates"
import UiDrawer from "@/components/ui/UiDrawer.vue"
import { Button, Checkbox } from "@/components/ui/shadcn"

const props = defineProps<{
  modelValue: boolean
  listId: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "apply", templateIds: string[]): void
}>()

const templatesStore = useTemplatesStore()

const selectedTemplateIds = ref<string[]>([])

const templates = computed(() => templatesStore.templates)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const toggleSelection = (id: string) => {
  if (selectedTemplateIds.value.includes(id)) {
    selectedTemplateIds.value = selectedTemplateIds.value.filter((i) => i !== id)
  } else {
    selectedTemplateIds.value.push(id)
  }
}

const handleApply = () => {
  emit("apply", selectedTemplateIds.value)
  selectedTemplateIds.value = []
}

onMounted(() => {
  if (templatesStore.templates.length === 0) {
    templatesStore.fetchTemplates()
  }
})
</script>

<template>
  <UiDrawer
    v-model:visible="isOpen"
    :title="$t('common.lists.templates.selectTitle')"
  >
    <div
      v-if="templates.length === 0"
      class="text-center py-8 text-muted-foreground"
    >
      {{ $t("common.lists.templates.noTemplates") }}
    </div>

    <div
      v-else
      class="grid gap-2"
    >
      <div
        v-for="template in templates"
        class="flex gap-3 p-3 rounded-lg border border-border cursor-pointer transition-colors hover:bg-surface-2"
        :class="{ 'border-primary bg-primary/5': selectedTemplateIds.includes(template.id) }"
        :key="template.id"
        @click="toggleSelection(template.id)"
      >
        <Checkbox
          class="flex-none"
          :model-value="selectedTemplateIds.includes(template.id)"
          @click.stop="toggleSelection(template.id)"
        />
        <div class="flex-1">
          <div class="font-medium">{{ template.title }}</div>
          <div class="text-xs text-muted-foreground">
            {{ template.items.length }} {{ $t("pages.products.items.itemsCount") }}
          </div>
        </div>
      </div>
    </div>

    <Button
      class="mt-4 h-12 w-full"
      :disabled="selectedTemplateIds.length === 0"
      @click="handleApply"
    >
      {{ $t("common.lists.templates.apply") }}
    </Button>
  </UiDrawer>
</template>
