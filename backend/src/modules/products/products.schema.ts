import { TAGS, TAGS_DESCRIPTION } from "@/common/utils/schemas"

export const schema = {
  tags: [TAGS.PRODUCTS],
  summary: "Product management",
  description: TAGS_DESCRIPTION[TAGS.PRODUCTS],
  response: {
    200: {
      type: "object"
    }
  }
}

export const schemaByID = {
  tags: [TAGS.PRODUCTS_FOR_ID],
  summary: "Product management for a specific product ID",
  description: TAGS_DESCRIPTION[TAGS.PRODUCTS_FOR_ID],
  response: {
    200: {
      type: "object"
    }
  }
}
