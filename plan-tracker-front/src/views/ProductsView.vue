<script setup lang="ts">
import ProductsPage from "@/components/pages/products/ProductsPage.vue"
</script>

<template>
  <div class="relative h-full">
    <ProductsPage />

    <RouterView v-slot="{ Component }">
      <Transition name="page-slide">
        <component
          :is="Component"
          v-if="Component"
          class="fixed inset-0 z-100 bg-background"
        />
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
.page-slide-enter-active,
.page-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.page-slide-enter-from,
.page-slide-leave-to {
  transform: translateY(100%);
}
</style>
