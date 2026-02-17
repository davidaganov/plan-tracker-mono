import { TAGS, TAGS_DESCRIPTION } from "@/common/utils/schemas"

export const schema = {
  tags: [TAGS.LISTS],
  summary: "List management",
  description: TAGS_DESCRIPTION[TAGS.LISTS],
  response: {
    200: {
      type: "object"
    }
  }
}
export const schemaByID = {
  tags: [TAGS.LISTS_FOR_ID],
  summary: "List management for a specific list ID",
  description: TAGS_DESCRIPTION[TAGS.LISTS_FOR_ID],
  response: {
    200: {
      type: "object"
    }
  }
}

export const schemaByIDTasks = {
  tags: [TAGS.LISTS_FOR_ID_TASKS],
  summary: "List management for a specific list ID",
  description: TAGS_DESCRIPTION[TAGS.LISTS_FOR_ID_TASKS],
  response: {
    200: {
      type: "object"
    }
  }
}

export const schemaByIDShopping = {
  tags: [TAGS.LISTS_FOR_ID_SHOPPING],
  summary: "List management for a specific list ID",
  description: TAGS_DESCRIPTION[TAGS.LISTS_FOR_ID_SHOPPING],
  response: {
    200: {
      type: "object"
    }
  }
}
