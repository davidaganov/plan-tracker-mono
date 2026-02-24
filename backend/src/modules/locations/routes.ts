import { FastifyPluginAsync } from "fastify"
import { LocationsService } from "@/modules/locations/service"
import { getAuthUser } from "@/common/hooks"
import type {
  CreateLocationDto,
  UpdateLocationDto,
  ShareLocationDto,
  SetLocationSharingDto,
  ReorderItemsDto,
  BatchDeleteDto
} from "@plans-tracker/types"
import { schema, schemaByID } from "./locations.schema"

/**
 * Routes for location management.
 */
const locationsRoutes: FastifyPluginAsync = async (fastify) => {
  const locationsService = new LocationsService(fastify.prisma)

  // List locations
  fastify.get<{
    Querystring: { familyId?: string }
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    if (req.query.familyId) {
      return locationsService.listForFamilySelect(user.id, req.query.familyId)
    }
    return locationsService.listPersonal(user.id)
  })

  // Create a location
  fastify.post<{
    Body: CreateLocationDto
  }>("/", { schema }, async (req, reply) => {
    const user = getAuthUser(req)
    const location = await locationsService.create(user.id, req.body.title, req.body.note)
    return reply.status(201).send(location)
  })

  // Update a location
  fastify.patch<{
    Params: { locationId: string }
    Body: UpdateLocationDto
  }>("/:locationId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return locationsService.update(user.id, req.params.locationId, req.body.title, req.body.note)
  })

  // Delete a location
  fastify.delete<{
    Params: { locationId: string }
  }>("/:locationId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return locationsService.remove(user.id, req.params.locationId)
  })

  // Delete multiple locations
  fastify.delete<{
    Body: BatchDeleteDto
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    return locationsService.removeMany(user.id, req.body.ids)
  })

  // Share location with a family
  fastify.post<{
    Params: { locationId: string }
    Body: ShareLocationDto
  }>("/:locationId/share", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return locationsService.share(user.id, req.params.locationId, req.body.familyId)
  })

  // Unshare location from a family
  fastify.post<{
    Params: { locationId: string }
    Body: ShareLocationDto
  }>("/:locationId/unshare", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return locationsService.unshare(user.id, req.params.locationId, req.body.familyId)
  })

  // Batch set location sharing
  fastify.post<{
    Body: SetLocationSharingDto
  }>("/sharing", { schema }, async (req) => {
    const user = getAuthUser(req)
    return locationsService.setSharing(user.id, req.body.familyId, req.body.locationIds)
  })

  // Reorder locations
  fastify.put<{
    Body: ReorderItemsDto
  }>("/reorder", { schema }, async (req) => {
    const user = getAuthUser(req)
    return locationsService.reorder(user.id, req.body.orderedIds)
  })
}

export default locationsRoutes
