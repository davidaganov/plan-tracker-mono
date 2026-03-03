import { TAGS, TAGS_DESCRIPTION } from "@/common/utils/schemas"

export const schema = {
  tags: [TAGS.LOCATIONS],
  summary: "Location management",
  description: TAGS_DESCRIPTION[TAGS.LOCATIONS],
  response: {
    200: {
      type: "object"
    }
  }
}

export const schemaByID = {
  tags: [TAGS.LOCATIONS_FOR_ID],
  summary: "Location management for a specific location ID",
  description: TAGS_DESCRIPTION[TAGS.LOCATIONS_FOR_ID],
  response: {
    200: {
      type: "object"
    }
  }
}
