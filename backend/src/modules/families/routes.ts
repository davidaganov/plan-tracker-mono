import { FastifyPluginAsync } from "fastify"
import { FamiliesService } from "@/modules/families/service"
import { getAuthUser } from "@/common/hooks"
import type {
  CreateFamilyDto,
  UpdateFamilyDto,
  SetFavoriteFamilyDto,
  UpdateMemberRoleDto,
  AcceptInviteDto,
  FamilyDto,
  FamilyBaseDto
} from "@plans-tracker/types"
import { schema, schemaByID } from "./families.schema"

/**
 *
 * schema for family management.
 */

/**
 * Routes for family management.
 */
const familiesRoutes: FastifyPluginAsync = async (fastify) => {
  const familiesService = new FamiliesService(fastify.prisma)

  // List my families
  fastify.get<{
    Reply: FamilyDto[]
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.listMyFamilies(user.id)
  })

  // Create a family
  fastify.post<{
    Body: CreateFamilyDto
    Reply: FamilyBaseDto
  }>("/", { schema }, async (req, reply) => {
    const user = getAuthUser(req)
    const family = await familiesService.createFamily(user.id, req.body.name)
    return reply.status(201).send(family)
  })

  // Set favorite family
  fastify.patch<{
    Body: SetFavoriteFamilyDto
  }>("/favorite", { schema }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.setFavoriteFamily(user.id, req.body.familyId)
  })

  // Get a family
  fastify.get<{
    Params: { familyId: string }
    Reply: FamilyBaseDto
  }>("/:familyId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    await familiesService.getMyMembershipOrThrow(user.id, req.params.familyId)
    return familiesService.getFamilyOrThrow(req.params.familyId)
  })

  // Update a family
  fastify.patch<{
    Params: { familyId: string }
    Body: UpdateFamilyDto
    Reply: FamilyBaseDto
  }>("/:familyId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    if (!req.body.name) {
      return familiesService.getFamilyOrThrow(req.params.familyId)
    }
    return familiesService.updateFamily(user.id, req.params.familyId, req.body.name)
  })

  // Delete a family
  fastify.delete<{
    Params: { familyId: string }
  }>("/:familyId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.deleteFamily(user.id, req.params.familyId)
  })

  // Leave a family
  fastify.post<{
    Params: { familyId: string }
  }>("/:familyId/leave", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.leaveFamily(user.id, req.params.familyId)
  })

  // List family members
  fastify.get<{
    Params: { familyId: string }
  }>("/:familyId/members", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.listMembers(user.id, req.params.familyId)
  })

  // Update member role
  fastify.patch<{
    Params: { familyId: string; userId: string }
    Body: UpdateMemberRoleDto
  }>("/:familyId/members/:userId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.updateMemberRole(
      user.id,
      req.params.familyId,
      req.params.userId,
      req.body.role
    )
  })

  // Remove member
  fastify.delete<{
    Params: { familyId: string; userId: string }
  }>("/:familyId/members/:userId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.removeMember(user.id, req.params.familyId, req.params.userId)
  })

  // Create invite
  fastify.post<{
    Params: { familyId: string }
  }>("/:familyId/invites", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.createInvite(user.id, req.params.familyId)
  })

  // Get invite info
  fastify.get<{
    Params: { token: string }
  }>("/invites/:token", { schema }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.getInviteInfo(user.id, req.params.token)
  })

  // Accept invite
  fastify.post<{
    Body: AcceptInviteDto
  }>("/invites/accept", { schema }, async (req) => {
    const user = getAuthUser(req)
    return familiesService.acceptInvite(user.id, req.body.token)
  })
}

export default familiesRoutes
