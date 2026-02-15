<script setup lang="ts">
import { Undo2, X } from "lucide-vue-next"
import { Button } from "@/components/ui/shadcn"

interface SnackbarState {
  show: boolean
  message: string
}

const props = defineProps<{
  state: SnackbarState
}>()

const emit = defineEmits<{
  (e: "undo"): void
  (e: "confirm"): void
  (e: "hide"): void
}>()

const handleConfirm = () => {
  emit("confirm")
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="props.state.show"
      class="fixed inset-x-3 bottom-4 z-50"
      role="status"
      aria-live="polite"
    >
      <div
        class="border-border bg-surface/80 text-foreground flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur"
      >
        <span class="text-sm font-medium">
          {{ props.state.message }}
        </span>

        <div class="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            class="text-primary"
            @click="emit('undo')"
          >
            <Undo2 class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            @click="handleConfirm"
          >
            <X class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>
