import { PrismaClient, FamilyMember } from "@prisma/client"
import { ServiceError } from "@/common/errors"
import { FAMILY_ROLE } from "@plans-tracker/types"

/**
 * Centralized service for family access control checks.
 * Eliminates duplication across ProductsService, LocationsService, TemplatesService.
 */
export class FamilyAccessService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Verifies user is a member of the family.
   * @throws ServiceError.forbidden if not a member
   */
  async requireFamilyMember(userId: string, familyId: string): Promise<FamilyMember> {
    const member = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })

    if (!member) throw ServiceError.forbidden("Not a family member")
    return member
  }

  /**
   * Verifies user is an admin of the family.
   * @throws ServiceError.forbidden if not an admin
   */
  async requireFamilyAdmin(userId: string, familyId: string): Promise<FamilyMember> {
    const member = await this.requireFamilyMember(userId, familyId)
    if (member.role !== FAMILY_ROLE.ADMIN) throw ServiceError.forbidden("Admin role required")
    return member
  }
}
