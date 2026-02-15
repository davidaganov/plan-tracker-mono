<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { storeToRefs } from "pinia"
import { useSettingsStore } from "@/stores/settings"
import SettingsAppearanceSection from "@/components/pages/settings/SettingsAppearanceSection.vue"
import UiCard from "@/components/ui/UiCard.vue"
import UiPageHeader from "@/components/ui/UiPageHeader.vue"
import UiTile from "@/components/ui/UiTile.vue"
import {
  Alert,
  AlertDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/shadcn"
import {
  CURRENCIES,
  LANGUAGES,
  type CurrencyCode,
  type SUPPORT_LOCALES
} from "@plans-tracker/types"

const { t } = useI18n()

const currencyItems = CURRENCIES.map((c) => c.code)

const languageItems = computed(() =>
  LANGUAGES.map((l) => ({
    code: l.code,
    title: t(`common.languages.${l.code.toLowerCase()}`)
  }))
)

const settingsStore = useSettingsStore()

const { themeModeModel, primaryModel, currencyModel, localeModel, canSave } =
  storeToRefs(settingsStore)
</script>

<template>
  <div>
    <UiPageHeader
      title-key="nav.settings"
      :subtitle-keys="[
        'pages.settings.theme',
        'pages.settings.currency',
        'pages.settings.language'
      ]"
    />

    <Alert
      v-if="!canSave"
      class="mb-3"
    >
      <AlertDescription>
        {{ $t("pages.settings.authRequired") }}
      </AlertDescription>
    </Alert>

    <div class="grid gap-3">
      <SettingsAppearanceSection
        v-model:theme-mode="themeModeModel"
        v-model:primary="primaryModel"
        :disabled="!canSave"
      />

      <UiCard>
        <div class="flex flex-col items-start justify-between gap-4">
          <UiTile>
            <template #title>{{ $t("pages.settings.currency") }}</template>
            <template #subtitle>{{ currencyModel }}</template>
          </UiTile>

          <Select
            :model-value="currencyModel"
            :disabled="!canSave"
            @update:model-value="(v) => (currencyModel = v as CurrencyCode)"
          >
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="code in currencyItems"
                :value="code"
                :key="code"
              >
                {{ code }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </UiCard>

      <UiCard>
        <div class="flex flex-col items-start justify-between gap-4">
          <UiTile>
            <template #title>{{ $t("pages.settings.language") }}</template>
            <template #subtitle>
              {{ $t(`common.languages.${localeModel.toLowerCase()}`) }}
            </template>
          </UiTile>

          <Select
            :model-value="localeModel"
            :disabled="!canSave"
            @update:model-value="(v) => (localeModel = v as SUPPORT_LOCALES)"
          >
            <SelectTrigger class="w-full">
              <SelectValue>
                {{ languageItems.find((l) => l.code === localeModel)?.title }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="lang in languageItems"
                :value="lang.code"
                :key="lang.code"
              >
                {{ lang.title }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </UiCard>
    </div>
  </div>
</template>
