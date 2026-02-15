import { createRouter, createWebHistory } from "vue-router"
import routes from "@/router/mainRoutes"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0, left: 0 }
  }
})

router.afterEach(() => {
  const wrapper = document.querySelector(".wrapper")

  if (wrapper) {
    wrapper.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }
})

export default router
