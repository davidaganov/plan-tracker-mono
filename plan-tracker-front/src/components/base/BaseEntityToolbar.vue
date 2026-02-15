<script setup lang="ts">
import { Plus } from "lucide-vue-next"
import { Button } from "@/components/ui/shadcn"

const props = withDefaults(
  defineProps<{
    showPrimaryButton?: boolean
    primaryButtonText?: string
    primaryButtonIcon?: string
  }>(),
  {
    showPrimaryButton: true,
    primaryButtonText: "Add",
    primaryButtonIcon: ""
  }
)

const emit = defineEmits<{
  (e: "primary-action"): void
}>()

const handlePrimaryAction = () => {
  emit("primary-action")
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-4 py-2 px-4 border-b border-border bg-surface-2/30"
  >
    <slot name="left" />

    <div class="flex items-center gap-2 ml-auto">
      <slot name="right" />

      <Button
        v-if="props.showPrimaryButton"
        size="sm"
        class="gap-2"
        @click="handlePrimaryAction"
      >
        <Plus class="size-4" />
        {{ props.primaryButtonText }}
      </Button>
    </div>
  </div>
</template>
