import { TAGS, TAGS_DESCRIPTION } from "@/common/utils/schemas"

export const schema = {
  tags: [TAGS.SETTINGS],
  summary: "Settings management",
  description: TAGS_DESCRIPTION[TAGS.SETTINGS],
  response: {
    200: {
      type: "object"
    }
  }
}
