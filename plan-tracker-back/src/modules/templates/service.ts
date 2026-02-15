import { Prisma, PrismaClient } from "@prisma/client"
import { ServiceError } from "@/common/errors"
import { FamilyAccessService } from "@/common/services"
import { mergePersonalAndFamily } from "@/common/utils/merge-personal-and-family"
import { normalizeKey } from "@/common/utils/normalize-key"
import { SORT_ORDER, PRICE_TYPE, type UpdateTemplateItemDto } from "@plans-tracker/types"

export class TemplatesService {
  private readonly familyAccess: FamilyAccessService

  constructor(private readonly prisma: PrismaClient) {
    this.familyAccess = new FamilyAccessService(prisma)
  }

  private async requireOwnedTemplate(userId: string, templateId: string) {
    const t = await this.prisma.template.findUnique({
      where: { id: templateId }
    })
    if (!t) throw ServiceError.notFound("Template not found")
    if (t.ownerId !== userId) throw ServiceError.forbidden("Only owner can modify")
    return t
  }

  private async ensureProductsOwned(userId: string, productIds: string[]) {
    if (productIds.length === 0) return

    const count = await this.prisma.product.count({
      where: { id: { in: productIds }, ownerId: userId }
    })

    if (count !== productIds.length)
      throw ServiceError.forbidden("Referenced products must be owned by current user")
  }

  private async autoShareTemplateDependencies(
    userId: string,
    familyId: string,
    templateId: string
  ) {
    const items = await this.prisma.templateItem.findMany({
      where: { templateId, productId: { not: null } },
      select: { productId: true }
    })

    const productIds = Array.from(
      new Set(items.map((x) => x.productId).filter(Boolean) as string[])
    )
    if (productIds.length === 0) return

    const owned = await this.prisma.product.findMany({
      where: { ownerId: userId, id: { in: productIds } },
      select: { id: true }
    })

    const ownedIds = owned.map((x) => x.id)
    if (ownedIds.length === 0) return

    await this.prisma.$transaction(
      ownedIds.map((productId) =>
        this.prisma.productFamilyShare.upsert({
          where: { familyId_productId: { familyId, productId } },
          create: { familyId, productId },
          update: {}
        })
      )
    )
  }

  private toDto(template: Prisma.TemplateGetPayload<{ include: { items: true } }>) {
    const tags = Array.isArray(template.tags)
      ? template.tags.filter((t): t is string => typeof t === "string")
      : []

    return {
      id: template.id,
      title: template.title,
      normalizedKey: template.normalizedKey,
      note: template.note,
      tags,
      ownerId: template.ownerId,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      items: (template.items ?? []).map((it) => ({
        id: it.id,
        sortIndex: it.sortIndex,
        productId: it.productId,
        title: it.title,
        quantity: it.quantity,
        priceType: it.priceType,
        priceCurrency: it.priceCurrency,
        priceMin: it.priceMin,
        priceMax: it.priceMax
      }))
    }
  }

  async listPersonal(userId: string) {
    const templates = await this.prisma.template.findMany({
      where: { ownerId: userId },
      include: { items: { orderBy: { sortIndex: SORT_ORDER.ASC } } },
      orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
    })

    return templates.map((t) => this.toDto(t))
  }

  async listForFamilySelect(userId: string, familyId: string) {
    await this.familyAccess.requireFamilyMember(userId, familyId)

    const [personal, shared] = await this.prisma.$transaction([
      this.prisma.template.findMany({
        where: { ownerId: userId },
        include: { items: { orderBy: { sortIndex: SORT_ORDER.ASC } } },
        orderBy: [{ sortIndex: SORT_ORDER.ASC }, { createdAt: SORT_ORDER.ASC }]
      }),
      this.prisma.templateFamilyShare.findMany({
        where: { familyId, template: { ownerId: { not: userId } } },
        include: {
          template: { include: { items: { orderBy: { sortIndex: SORT_ORDER.ASC } } } }
        },
        orderBy: [{ createdAt: SORT_ORDER.ASC }]
      })
    ])

    const personalDto = personal.map((t) => this.toDto(t))
    const familyDto = shared.map((x) => this.toDto(x.template))

    return mergePersonalAndFamily({ personal: personalDto, family: familyDto })
  }

  async get(userId: string, templateId: string) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
      include: { items: { orderBy: { sortIndex: SORT_ORDER.ASC } }, shares: true }
    })

    if (!template) throw ServiceError.notFound("Template not found")

    if (template.ownerId === userId) return this.toDto(template)

    const share = await this.prisma.templateFamilyShare.findFirst({
      where: {
        templateId,
        family: { members: { some: { userId } } }
      }
    })

    if (!share) throw ServiceError.forbidden("Access denied")

    return this.toDto(template)
  }

  async create(
    userId: string,
    dto: { title: string; note?: string | null; tags?: string[] | null }
  ) {
    const tags = dto.tags ?? []

    const template = await this.prisma.template.create({
      data: {
        ownerId: userId,
        title: dto.title,
        normalizedKey: normalizeKey(dto.title),
        note: dto.note,
        tags: tags ?? undefined
      },
      include: { items: { orderBy: { sortIndex: SORT_ORDER.ASC } } }
    })

    return this.toDto(template)
  }

  async update(
    userId: string,
    templateId: string,
    dto: { title?: string | null; note?: string | null; tags?: string[] | null }
  ) {
    await this.requireOwnedTemplate(userId, templateId)

    const template = await this.prisma.template.update({
      where: { id: templateId },
      data: {
        title: dto.title ?? undefined,
        normalizedKey: dto.title ? normalizeKey(dto.title) : undefined,
        note: dto.note,
        tags: dto.tags === null ? Prisma.JsonNull : (dto.tags ?? undefined)
      },
      include: { items: { orderBy: { sortIndex: SORT_ORDER.ASC } } }
    })

    return this.toDto(template)
  }

  async addItems(userId: string, templateId: string, productIds: string[]) {
    await this.requireOwnedTemplate(userId, templateId)
    await this.ensureProductsOwned(userId, productIds)

    const lastItem = await this.prisma.templateItem.findFirst({
      where: { templateId },
      orderBy: { sortIndex: SORT_ORDER.DESC }
    })

    const startOrder = (lastItem?.sortIndex ?? -1) + 1

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    await this.prisma.templateItem.createMany({
      data: productIds.map((productId, index) => {
        const product = productMap.get(productId)
        return {
          templateId,
          productId,
          title: product?.title ?? "",
          sortIndex: startOrder + index,
          quantity: 1,
          priceType: product?.defaultPriceType ?? PRICE_TYPE.NONE,
          priceCurrency: product?.defaultPriceCurrency,
          priceMin: product?.defaultPriceMin,
          priceMax: product?.defaultPriceMax
        }
      })
    })

    return this.get(userId, templateId)
  }

  async updateItem(userId: string, templateId: string, itemId: string, dto: UpdateTemplateItemDto) {
    await this.requireOwnedTemplate(userId, templateId)

    await this.prisma.templateItem.update({
      where: { id: itemId, templateId },
      data: {
        quantity: dto.quantity,
        priceType: dto.priceType,
        priceCurrency: dto.priceCurrency,
        priceMin: dto.priceMin,
        priceMax: dto.priceMax,
        sortIndex: dto.sortIndex
      }
    })

    return this.get(userId, templateId)
  }

  async removeItem(userId: string, templateId: string, itemId: string) {
    await this.requireOwnedTemplate(userId, templateId)

    await this.prisma.templateItem.delete({
      where: { id: itemId, templateId }
    })

    return this.get(userId, templateId)
  }

  async remove(userId: string, templateId: string) {
    await this.requireOwnedTemplate(userId, templateId)

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.templateFamilyShare.deleteMany({ where: { templateId } })
      await tx.templateItem.deleteMany({ where: { templateId } })
      await tx.template.delete({ where: { id: templateId } })
    })

    return { ok: true }
  }

  async removeMany(userId: string, templateIds: string[]) {
    const templates = await this.prisma.template.findMany({
      where: { id: { in: templateIds }, ownerId: userId }
    })

    if (templates.length !== templateIds.length) {
      throw ServiceError.forbidden("Some templates not found or not owned by you")
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.templateFamilyShare.deleteMany({ where: { templateId: { in: templateIds } } })
      await tx.templateItem.deleteMany({ where: { templateId: { in: templateIds } } })
      await tx.template.deleteMany({ where: { id: { in: templateIds } } })
    })

    return { ok: true }
  }

  async share(userId: string, templateId: string, familyId: string) {
    await this.requireOwnedTemplate(userId, templateId)
    await this.familyAccess.requireFamilyAdmin(userId, familyId)

    const share = await this.prisma.templateFamilyShare.upsert({
      where: { familyId_templateId: { familyId, templateId } },
      create: { familyId, templateId },
      update: {}
    })

    await this.autoShareTemplateDependencies(userId, familyId, templateId)

    return share
  }

  async unshare(userId: string, templateId: string, familyId: string) {
    await this.requireOwnedTemplate(userId, templateId)

    return this.prisma.templateFamilyShare.delete({
      where: { familyId_templateId: { familyId, templateId } }
    })
  }

  async setSharing(userId: string, familyId: string, templateIds: string[]) {
    await this.familyAccess.requireFamilyAdmin(userId, familyId)

    const owned = await this.prisma.template.findMany({
      where: { ownerId: userId, id: { in: templateIds } },
      select: { id: true }
    })

    const allowedIds = owned.map((x) => x.id)

    await this.prisma.$transaction(async (tx) => {
      await tx.templateFamilyShare.deleteMany({
        where: { familyId, template: { ownerId: userId } }
      })

      if (allowedIds.length > 0) {
        await tx.templateFamilyShare.createMany({
          data: allowedIds.map((templateId) => ({ familyId, templateId }))
        })
      }

      if (allowedIds.length > 0) {
        const deps = await tx.templateItem.findMany({
          where: { templateId: { in: allowedIds }, productId: { not: null } },
          select: { productId: true }
        })

        const productIds = Array.from(
          new Set(deps.map((d) => d.productId).filter(Boolean) as string[])
        )
        if (productIds.length === 0) return

        const ownedProducts = await tx.product.findMany({
          where: { ownerId: userId, id: { in: productIds } },
          select: { id: true }
        })

        const ownedProductIds = ownedProducts.map((p) => p.id)
        if (ownedProductIds.length === 0) return

        await Promise.all(
          ownedProductIds.map((productId) =>
            tx.productFamilyShare.upsert({
              where: { familyId_productId: { familyId, productId } },
              create: { familyId, productId },
              update: {}
            })
          )
        )
      }
    })

    return { ok: true }
  }

  async reorder(userId: string, orderedIds: string[]) {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.template.update({
          where: { id, ownerId: userId },
          data: { sortIndex: index }
        })
      )
    )

    return { ok: true }
  }
}
