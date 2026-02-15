<script setup lang="ts">
import UiCard from "@/components/ui/UiCard.vue"
import UiTile from "@/components/ui/UiTile.vue"
import { Badge, Button } from "@/components/ui/shadcn"

const props = defineProps<{
  families: Array<{
    id: string
    name: string
    subtitle: string
    roleLabel: string
  }>
}>()

const emit = defineEmits<{
  (e: "open", id: string): void
  (e: "invite", id: string): void
}>()

const handleOpen = (id: string) => {
  emit("open", id)
}

const handleInvite = (id: string) => {
  emit("invite", id)
}
</script>

<template>
  <div class="mt-4 grid gap-3">
    <UiCard
      v-for="family in props.families"
      :key="family.id"
    >
      <UiTile :title="family.name">
        <template #subtitle>
          {{ family.subtitle }}
        </template>
        <template #right>
          <Badge variant="outline">
            {{ family.roleLabel }}
          </Badge>
        </template>

        <template #footer>
          <div class="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              class="w-full"
              @click="handleOpen(family.id)"
            >
              {{ $t("common.actions.open") }}
            </Button>
            <Button
              class="w-full"
              @click="handleInvite(family.id)"
            >
              {{ $t("common.actions.inviteLink") }}
            </Button>
          </div>
        </template>
      </UiTile>
    </UiCard>
  </div>
</template>
