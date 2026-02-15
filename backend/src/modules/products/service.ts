import { Prisma, PrismaClient } from "@prisma/client"
import { ServiceError } from "@/common/errors"
import { FamilyAccessService } from "@/common/services"
import { mergePersonalAndFamily } from "@/common/utils/merge-personal-and-family"
import { normalizeKey } from "@/common/utils/normalize-key"
import { PRICE_TYPE, SORT_ORDER } from "@plans-tracker/types"
import type { CreateProductDto, UpdateProductDto } from "@plans-tracker/types"

export class ProductsService {
  private readonly familyAccess: FamilyAccessService

  constructor(private readonly prisma: PrismaClient) {
    this.familyAccess = new FamilyAccessService(prisma)
  }

  private validateDefaultPrice(dto: {
    defaultPriceType?: PRICE_TYPE | null
    defaultPriceCurrency?: string | null
    defaultPriceMin?: number | null
    defaultPriceMax?: number | null
  }) {
    const type = dto.defaultPriceType ?? PRICE_TYPE.NONE

    if (type === PRICE_TYPE.NONE) return
    if (!dto.defaultPriceCurrency) throw ServiceError.forbidden("defaultPriceCurrency is required")

    if (type === PRICE_TYPE.EXACT) {
      if (dto.defaultPriceMin == null) throw new Error("Forbidden:defaultPriceMin is required")
      if (dto.defaultPriceMax != null && dto.defaultPriceMax !== dto.defaultPriceMin) {
        throw ServiceError.forbidden(
          "For exact price, defaultPriceMax must be omitted or equal to defaultPriceMin"
        )
      }
      return
    }

    if (type === PRICE_TYPE.RANGE) {
      if (dto.defaultPriceMin == null) throw ServiceError.forbidden("defaultPriceMin is required")
      if (dto.defaultPriceMax == null) throw ServiceError.forbidden("defaultPriceMax is required")
      if (dto.defaultPriceMax < dto.defaultPriceMin) {
        throw ServiceError.forbidden("defaultPriceMax must be >= defaultPriceMin")
      }
    }
  }

  private async requireOwnedProduct(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product) throw ServiceError.notFound("Product not found")
    if (product.ownerId !== userId) throw ServiceError.forbidden("Only owner can modify")
    return product
  }

  private async assertOwnedLocations(userId: string, locationIds: string[]) {
    if (locationIds.length === 0) return

    const count = await this.prisma.location.count({
      where: {
        ownerId: userId,
        id: { in: locationIds }
      }
    })

    if (count !== locationIds.length) {
      throw ServiceError.forbidden("Default locations must belong to current user")
    }
  }

  private toDto(product: Prisma.ProductGetPayload<{ include: { defaultLocations: true } }>) {
    const defaultLocationIds = (product.defaultLocations ?? []).map((x) => x.locationId)
    return {
      id: product.id,
      title: product.title,
      normalizedKey: product.normalizedKey,
      note: product.note,
      defaultPriceType: product.defaultPriceType,
      defaultPriceCurrency: product.defaultPriceCurrency,
      defaultPriceMin: product.defaultPriceMin,
      defaultPriceMax: product.defaultPriceMax,
      ownerId: product.ownerId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      defaultLocationIds,
      quantityUnit: product.quantityUnit
    }
  }

  async listPersonal(userId: string) {
    const products = await this.prisma.product.findMany({
      where: { ownerId: userId },
      include: { defaultLocations: true },
      orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
    })

    return products.map((p) => this.toDto(p))
  }

  async listForFamilySelect(userId: string, familyId: string) {
    await this.familyAccess.requireFamilyMember(userId, familyId)

    const [personal, shared] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { ownerId: userId },
        include: { defaultLocations: true },
        orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
      }),
      this.prisma.productFamilyShare.findMany({
        where: { familyId, product: { ownerId: { not: userId } } },
        include: { product: { include: { defaultLocations: true } } },
        orderBy: [{ createdAt: SORT_ORDER.ASC }]
      })
    ])

    const personalDto = personal.map((p) => this.toDto(p))
    const familyDto = shared.map((x) => this.toDto(x.product))

    return mergePersonalAndFamily({ personal: personalDto, family: familyDto })
  }

  async create(userId: string, dto: CreateProductDto) {
    const defaultLocationIds = dto.defaultLocationIds ?? []
    await this.assertOwnedLocations(userId, defaultLocationIds as string[])

    this.validateDefaultPrice(dto)

    const defaultPriceType = dto.defaultPriceType ?? PRICE_TYPE.NONE

    const product = await this.prisma.product.create({
      data: {
        ownerId: userId,
        title: dto.title,
        normalizedKey: normalizeKey(dto.title),
        note: dto.note,
        defaultPriceType,
        defaultPriceCurrency:
          defaultPriceType === PRICE_TYPE.NONE ? null : (dto.defaultPriceCurrency ?? null),
        defaultPriceMin:
          defaultPriceType === PRICE_TYPE.NONE ? null : (dto.defaultPriceMin ?? null),
        defaultPriceMax:
          defaultPriceType === PRICE_TYPE.RANGE
            ? (dto.defaultPriceMax ?? null)
            : defaultPriceType === PRICE_TYPE.EXACT
              ? (dto.defaultPriceMin ?? null)
              : null,
        defaultLocations: {
          create: defaultLocationIds.map((locationId: string) => ({
            locationId
          }))
        },
        quantityUnit: dto.quantityUnit
      },
      include: { defaultLocations: true }
    })

    return this.toDto(product)
  }

  async update(userId: string, productId: string, dto: UpdateProductDto) {
    await this.requireOwnedProduct(userId, productId)

    if (dto.defaultLocationIds) {
      await this.assertOwnedLocations(userId, dto.defaultLocationIds)
    }

    if (
      dto.defaultPriceType != null ||
      dto.defaultPriceCurrency != null ||
      dto.defaultPriceMin != null ||
      dto.defaultPriceMax != null
    ) {
      this.validateDefaultPrice(dto)
    }

    const defaultPriceType = dto.defaultPriceType

    const product = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (dto.defaultLocationIds) {
        await tx.productDefaultLocation.deleteMany({ where: { productId } })
        if (dto.defaultLocationIds.length > 0) {
          await tx.productDefaultLocation.createMany({
            data: dto.defaultLocationIds.map((locationId: string) => ({
              productId,
              locationId
            }))
          })
        }
      }

      return tx.product.update({
        where: { id: productId },
        data: {
          title: dto.title ?? undefined,
          normalizedKey: dto.title && dto.title !== null ? normalizeKey(dto.title) : undefined,
          note: dto.note,
          defaultPriceType: defaultPriceType === null ? undefined : defaultPriceType,
          defaultPriceCurrency:
            defaultPriceType === PRICE_TYPE.NONE
              ? null
              : defaultPriceType
                ? (dto.defaultPriceCurrency ?? null)
                : undefined,
          defaultPriceMin:
            defaultPriceType === PRICE_TYPE.NONE
              ? null
              : defaultPriceType
                ? (dto.defaultPriceMin ?? null)
                : undefined,
          defaultPriceMax:
            defaultPriceType === PRICE_TYPE.RANGE
              ? (dto.defaultPriceMax ?? null)
              : defaultPriceType === PRICE_TYPE.EXACT
                ? (dto.defaultPriceMin ?? null)
                : defaultPriceType === PRICE_TYPE.NONE
                  ? null
                  : undefined,
          quantityUnit: dto.quantityUnit
        },
        include: { defaultLocations: true }
      })
    })

    return this.toDto(product)
  }

  async remove(userId: string, productId: string) {
    await this.requireOwnedProduct(userId, productId)

    await this.prisma.$transaction(async (tx) => {
      await tx.shoppingListItem.deleteMany({ where: { productId } })
      await tx.templateItem.updateMany({
        where: { productId },
        data: { productId: null }
      })
      await tx.productDefaultLocation.deleteMany({ where: { productId } })
      await tx.productFamilyShare.deleteMany({ where: { productId } })
      await tx.product.delete({ where: { id: productId } })
    })

    return { ok: true }
  }

  async removeMany(userId: string, productIds: string[]) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, ownerId: userId }
    })

    if (products.length !== productIds.length) {
      throw ServiceError.forbidden("Some products not found or not owned by you")
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.shoppingListItem.deleteMany({ where: { productId: { in: productIds } } })
      await tx.templateItem.updateMany({
        where: { productId: { in: productIds } },
        data: { productId: null }
      })
      await tx.productDefaultLocation.deleteMany({ where: { productId: { in: productIds } } })
      await tx.productFamilyShare.deleteMany({ where: { productId: { in: productIds } } })
      await tx.product.deleteMany({ where: { id: { in: productIds } } })
    })

    return { ok: true }
  }

  async share(userId: string, productId: string, familyId: string) {
    await this.requireOwnedProduct(userId, productId)
    await this.familyAccess.requireFamilyAdmin(userId, familyId)

    return this.prisma.productFamilyShare.upsert({
      where: { familyId_productId: { familyId, productId } },
      create: { familyId, productId },
      update: {}
    })
  }

  async unshare(userId: string, productId: string, familyId: string) {
    await this.requireOwnedProduct(userId, productId)

    return this.prisma.productFamilyShare.delete({
      where: { familyId_productId: { familyId, productId } }
    })
  }

  async setSharing(userId: string, familyId: string, productIds: string[]) {
    await this.familyAccess.requireFamilyAdmin(userId, familyId)

    const owned = await this.prisma.product.findMany({
      where: { ownerId: userId, id: { in: productIds } },
      select: { id: true }
    })

    const allowedIds = owned.map((x) => x.id)

    await this.prisma.$transaction(async (tx) => {
      await tx.productFamilyShare.deleteMany({
        where: { familyId, product: { ownerId: userId } }
      })

      if (allowedIds.length === 0) return

      await tx.productFamilyShare.createMany({
        data: allowedIds.map((productId) => ({ familyId, productId }))
      })
    })

    return { ok: true }
  }

  async reorder(userId: string, orderedIds: string[]) {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.product.updateMany({
          where: { id, ownerId: userId },
          data: { sortIndex: index }
        })
      )
    )

    return { ok: true }
  }
}
