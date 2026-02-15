<script setup lang="ts">
import { ref, watch } from "vue"
import { useRouter } from "vue-router"
import {
  FileText,
  ListChecks,
  MapPin,
  Package,
  Share2,
  ShoppingCart,
  GripVertical
} from "lucide-vue-next"
import { calculateTemplateCost } from "@/utils/price"
import SortableList from "@/components/ui/SortableList.vue"
import UiCard from "@/components/ui/UiCard.vue"
import { Badge, Button, Checkbox } from "@/components/ui/shadcn"
import {
  PRICE_TYPE,
  LIST_TYPE,
  ENTITY_TAB_CONFIG,
  type EntityTabConfig,
  type ShoppingItemDto,
  type TemplateItemDto
} from "@plans-tracker/types"

interface BaseEntity {
  id: string
  name?: string
  title?: string
  tags?: string[] | null
  itemsCount?: number
  items?: (TemplateItemDto | ShoppingItemDto)[]
  type?: LIST_TYPE
  canSend?: boolean
  defaultPriceType?: PRICE_TYPE
  defaultPriceCurrency?: string | null
  defaultPriceMin?: number | null
  defaultPriceMax?: number | null
  note?: string | null
}

const router = useRouter()

const props = withDefaults(
  defineProps<{
    entities: BaseEntity[]
    selectionMode: boolean
    selectedIds: string[]
    entityKey: EntityTabConfig["ENTITY_KEY"]
    showScope?: boolean
    showCost?: boolean
    routePrefix?: string
    reorderable?: boolean
  }>(),
  { reorderable: true }
)

const emit = defineEmits<{
  (e: "update:selectedIds", ids: string[]): void
  (e: "open", id: string): void
  (e: "send", id: string): void
  (e: "edit", id: string): void
  (e: "reorder", ids: string[]): void
}>()

const localEntities = ref<BaseEntity[]>([...props.entities])

const handleReorder = () => {
  emit(
    "reorder",
    localEntities.value.map((e) => e.id)
  )
}

const getEntityTitle = (entity: BaseEntity) => {
  return entity.name || entity.title || ""
}

const getIcon = (entity: BaseEntity) => {
  switch (props.entityKey) {
    case ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY:
      return entity.type === LIST_TYPE.SHOPPING ? ShoppingCart : ListChecks
    case ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY:
      return Package
    case ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY:
      return MapPin
    default:
      return FileText
  }
}

const getScopeKey = (entity: BaseEntity) => {
  return entity.canSend ? "common.scopes.family" : "common.scopes.personal"
}

const getItemCount = (entity: BaseEntity) => {
  if (entity.itemsCount !== undefined) {
    return entity.itemsCount
  }
  return entity.items?.length || 0
}

const isTemplateItem = (item: TemplateItemDto | ShoppingItemDto): item is TemplateItemDto => {
  return "priceType" in item
}

const getCost = (entity: BaseEntity) => {
  if (!props.showCost || !entity.items) return null
  const templateItems = entity.items.filter(isTemplateItem)
  return calculateTemplateCost(templateItems)
}

const formatPrice = (entity: BaseEntity) => {
  if (!entity.defaultPriceType || entity.defaultPriceType === PRICE_TYPE.NONE) return ""

  const currency = entity.defaultPriceCurrency || ""
  const min = entity.defaultPriceMin ?? 0
  const max = entity.defaultPriceMax ?? 0

  if (entity.defaultPriceType === PRICE_TYPE.EXACT) {
    return `${min} ${currency}`
  }

  if (entity.defaultPriceType === PRICE_TYPE.RANGE) {
    return `${min}-${max} ${currency}`
  }

  return ""
}

const handleSelect = (id: string) => {
  if (props.selectionMode) {
    const newSelection = props.selectedIds.includes(id)
      ? props.selectedIds.filter((i) => i !== id)
      : [...props.selectedIds, id]
    emit("update:selectedIds", newSelection)
  } else {
    handleOpen(id)
  }
}

const handleOpen = (id: string) => {
  if (props.selectionMode) {
    handleSelect(id)
    return
  }

  if (props.routePrefix) {
    router.push(`${props.routePrefix}/${id}`)
  } else {
    emit("edit", id)
  }
}

const handleSend = (id: string) => {
  emit("send", id)
}

const getEntityCardClasses = (entityId: string) => {
  const isSelected = props.selectionMode && props.selectedIds.includes(entityId)
  return {
    "border-primary/50 bg-primary/5": isSelected
  }
}

const shouldShowScopeBadge = () => {
  return (
    props.showScope &&
    !props.selectionMode &&
    (props.entityKey === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY ||
      props.entityKey === ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY)
  )
}

watch(
  () => props.entities,
  (newVal) => {
    localEntities.value = [...newVal]
  },
  { deep: true }
)
</script>

<template>
  <SortableList
    v-model="localEntities"
    class="grid gap-3 mt-2"
    handle=".drag-handle"
    :disabled="!props.selectionMode || !props.reorderable"
    @end="handleReorder"
  >
    <UiCard
      v-for="entity in localEntities"
      class="transition-all cursor-pointer hover:border-primary/30 hover:shadow-md"
      :class="getEntityCardClasses(entity.id)"
      :key="entity.id"
      @click="handleSelect(entity.id)"
    >
      <div class="grid grid-cols-[42px_1fr_auto] items-center gap-4 min-h-[56px]">
        <div class="shrink-0 flex items-center mx-auto justify-center">
          <div
            v-if="props.selectionMode && props.reorderable"
            class="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground mr-1"
          >
            <GripVertical class="size-4" />
          </div>
          <Checkbox
            v-if="props.selectionMode"
            class="size-5"
            :model-value="props.selectedIds.includes(entity.id)"
          />
          <div
            v-else
            class="bg-surface-2 text-primary flex h-10 w-10 items-center justify-center rounded-xl"
            :class="{ 'bg-primary/20': props.entityKey === ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY }"
          >
            <component
              :is="getIcon(entity)"
              class="h-5 w-5"
            />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="truncate text-[16px] font-bold leading-tight shrink min-w-0">
              {{ getEntityTitle(entity) }}
            </span>
            <div
              v-if="entity.tags && entity.tags.length > 0"
              class="flex gap-1 shrink-0"
            >
              <Badge
                v-for="tag in entity.tags.slice(0, 2)"
                variant="secondary"
                class="text-[10px] px-2 py-0"
                :key="tag"
              >
                {{ tag }}
              </Badge>
              <Badge
                v-if="entity.tags.length > 2"
                variant="outline"
                class="text-[10px] px-2 py-0"
              >
                +{{ entity.tags.length - 2 }}
              </Badge>
            </div>
            <Badge
              v-if="shouldShowScopeBadge()"
              class="shrink-0 text-[11px] font-semibold px-2 py-0"
              :variant="entity.canSend ? 'secondary' : 'outline'"
            >
              {{ $t(getScopeKey(entity)) }}
            </Badge>
          </div>

          <!-- Details Row -->
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium truncate">
            <!-- List/Template Details -->
            <template
              v-if="
                props.entityKey === ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY ||
                props.entityKey === ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY
              "
            >
              <span>{{ getItemCount(entity) }} {{ $t("pages.products.items.itemsCount") }}</span>
              <span
                v-if="getCost(entity)"
                class="text-muted-foreground/70"
              >
                {{ getCost(entity) }}
              </span>
            </template>

            <!-- Product Price -->
            <template v-else-if="props.entityKey === ENTITY_TAB_CONFIG.CATALOG.ENTITY_KEY">
              <span v-if="formatPrice(entity)">
                {{ formatPrice(entity) }}
              </span>
            </template>

            <!-- Location Note -->
            <template v-else-if="props.entityKey === ENTITY_TAB_CONFIG.LOCATIONS.ENTITY_KEY">
              <span v-if="entity.note">
                {{ entity.note }}
              </span>
            </template>
          </div>
        </div>

        <div
          v-if="!props.selectionMode"
          class="shrink-0 flex items-center gap-1"
        >
          <Button
            v-if="props.showScope && entity.canSend"
            variant="ghost"
            size="icon-sm"
            class="text-primary"
            @click.stop="handleSend(entity.id)"
          >
            <Share2 class="size-4" />
          </Button>
        </div>
      </div>
    </UiCard>
  </SortableList>
</template>
