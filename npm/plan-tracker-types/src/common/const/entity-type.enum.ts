export interface EntityTabConfig {
  ROUTE_PREFIX: string
  ENTITY_KEY: string
  REF_KEY: string
}

export const ENTITY_TAB_CONFIG = {
  LISTS: {
    ROUTE_PREFIX: "/products/lists",
    ENTITY_KEY: "list",
    REF_KEY: "listsTabRef"
  },
  TEMPLATES: {
    ROUTE_PREFIX: "/products/templates",
    ENTITY_KEY: "template",
    REF_KEY: "templatesTabRef"
  },
  LOCATIONS: {
    ROUTE_PREFIX: "/products/locations",
    ENTITY_KEY: "location",
    REF_KEY: "locationsTabRef"
  },
  CATALOG: {
    ROUTE_PREFIX: "/products",
    ENTITY_KEY: "product",
    REF_KEY: "catalogTabRef"
  }
} satisfies Record<string, EntityTabConfig>

export type EntityTabKey = keyof typeof ENTITY_TAB_CONFIG
