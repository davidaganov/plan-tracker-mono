import { TAGS, TAGS_DESCRIPTION } from "@/common/utils/schemas"

export const schema = {
  tags: [TAGS.FAMILIES],
  summary: "Family management",
  description: TAGS_DESCRIPTION[TAGS.FAMILIES],

  response: {
    200: {
      type: "object"
    }
  }
}
export const schemaByID = {
  tags: [TAGS.FAMILIES_FOR_ID],
  summary: "Family management for a specific family ID",
  description: TAGS_DESCRIPTION[TAGS.FAMILIES_FOR_ID],
  response: {
    200: {
      type: "object"
    }
  }
}
