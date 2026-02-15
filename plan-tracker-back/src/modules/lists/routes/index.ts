import { FastifyPluginAsync } from "fastify"
import listsRoutes from "@/modules/lists/routes/lists.routes"
import searchRoutes from "@/modules/lists/routes/search.routes"
import shoppingItemsRoutes from "@/modules/lists/routes/shopping-items.routes"
import taskItemsRoutes from "@/modules/lists/routes/task-items.routes"

const listsModuleRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(listsRoutes)
  await fastify.register(shoppingItemsRoutes)
  await fastify.register(taskItemsRoutes)
  await fastify.register(searchRoutes)
}

export default listsModuleRoutes
