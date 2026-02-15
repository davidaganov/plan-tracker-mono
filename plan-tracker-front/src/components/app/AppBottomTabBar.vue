<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { CheckCircle2, List, Settings, Users } from "lucide-vue-next"
import { BOTTOM_TAB_ICONS, BOTTOM_TAB_LABEL_KEYS, BOTTOM_TABS } from "@/config/bottomTabs"

const ICONS: Record<string, any> = {
  [BOTTOM_TAB_ICONS.products]: List,
  [BOTTOM_TAB_ICONS.tasks]: CheckCircle2,
  [BOTTOM_TAB_ICONS.family]: Users,
  [BOTTOM_TAB_ICONS.settings]: Settings
}

const route = useRoute()

const activePath = computed(() => route.path)

const activeIndex = computed(() => {
  const path = activePath.value
  const idx = BOTTOM_TABS.findIndex((t) => path.startsWith(t.to))
  return idx >= 0 ? idx : 0
})
</script>

<template>
  <div class="fixed inset-x-0 bottom-0 z-30 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
    <div class="max-w-container">
      <div
        class="border-border bg-surface/70 rounded-[26px] border p-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur"
      >
        <div class="relative grid grid-cols-4 gap-2">
          <div
            class="bg-surface-2/80 pointer-events-none absolute top-0 left-0 h-full w-1/4 rounded-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform duration-300 ease-out"
            :style="{ transform: `translateX(${activeIndex * 100}%)` }"
          />
          <RouterLink
            v-for="tab in BOTTOM_TABS"
            class="group relative z-10 flex flex-col items-center justify-center gap-1.5 rounded-[18px] p-2 text-center"
            :to="tab.to"
            :class="
              activePath.startsWith(tab.to)
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
            :key="tab.to"
          >
            <component
              :is="ICONS[BOTTOM_TAB_ICONS[tab.icon]]"
              class="h-5 w-5 transition-transform duration-200 group-hover:scale-[1.04]"
              aria-hidden="true"
            />
            <span class="text-[12px] leading-none font-medium">
              {{ $t(BOTTOM_TAB_LABEL_KEYS[tab.icon]) }}
            </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
