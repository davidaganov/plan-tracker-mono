import { PrismaClient, List, ListFamilyShare } from "@prisma/client"
import { ServiceError } from "@/common/errors"
import { ACCESS_LEVEL, FAMILY_ROLE } from "@plans-tracker/types"

type ListWithShares = List & { familyShares: ListFamilyShare[] }

/**
 * Service for checking list access permissions.
 */
export class ListsAccessService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Gets a list by ID or throws NotFound error.
   */
  async getListOrThrow(listId: string): Promise<ListWithShares> {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { familyShares: true }
    })

    if (!list) {
      throw ServiceError.notFound("List not found")
    }
    return list
  }

  /**
   * Gets user's role in a family, or null if not a member.
   */
  async getUserFamilyRole(userId: string, familyId: string): Promise<FAMILY_ROLE | null> {
    const member = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })

    return (member?.role as FAMILY_ROLE) ?? null
  }

  /**
   * Asserts user has access to a list.
   * Returns the list if access is granted, throws Forbidden otherwise.
   */
  async assertAccess(
    userId: string,
    listId: string,
    access: ACCESS_LEVEL
  ): Promise<ListWithShares> {
    const list = await this.getListOrThrow(listId)

    // Owner always has access (full read/write)
    if (list.ownerId === userId) {
      return list
    }

    // No shares means only owner can access
    if (list.familyShares.length === 0) {
      throw ServiceError.forbidden("Access denied: Private list")
    }

    // Optimization: Fetch all relevant family memberships in one query
    const familyIds = list.familyShares.map((s) => s.familyId)
    const memberships = await this.prisma.familyMember.findMany({
      where: {
        userId,
        familyId: { in: familyIds }
      }
    })

    // Map familyId -> role
    const userRoles = new Map<string, string>()
    for (const m of memberships) {
      userRoles.set(m.familyId, m.role)
    }

    // Check if user has sufficient role in ANY of the shared families
    for (const share of list.familyShares) {
      const role = userRoles.get(share.familyId)
      if (!role) continue

      // Read access: any member can read
      if (access === ACCESS_LEVEL.READ) {
        return list
      }

      // Write access: check if admin
      if (access === ACCESS_LEVEL.WRITE && role === FAMILY_ROLE.ADMIN) {
        return list
      }
    }

    throw ServiceError.forbidden(
      access === ACCESS_LEVEL.WRITE ? "Write access requires family admin role" : "Access denied"
    )
  }
}
