import crypto from "node:crypto"
import { PrismaClient, Prisma } from "@prisma/client"
import { DEFAULT_USER_SETTINGS } from "@/modules/settings/defaults"
import { ServiceError } from "@/common/errors"
import { FAMILY_ROLE, type FamilyDto } from "@plans-tracker/types"

export class FamiliesService {
  constructor(private readonly prisma: PrismaClient) {}

  async listMyFamilies(userId: string): Promise<FamilyDto[]> {
    const members = await this.prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    const settings = await this.prisma.userSettings.findUnique({
      where: { userId }
    })

    return members.map((m) => ({
      ...m.family,
      myRole: m.role as FAMILY_ROLE,
      isFavorite: settings?.favoriteFamilyId === m.familyId
    }))
  }

  async getFamilyOrThrow(familyId: string) {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId }
    })
    if (!family) throw ServiceError.notFound("Family not found")
    return family
  }

  async getMyMembershipOrThrow(userId: string, familyId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })
    if (!member) throw ServiceError.forbidden("Not a family member")
    return member
  }

  async requireAdmin(userId: string, familyId: string) {
    const member = await this.getMyMembershipOrThrow(userId, familyId)
    if (member.role !== FAMILY_ROLE.ADMIN) throw ServiceError.forbidden("Admin role required")
    return member
  }

  async createFamily(userId: string, name: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const family = await tx.family.create({
        data: {
          name,
          createdById: userId,
          members: {
            create: {
              userId,
              role: FAMILY_ROLE.ADMIN
            }
          }
        }
      })

      return family
    })
  }

  async updateFamily(userId: string, familyId: string, name: string) {
    await this.requireAdmin(userId, familyId)

    return this.prisma.family.update({
      where: { id: familyId },
      data: { name }
    })
  }

  async setFavoriteFamily(userId: string, familyId?: string | null) {
    if (familyId) {
      await this.getMyMembershipOrThrow(userId, familyId)
    }

    return this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...DEFAULT_USER_SETTINGS,
        favoriteFamilyId: familyId ?? undefined
      },
      update: { favoriteFamilyId: familyId }
    })
  }

  async listMembers(userId: string, familyId: string) {
    await this.getMyMembershipOrThrow(userId, familyId)

    return this.prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            telegramId: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })
  }

  async updateMemberRole(
    userId: string,
    familyId: string,
    targetUserId: string,
    role: FAMILY_ROLE
  ) {
    await this.requireAdmin(userId, familyId)

    const target = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId: targetUserId } }
    })

    if (!target) throw ServiceError.notFound("Member not found")

    return this.prisma.familyMember.update({
      where: { familyId_userId: { familyId, userId: targetUserId } },
      data: { role }
    })
  }

  async removeMember(userId: string, familyId: string, targetUserId: string) {
    await this.requireAdmin(userId, familyId)

    if (userId === targetUserId) throw ServiceError.badRequest("Cannot remove yourself")

    const targetMember = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId: targetUserId } }
    })
    if (!targetMember) throw ServiceError.notFound("Member not found")

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.userSettings.updateMany({
        where: { userId: targetUserId, favoriteFamilyId: familyId },
        data: { favoriteFamilyId: null }
      })

      await tx.familyMember.delete({
        where: { familyId_userId: { familyId, userId: targetUserId } }
      })
    })

    return { ok: true }
  }

  async leaveFamily(userId: string, familyId: string) {
    const me = await this.getMyMembershipOrThrow(userId, familyId)

    const members = await this.prisma.familyMember.findMany({
      where: { familyId }
    })

    if (members.length === 1) throw ServiceError.badRequest("Cannot leave the only-member family")

    if (me.role === FAMILY_ROLE.ADMIN) {
      const otherAdmins = members.filter((m) => m.userId !== userId && m.role === FAMILY_ROLE.ADMIN)
      if (otherAdmins.length === 0) {
        throw ServiceError.badRequest("Admin cannot leave without another admin")
      }
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.userSettings.updateMany({
        where: { userId, favoriteFamilyId: familyId },
        data: { favoriteFamilyId: null }
      })

      await tx.familyMember.delete({
        where: { familyId_userId: { familyId, userId } }
      })
    })

    return { ok: true }
  }

  async deleteFamily(userId: string, familyId: string) {
    await this.requireAdmin(userId, familyId)

    const admins = await this.prisma.familyMember.findMany({
      where: { familyId, role: FAMILY_ROLE.ADMIN }
    })
    if (admins.length > 1)
      throw ServiceError.badRequest("Cannot delete family when multiple admins exist")

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.cleanupFamilyData(tx, familyId)
      await tx.family.delete({ where: { id: familyId } })
    })

    return { ok: true }
  }

  private async cleanupFamilyData(tx: Prisma.TransactionClient, familyId: string) {
    await tx.userSettings.updateMany({
      where: { favoriteFamilyId: familyId },
      data: { favoriteFamilyId: null }
    })

    await tx.familyInvite.deleteMany({ where: { familyId } })
    await tx.familyMember.deleteMany({ where: { familyId } })
    await tx.listFamilyShare.deleteMany({ where: { familyId } })
    await tx.productFamilyShare.deleteMany({ where: { familyId } })
    await tx.locationFamilyShare.deleteMany({ where: { familyId } })
    await tx.templateFamilyShare.deleteMany({ where: { familyId } })
  }

  async createInvite(userId: string, familyId: string) {
    await this.requireAdmin(userId, familyId)

    const token = crypto.randomBytes(24).toString("hex")

    return this.prisma.familyInvite.create({
      data: {
        familyId,
        createdById: userId,
        token
      },
      select: {
        id: true,
        familyId: true,
        createdById: true,
        token: true,
        createdAt: true
      }
    })
  }

  async acceptInvite(userId: string, token: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const invite = await tx.familyInvite.findUnique({ where: { token } })
      if (!invite) throw ServiceError.notFound("Invite not found")

      if (invite.usedAt || invite.usedById) throw ServiceError.badRequest("Invite already used")

      const existing = await tx.familyMember.findUnique({
        where: { familyId_userId: { familyId: invite.familyId, userId } }
      })

      if (existing) {
        return { ok: true, alreadyMember: true }
      }

      await tx.familyMember.create({
        data: {
          familyId: invite.familyId,
          userId,
          role: FAMILY_ROLE.READER
        }
      })

      await tx.familyInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date(), usedById: userId }
      })

      return { ok: true, alreadyMember: false }
    })
  }

  async getInviteInfo(userId: string, token: string) {
    const invite = await this.prisma.familyInvite.findUnique({
      where: { token },
      include: {
        family: { select: { id: true, name: true } }
      }
    })

    if (!invite) throw ServiceError.notFound("Invite not found")

    const existing = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId: invite.familyId, userId } }
    })

    return {
      token: invite.token,
      family: invite.family,
      isUsed: Boolean(invite.usedAt || invite.usedById),
      alreadyMember: Boolean(existing)
    }
  }
}
