<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { SETTINGS_ACCENT_PRESETS, SETTINGS_THEME_ITEMS } from "@/config/settingsOptions"
import UiCard from "@/components/ui/UiCard.vue"
import UiDrawer from "@/components/ui/UiDrawer.vue"
import UiTabs from "@/components/ui/UiTabs.vue"
import UiTile from "@/components/ui/UiTile.vue"
import { Button, Input } from "@/components/ui/shadcn"
import { THEME } from "@plans-tracker/types"

type AccentOption = {
  title: string
  value: string
}

const props = defineProps<{
  themeMode: THEME
  primary: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: "update:theme-mode", value: THEME): void
  (e: "update:primary", value: string): void
}>()

const { t } = useI18n()

const accentModel = computed<string>({
  get: () => props.primary,
  set: (val) => emit("update:primary", val)
})
const accentDialog = ref(false)
const isCustomAccent = ref(false)
const themeModel = computed<THEME>({
  get: () => props.themeMode,
  set: (val) => emit("update:theme-mode", val)
})

const themeItems = computed(() =>
  SETTINGS_THEME_ITEMS.map((it) => ({
    value: it.value,
    icon: it.icon,
    ariaLabel: t(it.titleKey)
  }))
)

const accentOptions = computed<AccentOption[]>(() =>
  SETTINGS_ACCENT_PRESETS.map((it) => ({
    title: t(it.titleKey),
    value: it.value
  }))
)

const accentTitle = computed(() => {
  const match = accentOptions.value.find(
    (o) => o.value.toLowerCase() === accentModel.value.toLowerCase()
  )

  return match ? match.title : t("pages.settings.accentCustom")
})

const themeTitle = computed(() => {
  if (props.themeMode === THEME.SYSTEM) return t("pages.settings.themeAuto")
  if (props.themeMode === THEME.LIGHT) return t("pages.settings.themeLight")
  return t("pages.settings.themeDark")
})

const selectPresetAccent = (hex: string) => {
  isCustomAccent.value = false
  accentModel.value = hex
  accentDialog.value = false
}

const openCustomAccent = () => {
  isCustomAccent.value = true
}
</script>

<template>
  <div>
    <UiCard>
      <UiTile>
        <template #title>{{ $t("pages.settings.theme") }}</template>
        <template #subtitle>
          {{ themeTitle }}
        </template>
        <template #right>
          <div class="w-[220px] max-w-[220px]">
            <UiTabs
              v-model="themeModel"
              :items="themeItems"
              :disabled="props.disabled"
            />
          </div>
        </template>
      </UiTile>

      <div class="mt-3">
        <UiTile>
          <template #title>{{ $t("pages.settings.accentColor") }}</template>
          <template #subtitle>{{ accentTitle }}</template>
          <template #right>
            <Button
              variant="outline"
              class="shrink-0"
              :disabled="props.disabled"
              @click="accentDialog = true"
            >
              {{ $t("common.change") }}
            </Button>
          </template>
        </UiTile>
      </div>
    </UiCard>

    <UiDrawer
      v-model:visible="accentDialog"
      :title="$t('pages.settings.accentChoose')"
    >
      <div class="grid grid-cols-3 gap-2 pt-2">
        <Button
          v-for="opt in accentOptions"
          class="h-11 w-full overflow-hidden rounded-md p-0"
          :title="opt.title"
          :style="{ backgroundColor: opt.value }"
          :key="opt.value"
          @click="selectPresetAccent(opt.value)"
        />

        <Button
          variant="outline"
          class="col-span-3 mt-2 h-11 w-full"
          @click="openCustomAccent"
        >
          <span
            class="mr-2 rounded"
            :style="{
              width: '16px',
              height: '16px',
              background:
                'conic-gradient(from 180deg, #ff3d3d, #ffa800, #fff700, #2fff6a, #00d5ff, #7c4dff, #ff3d3d)'
            }"
          />
          {{ $t("pages.settings.accentCustom") }}
        </Button>
      </div>

      <div
        v-show="isCustomAccent"
        class="mt-4"
      >
        <div class="grid gap-2">
          <div class="text-sm font-medium">
            {{ $t("pages.settings.accentColor") }}
          </div>
          <Input
            :model-value="accentModel"
            type="color"
            class="h-12 w-full cursor-pointer"
            @update:model-value="(v: string | number) => (accentModel = String(v))"
          />
        </div>
      </div>

      <div class="mt-8 flex justify-end">
        <Button
          class="h-11 w-full"
          @click="accentDialog = false"
        >
          {{ $t("common.apply") }}
        </Button>
      </div>
    </UiDrawer>
  </div>
</template>
