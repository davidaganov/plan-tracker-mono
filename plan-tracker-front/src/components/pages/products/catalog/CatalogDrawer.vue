<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useI18n } from "vue-i18n"
import { ArrowLeftRight, Package, Scale, Tag } from "lucide-vue-next"
import { useLocationsStore } from "@/stores/locations"
import { useSettingsStore } from "@/stores/settings"
import { QUANTITY_UNIT_OPTIONS } from "@/config/quantityUnits"
import UiDrawer from "@/components/ui/UiDrawer.vue"
import UiTabs from "@/components/ui/UiTabs.vue"
import {
  Button,
  Input,
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from "@/components/ui/shadcn"
import {
  PRICE_TYPE,
  QUANTITY_UNIT,
  PRODUCT_QUANTITY_TYPE,
  CURRENCIES,
  type CurrencyCode,
  type CreateProductDto,
  type ProductDto,
  type UpdateProductDto
} from "@plans-tracker/types"

const props = defineProps<{
  modelValue: boolean
  product?: ProductDto | null
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "create", data: CreateProductDto): void
  (e: "update", id: string, data: UpdateProductDto): void
}>()

const settingsStore = useSettingsStore()
const locationsStore = useLocationsStore()

const { t } = useI18n()

const form = ref<CreateProductDto>({
  title: "",
  note: null,
  defaultPriceType: PRICE_TYPE.EXACT,
  defaultPriceCurrency: settingsStore.currency,
  defaultPriceMin: null,
  defaultPriceMax: null,
  defaultLocationIds: [],
  quantityUnit: null
})

const quantityUnitOptions = computed(() => {
  return QUANTITY_UNIT_OPTIONS.map((opt) => ({
    value: opt.value,
    title: `${t(opt.title)} (${t("common.unitFullNames." + opt.value)})`
  }))
})

const isEditMode = computed(() => !!props.product)

const quantityTypeOptions = computed(() => [
  {
    value: PRODUCT_QUANTITY_TYPE.REGULATED,
    icon: Scale,
    ariaLabel: t("pages.products.create.quantityRegulated")
  },
  {
    value: PRODUCT_QUANTITY_TYPE.UNREGULATED,
    icon: Package,
    ariaLabel: t("pages.products.create.quantityUnregulated")
  }
])

const quantityType = computed({
  get: () =>
    form.value.quantityUnit !== null
      ? PRODUCT_QUANTITY_TYPE.REGULATED
      : PRODUCT_QUANTITY_TYPE.UNREGULATED,
  set: (val) => {
    if (val === PRODUCT_QUANTITY_TYPE.REGULATED && form.value.quantityUnit === null) {
      form.value.quantityUnit = QUANTITY_UNIT.PCS
    } else if (val === PRODUCT_QUANTITY_TYPE.UNREGULATED) {
      form.value.quantityUnit = null
    }
  }
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const currencyCodes = computed(() => {
  return CURRENCIES.map((c) => c.code)
})

const locationOptions = computed(() => {
  return locationsStore.locations.map((loc) => ({
    label: loc.title,
    value: loc.id
  }))
})

const currencyModel = computed<CurrencyCode | null>({
  get: () => (form.value.defaultPriceCurrency as CurrencyCode | null | undefined) ?? null,
  set: (v) => {
    form.value.defaultPriceCurrency = v
  }
})

const priceTypeOptions = computed(() => [
  {
    value: PRICE_TYPE.EXACT,
    icon: Tag,
    ariaLabel: t("pages.products.create.priceExact")
  },
  {
    value: PRICE_TYPE.RANGE,
    icon: ArrowLeftRight,
    ariaLabel: t("pages.products.create.priceRange")
  }
])

const handleSubmit = () => {
  if (isEditMode.value && props.product) {
    emit("update", props.product.id, { ...form.value } satisfies UpdateProductDto)
  } else {
    emit("create", { ...form.value })
  }
  isOpen.value = false
}

watch(
  () => settingsStore.currency,
  (newVal: CurrencyCode) => {
    if (!isEditMode.value) {
      form.value.defaultPriceCurrency = newVal
    }
  }
)

watch(
  () => props.product,
  (newProd) => {
    if (newProd) {
      form.value = {
        title: newProd.title,
        note: newProd.note ?? null,
        defaultPriceType: newProd.defaultPriceType,
        defaultPriceCurrency: newProd.defaultPriceCurrency ?? settingsStore.currency,
        defaultPriceMin: newProd.defaultPriceMin ?? null,
        defaultPriceMax: newProd.defaultPriceMax ?? null,
        defaultLocationIds: [...newProd.defaultLocationIds],
        quantityUnit: newProd.quantityUnit
      }
    } else {
      form.value = {
        title: "",
        note: null,
        defaultPriceType: PRICE_TYPE.EXACT,
        defaultPriceCurrency: settingsStore.currency,
        defaultPriceMin: null,
        defaultPriceMax: null,
        defaultLocationIds: [],
        quantityUnit: null
      }
    }
  },
  { immediate: true }
)

watch(isOpen, (val) => {
  if (val) {
    locationsStore.fetchLocations()
  } else {
    if (!props.product) {
      form.value = {
        title: "",
        note: null,
        defaultPriceType: PRICE_TYPE.EXACT,
        defaultPriceCurrency: settingsStore.currency,
        defaultPriceMin: null,
        defaultPriceMax: null,
        defaultLocationIds: [],
        quantityUnit: null
      }
    }
  }
})
</script>

<template>
  <UiDrawer
    v-model:visible="isOpen"
    :title="isEditMode ? $t('common.actions.edit') : $t('common.actions.create')"
  >
    <div class="grid gap-2.5">
      <!-- Name -->
      <Input
        :model-value="form.title"
        :placeholder="$t('pages.products.create.namePlaceholder')"
        @update:model-value="(v) => (form.title = String(v))"
      />

      <Textarea
        :model-value="form.note ?? ''"
        :placeholder="$t('common.fields.note')"
        @update:model-value="(v) => (form.note = String(v || '') ? String(v || '') : null)"
      />

      <!-- Location -->
      <MultiSelect
        :model-value="form.defaultLocationIds || []"
        :options="locationOptions"
        :placeholder="$t('pages.products.create.locationPlaceholder')"
        :search-placeholder="$t('common.actions.search')"
        @update:model-value="(v) => (form.defaultLocationIds = v)"
      />

      <!-- Quantity Logic -->
      <div class="grid gap-3">
        <div class="text-sm gap-4 font-medium flex justify-between items-center">
          {{ $t("common.fields.quantity") }}
          <div>
            <UiTabs
              v-model="quantityType"
              class="h-10"
              :items="quantityTypeOptions"
            />
          </div>
        </div>

        <Select
          v-if="quantityType === PRODUCT_QUANTITY_TYPE.REGULATED"
          :model-value="form.quantityUnit ?? undefined"
          @update:model-value="(v) => (form.quantityUnit = v as any)"
        >
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="$t('common.fields.unit')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in quantityUnitOptions"
              :value="opt.value"
              :key="opt.value"
            >
              {{ opt.title }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Price Logic -->
      <div class="grid gap-3">
        <div class="text-sm gap-4 font-medium flex justify-between items-center">
          {{ $t("pages.products.create.priceLabel") }}
          <div>
            <UiTabs
              v-model="form.defaultPriceType"
              class="h-10"
              :items="priceTypeOptions"
            />
          </div>
        </div>
        <div
          v-if="form.defaultPriceType === PRICE_TYPE.EXACT"
          class="grid grid-cols-[1fr_auto] gap-2"
        >
          <Input
            type="number"
            :model-value="form.defaultPriceMin === null ? '' : String(form.defaultPriceMin)"
            :placeholder="$t('pages.products.create.pricePlaceholder')"
            @update:model-value="(v) => (form.defaultPriceMin = v ? Number(v) : null)"
          />
          <Select
            :model-value="currencyModel ?? undefined"
            @update:model-value="(v) => (currencyModel = v as any)"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="code in currencyCodes"
                :value="code"
                :key="code"
              >
                {{ code }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          v-else
          class="grid grid-cols-[1fr_1fr_auto] gap-2"
        >
          <Input
            type="number"
            :model-value="form.defaultPriceMin === null ? '' : String(form.defaultPriceMin)"
            :placeholder="$t('pages.products.create.priceFromPlaceholder')"
            @update:model-value="(v) => (form.defaultPriceMin = v ? Number(v) : null)"
          />
          <Input
            type="number"
            :model-value="form.defaultPriceMax === null ? '' : String(form.defaultPriceMax)"
            :placeholder="$t('pages.products.create.priceToPlaceholder')"
            @update:model-value="(v) => (form.defaultPriceMax = v ? Number(v) : null)"
          />
          <Select
            :model-value="currencyModel ?? undefined"
            @update:model-value="(v) => (currencyModel = v as any)"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="code in currencyCodes"
                :value="code"
                :key="code"
              >
                {{ code }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        class="mt-4 h-12 w-full"
        @click="handleSubmit"
      >
        {{ isEditMode ? $t("common.actions.save") : $t("common.actions.create") }}
      </Button>
    </div>
  </UiDrawer>
</template>
