import { FastifyPluginAsync } from "fastify"
import { TaskItemsService } from "@/modules/lists/services"
import { getAuthUser } from "@/common/hooks"
import type {
  CreateTaskItemDto,
  UpdateTaskItemDto,
  ToggleItemDto,
  ReorderItemsDto
} from "@plans-tracker/types"

/**
 * Routes for task list items.
 */
const taskItemsRoutes: FastifyPluginAsync = async (fastify) => {
  const itemsService = new TaskItemsService(fastify.prisma)

  // List all task items
  fastify.get<{
    Params: { listId: string }
  }>("/:listId/task-items", async (req) => {
    const user = getAuthUser(req)
    return itemsService.listItems(user.id, req.params.listId)
  })

  // Create a task item
  fastify.post<{
    Params: { listId: string }
    Body: CreateTaskItemDto
  }>("/:listId/task-items", async (req, reply) => {
    const user = getAuthUser(req)
    const item = await itemsService.createItem(user.id, req.params.listId, req.body)
    return reply.status(201).send(item)
  })

  // Update a task item
  fastify.patch<{
    Params: { listId: string; itemId: string }
    Body: UpdateTaskItemDto
  }>("/:listId/task-items/:itemId", async (req) => {
    const user = getAuthUser(req)
    return itemsService.updateItem(user.id, req.params.listId, req.params.itemId, req.body)
  })

  // Toggle a task item
  fastify.post<{
    Params: { listId: string; itemId: string }
    Body: ToggleItemDto
  }>("/:listId/task-items/:itemId/toggle", async (req) => {
    const user = getAuthUser(req)
    return itemsService.toggleItem(
      user.id,
      req.params.listId,
      req.params.itemId,
      req.body.isChecked
    )
  })

  // Delete a task item
  fastify.delete<{
    Params: { listId: string; itemId: string }
  }>("/:listId/task-items/:itemId", async (req) => {
    const user = getAuthUser(req)
    return itemsService.removeItem(user.id, req.params.listId, req.params.itemId)
  })

  // Reorder task items
  fastify.post<{
    Params: { listId: string }
    Querystring: { checked?: string }
    Body: ReorderItemsDto
  }>("/:listId/task-items/reorder", async (req) => {
    const user = getAuthUser(req)
    return itemsService.reorderItems(
      user.id,
      req.params.listId,
      req.body.orderedIds,
      req.query.checked === "true"
    )
  })
}

export default taskItemsRoutes
