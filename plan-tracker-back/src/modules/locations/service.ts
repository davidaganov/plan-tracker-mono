import { Prisma, PrismaClient } from "@prisma/client"
import { ServiceError } from "@/common/errors"
import { FamilyAccessService } from "@/common/services"
import { mergePersonalAndFamily } from "@/common/utils/merge-personal-and-family"
import { normalizeKey } from "@/common/utils/normalize-key"
import { SORT_ORDER } from "@plans-tracker/types"

export class LocationsService {
  private readonly familyAccess: FamilyAccessService

  constructor(private readonly prisma: PrismaClient) {
    this.familyAccess = new FamilyAccessService(prisma)
  }

  private async requireOwnedLocation(userId: string, locationId: string) {
    const loc = await this.prisma.location.findUnique({
      where: { id: locationId }
    })
    if (!loc) throw ServiceError.notFound("Location not found")
    if (loc.ownerId !== userId) throw ServiceError.forbidden("Only owner can modify")
    return loc
  }

  async listPersonal(userId: string) {
    return this.prisma.location.findMany({
      where: { ownerId: userId },
      orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
    })
  }

  async listForFamilySelect(userId: string, familyId: string) {
    await this.familyAccess.requireFamilyMember(userId, familyId)

    const [personal, shared] = await this.prisma.$transaction([
      this.prisma.location.findMany({
        where: { ownerId: userId },
        orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
      }),
      this.prisma.locationFamilyShare.findMany({
        where: { familyId, location: { ownerId: { not: userId } } },
        include: { location: true },
        orderBy: [{ createdAt: SORT_ORDER.ASC }]
      })
    ])

    const family = shared.map((x) => x.location)

    return mergePersonalAndFamily({ personal, family })
  }

  async create(userId: string, title: string, note?: string | null) {
    return this.prisma.location.create({
      data: {
        ownerId: userId,
        title,
        normalizedKey: normalizeKey(title),
        note
      }
    })
  }

  async update(userId: string, locationId: string, title?: string | null, note?: string | null) {
    await this.requireOwnedLocation(userId, locationId)

    return this.prisma.location.update({
      where: { id: locationId },
      data: {
        title: title ?? undefined,
        normalizedKey: title ? normalizeKey(title) : undefined,
        note: note
      }
    })
  }

  async remove(userId: string, locationId: string) {
    await this.requireOwnedLocation(userId, locationId)

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.shoppingItemLocation.deleteMany({ where: { locationId } })
      await tx.productDefaultLocation.deleteMany({ where: { locationId } })
      await tx.locationFamilyShare.deleteMany({ where: { locationId } })
      await tx.location.delete({ where: { id: locationId } })
    })

    return { ok: true }
  }

  async removeMany(userId: string, locationIds: string[]) {
    const locations = await this.prisma.location.findMany({
      where: { id: { in: locationIds }, ownerId: userId }
    })

    if (locations.length !== locationIds.length) {
      throw ServiceError.forbidden("Some locations not found or not owned by you")
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.shoppingItemLocation.deleteMany({ where: { locationId: { in: locationIds } } })
      await tx.productDefaultLocation.deleteMany({ where: { locationId: { in: locationIds } } })
      await tx.locationFamilyShare.deleteMany({ where: { locationId: { in: locationIds } } })
      await tx.location.deleteMany({ where: { id: { in: locationIds } } })
    })

    return { ok: true }
  }

  async share(userId: string, locationId: string, familyId: string) {
    await this.requireOwnedLocation(userId, locationId)
    await this.familyAccess.requireFamilyAdmin(userId, familyId)

    return this.prisma.locationFamilyShare.upsert({
      where: { familyId_locationId: { familyId, locationId } },
      create: { familyId, locationId },
      update: {}
    })
  }

  async unshare(userId: string, locationId: string, familyId: string) {
    await this.requireOwnedLocation(userId, locationId)

    return this.prisma.locationFamilyShare.delete({
      where: { familyId_locationId: { familyId, locationId } }
    })
  }

  async setSharing(userId: string, familyId: string, locationIds: string[]) {
    await this.familyAccess.requireFamilyAdmin(userId, familyId)

    const owned = await this.prisma.location.findMany({
      where: { ownerId: userId, id: { in: locationIds } },
      select: { id: true }
    })

    const allowedIds = owned.map((x) => x.id)

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.locationFamilyShare.deleteMany({
        where: { familyId, location: { ownerId: userId } }
      })

      if (allowedIds.length === 0) return

      await tx.locationFamilyShare.createMany({
        data: allowedIds.map((locationId) => ({ familyId, locationId }))
      })
    })

    return { ok: true }
  }

  async reorder(userId: string, orderedIds: string[]) {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.location.update({
          where: { id, ownerId: userId },
          data: { sortIndex: index }
        })
      )
    )

    return { ok: true }
  }
}
