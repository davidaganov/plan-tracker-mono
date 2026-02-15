import { FastifyPluginAsync } from "fastify"
import {
  ShoppingItemsService,
  SendListService,
  ShoppingListTemplateService
} from "@/modules/lists/services"
import { getAuthUser } from "@/common/hooks"
import type {
  CreateShoppingItemDto,
  UpdateShoppingItemDto,
  ToggleItemDto,
  ReorderItemsDto,
  ApplyTemplatesDto,
  SendListDto
} from "@plans-tracker/types"

/**
 * Routes for shopping list items.
 */
const shoppingItemsRoutes: FastifyPluginAsync = async (fastify) => {
  const itemsService = new ShoppingItemsService(fastify.prisma)
  const sendService = new SendListService(fastify.prisma)
  const templateService = new ShoppingListTemplateService(fastify.prisma)

  // List all shopping items
  fastify.get<{
    Params: { listId: string }
  }>("/:listId/shopping-items", async (req) => {
    const user = getAuthUser(req)
    return itemsService.listItems(user.id, req.params.listId)
  })

  // Create a shopping item
  fastify.post<{
    Params: { listId: string }
    Body: CreateShoppingItemDto
  }>("/:listId/shopping-items", async (req, reply) => {
    const user = getAuthUser(req)
    const item = await itemsService.createItem(user.id, req.params.listId, req.body)
    return reply.status(201).send(item)
  })

  // Update a shopping item
  fastify.patch<{
    Params: { listId: string; itemId: string }
    Body: UpdateShoppingItemDto
  }>("/:listId/shopping-items/:itemId", async (req) => {
    const user = getAuthUser(req)
    return itemsService.updateItem(user.id, req.params.listId, req.params.itemId, req.body)
  })

  // Toggle a shopping item
  fastify.post<{
    Params: { listId: string; itemId: string }
    Body: ToggleItemDto
  }>("/:listId/shopping-items/:itemId/toggle", async (req) => {
    const user = getAuthUser(req)
    return itemsService.toggleItem(
      user.id,
      req.params.listId,
      req.params.itemId,
      req.body.isChecked
    )
  })

  // Delete a shopping item
  fastify.delete<{
    Params: { listId: string; itemId: string }
  }>("/:listId/shopping-items/:itemId", async (req) => {
    const user = getAuthUser(req)
    return itemsService.removeItem(user.id, req.params.listId, req.params.itemId)
  })

  // Reorder shopping items
  fastify.post<{
    Params: { listId: string }
    Querystring: { checked?: string }
    Body: ReorderItemsDto
  }>("/:listId/shopping-items/reorder", async (req) => {
    const user = getAuthUser(req)
    return itemsService.reorderItems(
      user.id,
      req.params.listId,
      req.body.orderedIds,
      req.query.checked === "true"
    )
  })

  // Apply templates to shopping list
  fastify.post<{
    Params: { listId: string }
    Body: ApplyTemplatesDto
  }>("/:listId/shopping-items/apply-templates", async (req) => {
    const user = getAuthUser(req)
    return templateService.applyTemplates(user.id, req.params.listId, req.body.templateIds)
  })

  // Send list to family members
  fastify.post<{
    Params: { listId: string }
    Body: SendListDto
  }>("/:listId/send", async (req) => {
    const user = getAuthUser(req)
    return sendService.sendList(user.id, req.params.listId, req.body)
  })
}

export default shoppingItemsRoutes
