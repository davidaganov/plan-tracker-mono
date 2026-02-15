import { PrismaClient } from "@prisma/client"
import { FamilyAccessService } from "@/common/services/family-access.service"

/**
 * Abstract base class for shareable entities (products, locations, templates).
 * Provides common sharing functionality to eliminate duplication across services.
 */
export abstract class BaseShareableService {
  protected readonly familyAccess: FamilyAccessService

  constructor(protected readonly prisma: PrismaClient) {
    this.familyAccess = new FamilyAccessService(prisma)
  }

  /**
   * Abstract method to get entity by ID - must be implemented by subclasses.
   */
  protected abstract getEntityOrThrow(
    userId: string,
    entityId: string
  ): Promise<{ ownerId: string; id: string }>

  /**
   * Verifies user owns the entity.
   * @throws ServiceError.forbidden if not owner
   */
  protected async requireOwned(
    userId: string,
    entityId: string
  ): Promise<{ ownerId: string; id: string }> {
    const entity = await this.getEntityOrThrow(userId, entityId)
    if (entity.ownerId !== userId) {
      throw new Error("Only owner can modify")
    }
    return entity
  }
}
