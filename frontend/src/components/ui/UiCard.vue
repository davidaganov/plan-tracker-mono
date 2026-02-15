<script setup lang="ts">
type Props = {
  innerClass?: string
  titleClass?: string
  textClass?: string
  actionsClass?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="border-border bg-surface/70 rounded-[18px] border shadow-[0_8px_15px_rgba(0,0,0,0.15)]"
    v-bind="$attrs"
  >
    <div
      v-if="$slots.title"
      :class="props.titleClass"
    >
      <slot name="title" />
    </div>

    <div :class="['p-4', props.innerClass, props.textClass]">
      <slot />
    </div>

    <div
      v-if="$slots.actions"
      :class="props.actionsClass"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
