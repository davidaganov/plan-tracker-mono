<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { LIST_FILTER_TITLE_KEYS, type ListFilterValue } from "@/config/listFilters"
import TasksLists from "@/components/pages/tasks/TasksLists.vue"
import TasksSearchField from "@/components/pages/tasks/TasksSearchField.vue"
import TasksToolbar from "@/components/pages/tasks/TasksToolbar.vue"
import UiCard from "@/components/ui/UiCard.vue"

const lists: Array<{ id: string; title: string; count: number; canSend: boolean }> = []

const { t } = useI18n()

const search = ref("")
const listFilter = ref<ListFilterValue>("all")

const listFilterItems = computed(
  (): Array<{ title: string; value: ListFilterValue }> => [
    { title: t(LIST_FILTER_TITLE_KEYS.tasks.all), value: "all" },
    { title: t(LIST_FILTER_TITLE_KEYS.tasks.family), value: "family" },
    { title: t(LIST_FILTER_TITLE_KEYS.tasks.personal), value: "personal" }
  ]
)

const uiLists = computed(() =>
  lists.map((list) => ({
    id: list.id,
    title: list.title,
    count: list.count,
    canSend: list.canSend
  }))
)

function onCreateList() {}

function onOpenList(id: string) {
  void id
}

function onSendList(id: string) {
  void id
}
</script>

<template>
  <div>
    <UiCard>
      <TasksToolbar
        v-model="listFilter"
        :items="listFilterItems"
        @create="onCreateList"
      />

      <TasksSearchField
        v-model="search"
        :placeholder="$t('pages.tasks.searchTasks')"
      />
    </UiCard>

    <TasksLists
      :lists="uiLists"
      @open="onOpenList"
      @send="onSendList"
    />
  </div>
</template>
