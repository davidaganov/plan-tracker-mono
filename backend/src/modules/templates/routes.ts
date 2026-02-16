import { FastifyPluginAsync } from "fastify"
import { TemplatesService } from "@/modules/templates/service"
import { getAuthUser } from "@/common/hooks"
import type {
  CreateTemplateDto,
  UpdateTemplateDto,
  AddTemplateItemsDto,
  UpdateTemplateItemDto,
  ShareTemplateDto,
  SetTemplateSharingDto,
  ReorderItemsDto,
  BatchDeleteDto
} from "@plans-tracker/types"

const schema = {
  tags: ["Templates"],
  summary: "Template management",
  description:
    "Endpoints for managing templates, including CRUD operations, sharing with families, and reordering.",
  response: {
    200: {
      type: "object"
    }
  }
}

/**
 * Routes for template management.
 */
const templatesRoutes: FastifyPluginAsync = async (fastify) => {
  const templatesService = new TemplatesService(fastify.prisma)

  // List templates
  fastify.get<{
    Querystring: { familyId?: string }
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    if (req.query.familyId) {
      return templatesService.listForFamilySelect(user.id, req.query.familyId)
    }
    return templatesService.listPersonal(user.id)
  })

  // Get a template
  fastify.get<{
    Params: { templateId: string }
  }>("/:templateId", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.get(user.id, req.params.templateId)
  })

  // Create a template
  fastify.post<{
    Body: CreateTemplateDto
  }>("/", { schema }, async (req, reply) => {
    const user = getAuthUser(req)
    const template = await templatesService.create(user.id, req.body)
    return reply.status(201).send(template)
  })

  // Update a template
  fastify.patch<{
    Params: { templateId: string }
    Body: UpdateTemplateDto
  }>("/:templateId", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.update(user.id, req.params.templateId, req.body)
  })

  // Delete a template
  fastify.delete<{
    Params: { templateId: string }
  }>("/:templateId", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.remove(user.id, req.params.templateId)
  })

  // Delete multiple templates
  fastify.delete<{
    Body: BatchDeleteDto
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.removeMany(user.id, req.body.ids)
  })

  // Add items to template
  fastify.post<{
    Params: { templateId: string }
    Body: AddTemplateItemsDto
  }>("/:templateId/items", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.addItems(user.id, req.params.templateId, req.body.productIds)
  })

  // Update template item
  fastify.patch<{
    Params: { templateId: string; itemId: string }
    Body: UpdateTemplateItemDto
  }>("/:templateId/items/:itemId", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.updateItem(user.id, req.params.templateId, req.params.itemId, req.body)
  })

  // Remove template item
  fastify.delete<{
    Params: { templateId: string; itemId: string }
  }>("/:templateId/items/:itemId", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.removeItem(user.id, req.params.templateId, req.params.itemId)
  })

  // Share template with a family
  fastify.post<{
    Params: { templateId: string }
    Body: ShareTemplateDto
  }>("/:templateId/share", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.share(user.id, req.params.templateId, req.body.familyId)
  })

  // Unshare template from a family
  fastify.post<{
    Params: { templateId: string }
    Body: ShareTemplateDto
  }>("/:templateId/unshare", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.unshare(user.id, req.params.templateId, req.body.familyId)
  })

  // Batch set template sharing
  fastify.post<{
    Body: SetTemplateSharingDto
  }>("/sharing", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.setSharing(user.id, req.body.familyId, req.body.templateIds)
  })

  // Reorder templates
  fastify.put<{
    Body: ReorderItemsDto
  }>("/reorder", { schema }, async (req) => {
    const user = getAuthUser(req)
    return templatesService.reorder(user.id, req.body.orderedIds)
  })
}

export default templatesRoutes
