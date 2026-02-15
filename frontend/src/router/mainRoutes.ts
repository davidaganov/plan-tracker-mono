import type { RouteRecordRaw } from "vue-router"
import productsRoutes from "@/router/productsRoutes"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/default.vue"),
    children: [
      {
        path: "",
        redirect: "/products"
      },
      {
        path: "tasks",
        name: "tasks",
        meta: { titleKey: "nav.tasks" },
        component: () => import("@/views/TasksView.vue")
      },
      {
        path: "family",
        name: "family",
        meta: { titleKey: "nav.family" },
        component: () => import("@/views/FamilyView.vue")
      },
      {
        path: "settings",
        name: "settings",
        meta: { titleKey: "nav.settings" },
        component: () => import("@/views/SettingsView.vue")
      },
      ...productsRoutes
    ]
  }
]

export default routes
