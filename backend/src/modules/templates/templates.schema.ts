import { TAGS, TAGS_DESCRIPTION } from "@/common/utils/schemas"

export const schema = {
  tags: [TAGS.TEMPLATES],
  summary: "Template management",
  description: TAGS_DESCRIPTION[TAGS.TEMPLATES],
  response: {
    200: {
      type: "object"
    }
  }
}

export const schemaByID = {
  tags: [TAGS.TEMPLATES_FOR_ID],
  summary: "Template management for a specific template ID",
  description: TAGS_DESCRIPTION[TAGS.TEMPLATES_FOR_ID],
  response: {
    200: {
      type: "object"
    }
  }
}
