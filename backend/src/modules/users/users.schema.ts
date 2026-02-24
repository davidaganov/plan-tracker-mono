import { TAGS, TAGS_DESCRIPTION } from "@/common/utils/schemas"

export const schema = {
  tags: [TAGS.USERS],
  summary: "User management",
  description: TAGS_DESCRIPTION[TAGS.USERS],
  response: {
    200: {
      type: "object"
    }
  }
}
