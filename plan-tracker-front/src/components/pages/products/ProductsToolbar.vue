<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { CheckCheck, CheckSquare, Plus, Trash2 } from "lucide-vue-next"
import UiFloatingFabActions from "@/components/ui/UiFloatingFabActions.vue"
import type { FabAction } from "@/types"

const props = defineProps<{
  modelValue: boolean
  hasSelection: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "create"): void
  (e: "delete"): void
  (e: "select-all"): void
}>()

const { t } = useI18n()

const mainFabAction = computed<FabAction>(() => {
  if (props.modelValue) {
    return {
      key: "cancel",
      icon: Plus,
      label: t("common.actions.cancel"),
      className: "rotate-45",
      onClick: handleToggleSelect
    }
  }

  return {
    key: "create",
    icon: Plus,
    label: t("common.actions.create"),
    onClick: handleCreate
  }
})

const fabActions = computed<FabAction[]>(() => {
  if (props.modelValue) {
    return [
      {
        key: "select-all",
        icon: CheckCheck,
        label: t("common.actions.selectAll"),
        variant: "secondary",
        onClick: handleSelectAll
      },
      {
        key: "delete",
        icon: Trash2,
        label: t("common.actions.delete"),
        variant: "destructive",
        disabled: !props.hasSelection,
        onClick: handleDelete
      }
    ]
  }

  return [
    {
      key: "select-mode",
      icon: CheckSquare,
      label: t("common.actions.select"),
      variant: "secondary",
      onClick: handleToggleSelect
    }
  ]
})

const handleDelete = () => emit("delete")
const handleSelectAll = () => emit("select-all")
const handleCreate = () => emit("create")
const handleToggleSelect = () => emit("update:modelValue", !props.modelValue)
</script>

<template>
  <UiFloatingFabActions
    :main-action="mainFabAction"
    :actions="fabActions"
  >
    <template #left>
      <slot name="left" />
    </template>
  </UiFloatingFabActions>
</template>
