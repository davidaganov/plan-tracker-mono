<script setup lang="ts">
import { computed } from "vue"
import FamiliesList from "@/components/pages/family/FamiliesList.vue"
import FamilyActionsCard from "@/components/pages/family/FamilyActionsCard.vue"

const uiFamilies = computed(() => [])

function onCreateFamily() {}

function onOpenFamily(id: string) {
  void id
}

function onInvite(id: string) {
  void id
}
</script>

<template>
  <div>
    <FamilyActionsCard @create="onCreateFamily" />

    <FamiliesList
      :families="uiFamilies"
      @open="onOpenFamily"
      @invite="onInvite"
    />
  </div>
</template>
