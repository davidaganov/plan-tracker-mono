<script setup lang="ts">
import AppBottomTabBar from "@/components/app/AppBottomTabBar.vue"
</script>

<template>
  <div class="h-full px-2 pt-4">
    <main class="wrapper">
      <div class="pt-page bg-background relative min-h-full w-full pb-28">
        <RouterView />
      </div>
    </main>

    <AppBottomTabBar />
  </div>
</template>

<style scoped>
.pt-page {
  background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -6px -6px;

  &::before {
    content: "";
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    height: 140px;
    pointer-events: none;
    z-index: 5;
    background:
      radial-gradient(900px 180px at 50% 0%, rgba(0, 0, 0, 0.12), transparent 60%),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.08), transparent 80%);
  }
}
</style>
