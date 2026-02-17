import { FastifyPluginAsync } from "fastify"
import { ProductsService } from "@/modules/products/service"
import { getAuthUser } from "@/common/hooks"
import type {
  CreateProductDto,
  UpdateProductDto,
  ShareProductDto,
  SetProductSharingDto,
  ReorderItemsDto,
  BatchDeleteDto
} from "@plans-tracker/types"
import { schema, schemaByID } from "./products.schema"

/**
 * Routes for product management.
 */
const productsRoutes: FastifyPluginAsync = async (fastify) => {
  const productsService = new ProductsService(fastify.prisma)

  // List products
  fastify.get<{
    Querystring: { familyId?: string }
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    if (req.query.familyId) {
      return productsService.listForFamilySelect(user.id, req.query.familyId)
    }
    return productsService.listPersonal(user.id)
  })

  // Create a product
  fastify.post<{
    Body: CreateProductDto
  }>("/", { schema }, async (req, reply) => {
    const user = getAuthUser(req)
    const product = await productsService.create(user.id, req.body)
    return reply.status(201).send(product)
  })

  // Update a product
  fastify.patch<{
    Params: { productId: string }
    Body: UpdateProductDto
  }>("/:productId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return productsService.update(user.id, req.params.productId, req.body)
  })

  // Delete a product
  fastify.delete<{
    Params: { productId: string }
  }>("/:productId", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return productsService.remove(user.id, req.params.productId)
  })

  // Delete multiple products
  fastify.delete<{
    Body: BatchDeleteDto
  }>("/", { schema }, async (req) => {
    const user = getAuthUser(req)
    return productsService.removeMany(user.id, req.body.ids)
  })

  // Share product with a family
  fastify.post<{
    Params: { productId: string }
    Body: ShareProductDto
  }>("/:productId/share", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return productsService.share(user.id, req.params.productId, req.body.familyId)
  })

  // Unshare product from a family
  fastify.post<{
    Params: { productId: string }
    Body: ShareProductDto
  }>("/:productId/unshare", { schema: schemaByID }, async (req) => {
    const user = getAuthUser(req)
    return productsService.unshare(user.id, req.params.productId, req.body.familyId)
  })

  // Batch set product sharing
  fastify.post<{
    Body: SetProductSharingDto
  }>("/sharing", { schema }, async (req) => {
    const user = getAuthUser(req)
    return productsService.setSharing(user.id, req.body.familyId, req.body.productIds)
  })

  // Reorder products
  fastify.put<{
    Body: ReorderItemsDto
  }>("/reorder", { schema }, async (req) => {
    const user = getAuthUser(req)
    return productsService.reorder(user.id, req.body.orderedIds)
  })
}

export default productsRoutes
