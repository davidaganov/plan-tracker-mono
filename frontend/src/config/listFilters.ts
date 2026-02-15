export const LIST_FILTER_VALUES = ["all", "family", "personal"] as const

export type ListFilterValue = (typeof LIST_FILTER_VALUES)[number]

export const LIST_FILTER_TITLE_KEYS = {
  products: {
    all: "common.lists.all",
    family: "common.scopes.family",
    personal: "common.scopes.personal"
  },
  tasks: {
    all: "common.lists.all",
    family: "common.scopes.family",
    personal: "common.scopes.personal"
  }
} as const
