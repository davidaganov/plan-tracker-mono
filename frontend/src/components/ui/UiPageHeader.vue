<script setup lang="ts">
type Props = {
  titleKey: string
  subtitleKeys?: string[]
}

const props = defineProps<Props>()
</script>

<template>
  <div class="mb-4">
    <div class="text-lg font-semibold tracking-[-0.01em]">
      <slot name="title">{{ $t(props.titleKey) }}</slot>
    </div>

    <div
      v-if="props.subtitleKeys?.length"
      class="text-muted-foreground mt-0.5 text-[13px]"
    >
      <slot name="subtitle">
        <template
          v-for="(key, idx) in props.subtitleKeys"
          :key="key"
        >
          <template v-if="idx">,</template>
          {{ $t(key) }}
        </template>
      </slot>
    </div>
  </div>
</template>
