<script setup lang="ts">
type Props = {
  title?: string
  subtitle?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <div class="truncate text-[15px] font-semibold">
        <slot name="title">{{ props.title }}</slot>
      </div>

      <div
        v-if="props.subtitle || $slots.subtitle"
        class="text-muted-foreground mt-0.5 truncate text-[13px]"
      >
        <slot name="subtitle">{{ props.subtitle }}</slot>
      </div>
    </div>

    <div
      v-if="$slots.right"
      class="shrink-0"
    >
      <slot name="right" />
    </div>
  </div>

  <div
    v-if="$slots.footer"
    class="mt-3"
  >
    <slot name="footer" />
  </div>
</template>
