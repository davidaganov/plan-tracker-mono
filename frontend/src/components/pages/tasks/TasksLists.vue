<script setup lang="ts">
import { Send } from "lucide-vue-next"
import UiCard from "@/components/ui/UiCard.vue"
import UiTile from "@/components/ui/UiTile.vue"
import { Badge, Button } from "@/components/ui/shadcn"

const props = defineProps<{
  lists: Array<{
    id: string
    title: string
    count: number
    canSend?: boolean
  }>
}>()

const emit = defineEmits<{
  (e: "open", id: string): void
  (e: "send", id: string): void
}>()

const getScopeKey = (canSend?: boolean) => {
  return canSend ? "common.scopes.family" : "common.scopes.personal"
}

const handleOpen = (id: string) => {
  emit("open", id)
}

const handleSend = (id: string) => {
  emit("send", id)
}
</script>

<template>
  <div class="mt-4 grid gap-3">
    <UiCard
      v-for="list in props.lists"
      :key="list.id"
    >
      <UiTile>
        <template #title>
          <div class="flex min-w-0 items-center gap-2">
            <span class="min-w-0 truncate">{{ list.title }}</span>
            <Badge
              :variant="list.canSend ? 'secondary' : 'outline'"
              class="shrink-0 px-2 py-0 text-[11px] font-semibold"
            >
              {{ $t(getScopeKey(list.canSend)) }}
            </Badge>
          </div>
        </template>
        <template #right>
          <div class="pt-badge">{{ $t("units.tasks", { count: list.count }) }}</div>
        </template>

        <template #footer>
          <div
            class="grid items-center gap-3"
            :class="{ 'grid-cols-[1fr_auto] ': list.canSend }"
          >
            <Button
              variant="outline"
              class="w-full"
              @click="handleOpen(list.id)"
            >
              {{ $t("common.actions.open") }}
            </Button>
            <Button
              v-if="list.canSend"
              variant="outline"
              size="icon-sm"
              @click="handleSend(list.id)"
            >
              <Send class="size-4" />
            </Button>
          </div>
        </template>
      </UiTile>
    </UiCard>
  </div>
</template>
