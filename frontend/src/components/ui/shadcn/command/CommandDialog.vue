<script setup lang="ts">
import { useForwardPropsEmits, type DialogRootEmits, type DialogRootProps } from "reka-ui"
import {
  Command,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/shadcn"

const props = defineProps<
  DialogRootProps & {
    title?: string
    description?: string
  }
>()

const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <Dialog
    v-slot="slotProps"
    v-bind="forwarded"
  >
    <DialogContent class="overflow-hidden p-0">
      <DialogHeader class="sr-only">
        <DialogTitle>{{ title ?? $t("ui.command.paletteTitle") }}</DialogTitle>
        <DialogDescription>{{ description ?? $t("ui.command.paletteSearch") }}</DialogDescription>
      </DialogHeader>
      <Command>
        <slot v-bind="slotProps" />
      </Command>
    </DialogContent>
  </Dialog>
</template>
