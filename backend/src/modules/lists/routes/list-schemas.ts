import { TAGS } from "@/common/utils/schemas"

export const schemaLists = {
  tags: [TAGS.LISTS],
  summary: "List management",
  description:
    "Endpoints for managing lists, including CRUD operations, sharing with families, and reordering.",
  response: {
    200: {
      type: "object"
    }
  }
}
export const schemaListsByID = {
  tags: [TAGS.LISTS_FOR_ID],
  summary: "List management for a specific list ID",
  description:
    "Endpoints for managing lists, including CRUD operations, sharing with families, and reordering.",
  response: {
    200: {
      type: "object"
    }
  }
}
