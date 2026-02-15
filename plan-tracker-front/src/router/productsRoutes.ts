import type { RouteRecordRaw } from "vue-router"

const productsRoutes: RouteRecordRaw[] = [
  {
    path: "products",
    name: "products",
    meta: { titleKey: "nav.products" },
    component: () => import("@/views/ProductsView.vue"),
    children: [
      {
        path: "templates/:id",
        name: "template-details",
        meta: { titleKey: "pages.products.templateDetails" },
        component: () => import("@/views/TemplateView.vue")
      },
      {
        path: "lists/:id",
        name: "list-details",
        meta: { titleKey: "common.lists.details.items" },
        component: () => import("@/views/ListView.vue")
      }
    ]
  }
]

export default productsRoutes
