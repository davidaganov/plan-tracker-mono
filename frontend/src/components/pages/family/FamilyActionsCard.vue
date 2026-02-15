<script setup lang="ts">
import UiCard from "@/components/ui/UiCard.vue"
import { Button } from "@/components/ui/shadcn"

const emit = defineEmits<{
  (e: "create"): void
}>()

const handleCreate = () => {
  emit("create")
}
</script>

<template>
  <UiCard>
    <div class="flex items-center justify-between gap-3">
      <div class="text-muted-foreground text-[13px]">{{ $t("pages.family.yourFamilies") }}</div>
      <Button
        size="sm"
        @click="handleCreate"
      >
        {{ $t("common.actions.create") }}
      </Button>
    </div>
  </UiCard>
</template>
