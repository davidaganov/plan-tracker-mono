import { FastifyPluginAsync } from "fastify"
import {
  schemaLists as schema,
  schemaListsByID as schemaByID
} from "@/modules/lists/routes/list-schemas"
import { ListsService } from "@/modules/lists/services"
import { getAuthUser } from "@/common/hooks"
import {
  SEARCH_SCOPE,
  LIST_TYPE,
  type CreateListDto,
  type UpdateListDto,
  type ShareListDto,
  type ReorderItemsDto,
  type BatchDeleteDto
} from "@plans-tracker/types"

/**
 * Routes for list CRUD operations.
 */
const listsRoutes: FastifyPluginAsync = async (fastify) => {
  const listsService = new ListsService(fastify.prisma)

  // List all accessible lists
  fastify.get<{
    Querystring: {
      type?: LIST_TYPE
      familyId?: string
      scope?: SEARCH_SCOPE
    }
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    const { type, familyId, scope } = req.query

    if (scope === SEARCH_SCOPE.PERSONAL) {
      return listsService.listMyLists(user.id, { type, familyId: null })
    }

    if (scope === SEARCH_SCOPE.FAMILY) {
      return listsService.listMyLists(user.id, { type, familyId: familyId ?? "" })
    }

    return listsService.listMyLists(user.id, { type })
  })

  // Create a new list
  fastify.post<{
    Body: CreateListDto
  }>("/", { schema }, async (req, reply) => {
    const user = getAuthUser(req)
    const list = await listsService.createList(user.id, req.body)
    return reply.status(201).send(list)
  })

  // Get a single list
  fastify.get<{
    Params: { listId: string }
  }>("/:listId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return listsService.getList(user.id, req.params.listId)
  })

  // Update a list
  fastify.patch<{
    Params: { listId: string }
    Body: UpdateListDto
  }>("/:listId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return listsService.updateList(user.id, req.params.listId, req.body)
  })

  // Delete a list
  fastify.delete<{
    Params: { listId: string }
  }>("/:listId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return listsService.deleteList(user.id, req.params.listId)
  })

  // Delete multiple lists
  fastify.delete<{
    Body: BatchDeleteDto
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    return listsService.deleteLists(user.id, req.body.ids)
  })

  // Share list with a family
  fastify.post<{
    Params: { listId: string }
    Body: ShareListDto
  }>("/:listId/share", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return listsService.shareList(user.id, req.params.listId, req.body.familyId)
  })

  // Unshare list from a family
  fastify.post<{
    Params: { listId: string }
    Body: ShareListDto
  }>("/:listId/unshare", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return listsService.unshareList(user.id, req.params.listId, req.body.familyId)
  })

  // Reorder lists
  fastify.put<{
    Body: ReorderItemsDto
  }>("/reorder", { schema }, async (req) => {
    const user = getAuthUser(req)
    return listsService.reorderLists(user.id, req.body.orderedIds)
  })
}

export default listsRoutes
