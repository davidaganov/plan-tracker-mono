import { ref } from "vue"

interface UseSwipeToCloseOptions {
  onClose: () => void
  threshold?: number
}

export function useSwipeToClose(options: UseSwipeToCloseOptions) {
  const { onClose, threshold = 100 } = options

  const isDragging = ref(false)
  const startY = ref(0)
  const currentY = ref(0)
  const translateY = ref(0)

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 0) return

    const touch = e.touches[0]
    if (!touch) return

    startY.value = touch.clientY
    currentY.value = touch.clientY
    isDragging.value = true
    translateY.value = 0
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.value || e.touches.length === 0) return

    const touch = e.touches[0]
    if (!touch) return

    currentY.value = touch.clientY
    const delta = Math.max(0, currentY.value - startY.value)
    translateY.value = delta
  }

  const handleTouchEnd = () => {
    if (!isDragging.value) return
    isDragging.value = false

    if (translateY.value > threshold) {
      onClose()
      // Reset logic handled by caller or component unmount usually,
      // but if not closing (e.g. cancelled), we need to animate back
    } else {
      // Reset
      translateY.value = 0
    }
  }

  // Mouse handlers (optional, for desktop testing often)
  const handleMouseDown = (e: MouseEvent) => {
    startY.value = e.clientY
    currentY.value = e.clientY
    isDragging.value = true
    translateY.value = 0

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.value) return
      const delta = Math.max(0, ev.clientY - startY.value)
      translateY.value = delta
    }

    const onMouseUp = () => {
      isDragging.value = false
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)

      if (translateY.value > threshold) {
        onClose()
      } else {
        translateY.value = 0
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  return {
    isDragging,
    translateY,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown
  }
}
