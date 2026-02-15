import { FastifyPluginAsync } from "fastify"
import { SearchItemsService } from "@/modules/lists/services"
import { getAuthUser } from "@/common/hooks"
import type { SearchItemsQuery } from "@plans-tracker/types"

/**
 * Routes for searching items across lists.
 */
const searchRoutes: FastifyPluginAsync = async (fastify) => {
  const searchService = new SearchItemsService(fastify.prisma)

  // Search items across lists
  fastify.get<{
    Querystring: SearchItemsQuery
  }>("/search", async (req) => {
    const user = getAuthUser(req)
    return searchService.searchItems(user.id, req.query)
  })
}

export default searchRoutes
