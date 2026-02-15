<script setup lang="ts">
import { watch, computed } from "vue"
import { useSwipeToClose } from "@/composables/useSwipeToClose"

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    maxHeight?: string
  }>(),
  {
    maxHeight: "85vh"
  }
)

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void
}>()

const handleClose = () => {
  emit("update:visible", false)
}

const {
  isDragging,
  translateY,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleMouseDown
} = useSwipeToClose({
  onClose: handleClose,
  threshold: 60
})

const drawerStyle = computed(() => ({
  maxHeight: props.maxHeight,
  transform: translateY.value > 0 ? `translateY(${translateY.value}px)` : undefined,
  willChange: "transform"
}))

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  },
  { immediate: true }
)
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-900"
      :class="{ 'pointer-events-none': !visible }"
    >
      <!-- Backdrop with fade animation -->
      <Transition name="fade">
        <div
          v-if="visible"
          class="absolute inset-0 bg-black/60 transition-opacity"
          @click="handleClose"
        />
      </Transition>

      <!-- Drawer with slide animation -->
      <Transition name="slide">
        <div
          v-if="visible"
          class="pt-drawer-content fixed inset-x-0 bottom-0 flex flex-col rounded-t-[20px] bg-surface shadow-2xl"
          :class="{ 'pt-drawer-content--dragging': isDragging }"
          :style="drawerStyle"
          @touchstart.stop
        >
          <!-- Handle/Drag area -->
          <div
            class="flex w-full cursor-grab justify-center py-3 select-none touch-none"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseDown"
          >
            <div class="h-1.5 w-12 rounded-full bg-border" />
          </div>

          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between px-4 pb-2 select-none"
          >
            <h2
              v-if="title"
              class="text-lg font-semibold"
            >
              {{ title }}
            </h2>
            <slot name="header" />
          </div>

          <!-- Content (scrollable) -->
          <div class="flex-1 overflow-y-auto pt-2 px-4 pb-8">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="border-t border-border px-4 py-4 mt-auto"
          >
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
/* Backdrop Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Drawer Transitions */
.pt-drawer-content {
  /* Default transition for all movements (opening/closing/snapping back after small drag) */
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.pt-drawer-content--dragging {
  /* Disable transition while the user is actively dragging */
  transition: none !important;
}

.slide-enter-active,
.slide-leave-active {
  /* Force the transition during mount/unmount */
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.slide-enter-from,
.slide-leave-to {
  /* Initial/Final state for slide animation */
  transform: translateY(100%) !important;
}
</style>
