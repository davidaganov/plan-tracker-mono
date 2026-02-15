<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch, type Component } from "vue"

type Item = {
  value: string
  titleKey?: string
  label?: string
  icon?: Component
  ariaLabel?: string
}

const props = defineProps<{
  modelValue?: string
  items: Item[]
  disabled?: boolean
}>()

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>()

const rootRef = ref<HTMLElement | null>(null)
const itemsRef = ref<Map<string, HTMLElement>>(new Map())
const pillStyle = ref({
  width: "0px",
  transform: "translateX(0px)"
})

const setItemRef = (val: any, key: string) => {
  if (val) itemsRef.value.set(key, val)
}

const updatePill = () => {
  if (!props.modelValue) return

  const activeEl = itemsRef.value.get(props.modelValue)
  if (activeEl && rootRef.value) {
    const left = activeEl.offsetLeft
    const width = activeEl.offsetWidth

    pillStyle.value = {
      width: `${width}px`,
      transform: `translateX(${left}px)`
    }
  }
}

const handleUpdate = (value: string) => {
  emit("update:modelValue", value)
}

watch(
  () => props.modelValue,
  () => {
    nextTick(updatePill)
  }
)

watch(
  () => props.items,
  () => {
    nextTick(updatePill)
  },
  { deep: true }
)

onMounted(() => {
  updatePill()
  window.addEventListener("resize", updatePill)
})

onUnmounted(() => {
  window.removeEventListener("resize", updatePill)
})
</script>

<template>
  <div
    class="border-border bg-surface/35 relative inline-grid h-11 w-full grid-flow-col overflow-hidden rounded-[18px] border p-1"
    role="tablist"
    :aria-label="$t('ui.tabs.ariaLabel')"
    ref="rootRef"
  >
    <div
      class="bg-surface/70 left-0 pt-seg-pill absolute top-1 h-[calc(100%-9px)] rounded-[14px] will-change-transform"
      aria-hidden="true"
      :style="pillStyle"
    />

    <button
      v-for="item in props.items"
      role="tab"
      type="button"
      class="text-foreground hover:text-foreground/70 active:scale-[0.98] relative z-10 inline-flex items-center justify-center rounded-[14px] px-3 text-[13px] font-semibold tracking-[0.08em] transition flex-1 py-2"
      :class="{
        'text-foreground': item.value === props.modelValue
      }"
      :disabled="props.disabled"
      :aria-selected="item.value === props.modelValue"
      :aria-label="item.ariaLabel ?? (item.titleKey ? $t(item.titleKey) : item.label)"
      :ref="(el) => setItemRef(el, item.value)"
      :key="item.value"
      @click="handleUpdate(item.value)"
    >
      <div class="flex items-center justify-center gap-2">
        <component
          :is="item.icon"
          v-if="item.icon"
          class="text-muted-foreground h-4 w-4"
          aria-hidden="true"
        />
        <span
          v-if="item.titleKey"
          class="truncate"
        >
          {{ $t(item.titleKey) }}
        </span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.pt-seg-pill {
  box-shadow:
    0 18px 55px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: transform 240ms cubic-bezier(0.2, 0.9, 0.2, 1);
}
</style>
