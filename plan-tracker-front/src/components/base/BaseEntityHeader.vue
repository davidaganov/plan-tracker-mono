<script setup lang="ts">
import { ArrowLeft, Pencil } from "lucide-vue-next"
import { Button } from "@/components/ui/shadcn"

const props = withDefaults(
  defineProps<{
    title: string
    cost?: string | null
    showBackButton?: boolean
    showEditButton?: boolean
  }>(),
  {
    showBackButton: true,
    showEditButton: true
  }
)

const emit = defineEmits<{
  (e: "back"): void
  (e: "edit"): void
}>()

const handleBack = () => {
  emit("back")
}

const handleEdit = () => {
  emit("edit")
}
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-3 border-b border-border">
    <Button
      v-if="props.showBackButton"
      variant="ghost"
      size="icon-sm"
      @click="handleBack"
    >
      <ArrowLeft class="size-4" />
    </Button>

    <div class="flex-1 min-w-0">
      <h1 class="text-xl font-bold truncate leading-tight">
        {{ props.title }}
      </h1>
      <p
        v-if="props.cost"
        class="text-sm text-primary font-medium"
      >
        {{ props.cost }}
      </p>
    </div>

    <Button
      v-if="props.showEditButton"
      variant="ghost"
      size="icon-sm"
      class="text-primary"
      @click="handleEdit"
    >
      <Pencil class="size-4" />
    </Button>
  </div>
</template>
