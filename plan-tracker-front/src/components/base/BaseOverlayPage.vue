<script setup lang="ts">
import { computed, ref } from "vue"
import { useSwipeToClose } from "@/composables/useSwipeToClose"

const props = defineProps<{
  onClose: () => void
  threshold?: number
}>()

const containerRef = ref<HTMLElement | null>(null)

const {
  translateY,
  isDragging,
  handleTouchStart: startSwipe,
  handleTouchMove,
  handleTouchEnd
} = useSwipeToClose({
  onClose: props.onClose,
  threshold: props.threshold
})

const containerStyle = computed(() => ({
  transform: translateY.value > 0 ? `translateY(${translateY.value}px)` : undefined,
  transition: isDragging.value ? "none" : undefined
}))

const handleTouchStart = (e: TouchEvent) => {
  // Prevent swipe if scrolling content
  const scrollContainer = containerRef.value?.querySelector(".overflow-y-auto")
  if (scrollContainer && scrollContainer.scrollTop > 0) return
  startSwipe(e)
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="base-overlay-page h-full flex flex-col bg-background"
    :style="containerStyle"
    ref="containerRef"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <slot />
  </div>
</template>

<style scoped>
.base-overlay-page {
  transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
  will-change: transform;
}
</style>
