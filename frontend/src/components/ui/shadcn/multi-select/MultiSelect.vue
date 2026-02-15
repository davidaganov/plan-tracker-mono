<script setup lang="ts" generic="T extends string | number">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { ChevronDown, Check } from "lucide-vue-next"
import { cn } from "@/utils/classmerge"
import {
  Button,
  Checkbox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/shadcn"

interface Option {
  label: string
  value: T
}

const props = defineProps<{
  modelValue: T[]
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  maxHeight?: number
  className?: string
}>()

const { t } = useI18n()

const emit = defineEmits<{
  (e: "update:modelValue", value: T[]): void
}>()

const open = ref(false)

const isDisabled = computed(() => props.disabled || props.options.length === 0)

const selectedValues = computed(() => new Set(props.modelValue))

const selectedOptions = computed(() =>
  props.options.filter((option) => selectedValues.value.has(option.value))
)

const toggleOption = (value: T) => {
  const newSelected = new Set(selectedValues.value)
  if (newSelected.has(value)) {
    newSelected.delete(value)
  } else {
    newSelected.add(value)
  }
  emit("update:modelValue", Array.from(newSelected) as T[])
}

const clearAll = () => {
  emit("update:modelValue", [])
}

const displayText = computed(() => {
  if (selectedOptions.value.length === 0) {
    return props.placeholder || t("common.multiSelect.placeholder")
  }
  if (selectedOptions.value.length === 1) {
    return selectedOptions.value[0]?.label ?? ""
  }
  return t("common.multiSelect.selectedCount", { count: selectedOptions.value.length })
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :class="cn('w-auto justify-between font-normal', className)"
        :aria-expanded="open"
        :disabled="isDisabled"
      >
        <span class="truncate">{{ displayText }}</span>
        <ChevronDown class="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="w-(--reka-popover-trigger-width) p-0"
      :style="{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }"
      @openAutoFocus="(e) => e.preventDefault()"
    >
      <Command>
        <CommandInput :placeholder="searchPlaceholder || $t('common.actions.search') + '...'" />
        <CommandList>
          <CommandEmpty>{{ emptyText || $t("common.multiSelect.empty") }}</CommandEmpty>
          <CommandGroup v-if="options && options.length > 0">
            <CommandItem
              v-for="option in options"
              :value="option.label"
              :key="String(option.value)"
              @select="() => toggleOption(option.value)"
            >
              <Checkbox
                class="mr-2"
                :model-value="selectedValues.has(option.value)"
              />
              <span class="flex-1">{{ option.label }}</span>
              <Check
                v-if="selectedValues.has(option.value)"
                class="ml-auto size-4"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      <div
        v-if="selectedOptions.length > 0"
        class="border-border border-t p-1"
      >
        <Button
          variant="ghost"
          size="sm"
          class="w-full text-xs"
          @click="clearAll"
        >
          {{ $t("common.actions.clearAll") }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
