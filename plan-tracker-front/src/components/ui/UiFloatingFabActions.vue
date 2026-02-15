<script setup lang="ts">
import { onMounted, ref } from "vue"
import { Button } from "@/components/ui/shadcn"
import type { FabAction } from "@/types"

const SECONDARY_BTN_SIZE = 48
const SECONDARY_BTN_GAP = 12
const STEP = 50
const INITIAL_DELAY = 100

const props = withDefaults(
  defineProps<{
    mainAction: FabAction
    actions?: FabAction[]
    teleport?: boolean
    appearDelayMs?: number
    safeAreaInsetBottom?: boolean
  }>(),
  {
    actions: () => [],
    teleport: true,
    safeAreaInsetBottom: true
  }
)

const isVisible = ref(false)

const getSecondaryStackStyle = (count: number) => {
  const heightPx = count * SECONDARY_BTN_SIZE + Math.max(0, count - 1) * SECONDARY_BTN_GAP
  return { height: `${heightPx}px` }
}

const getSecondaryItemStyle = (index: number, count: number) => {
  const bottomPx = Math.max(0, count - 1 - index) * (SECONDARY_BTN_SIZE + SECONDARY_BTN_GAP)
  const delayStyle = getDelayStyle(index, count)
  return { ...delayStyle, bottom: `${bottomPx}px` }
}

const getDelayStyle = (index: number, count: number) => {
  const delayMs = INITIAL_DELAY + Math.max(0, (count - 1 - index) * STEP)
  return { "--fab-delay": `${delayMs}ms` }
}

onMounted(() => {
  window.setTimeout(() => {
    isVisible.value = true
  }, props.appearDelayMs ?? 0)
})
</script>

<template>
  <div
    class="flex items-center gap-4 py-2 px-1 h-[64px]"
    :class="$slots.left ? 'justify-between' : 'justify-end'"
  >
    <div
      class="flex-1"
      id="product-toolbar-filters"
    >
      <slot name="left" />
    </div>

    <Teleport
      to="body"
      :disabled="!(props.teleport ?? true)"
    >
      <div
        class="fixed right-0 flex flex-col items-center gap-3 pointer-events-none p-4"
        :class="[
          props.safeAreaInsetBottom
            ? 'bottom-[calc(env(safe-area-inset-bottom,0px)+85px)]'
            : 'bottom-0'
        ]"
      >
        <TransitionGroup
          v-if="isVisible"
          appear
          name="fab-secondary"
          tag="div"
          class="relative w-12"
          :style="getSecondaryStackStyle(props.actions.length)"
        >
          <div
            v-for="(action, index) in props.actions"
            class="absolute inset-x-0 pointer-events-none flex justify-center"
            :style="getSecondaryItemStyle(index, props.actions.length)"
            :key="action.key"
          >
            <Button
              :variant="action.variant || 'secondary'"
              size="icon"
              class="rounded-full shadow-md size-12 pointer-events-auto transition-all bg-background border border-border"
              :class="action.className"
              :aria-label="action.label"
              :disabled="action.disabled"
              @click="action.onClick"
            >
              <component
                :is="action.icon"
                class="size-5"
              />
            </Button>
          </div>
        </TransitionGroup>

        <Button
          :variant="props.mainAction.variant || 'default'"
          size="icon"
          class="rounded-full shadow-lg size-14 pointer-events-auto transition-all"
          :class="[
            isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
            props.mainAction.className
          ]"
          :aria-label="props.mainAction.label"
          :style="{ transitionDelay: isVisible ? '0ms' : '0ms' }"
          @click="props.mainAction.onClick"
        >
          <component
            :is="props.mainAction.icon"
            class="size-6"
          />
        </Button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.fab-secondary-enter-active {
  transition:
    transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 200ms ease;
  transition-delay: var(--fab-delay, 0ms);
}

.fab-secondary-leave-active {
  transition:
    transform 200ms ease,
    opacity 160ms ease;
  transition-delay: 0ms;
  position: absolute;
}

.fab-secondary-move {
  transition: none;
}

.fab-secondary-enter-from,
.fab-secondary-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.fab-secondary-enter-to,
.fab-secondary-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
