import cors from "@fastify/cors"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import Fastify from "fastify"
import familiesRoutes from "@/modules/families/routes"
import listsRoutes from "@/modules/lists/routes/index"
import locationsRoutes from "@/modules/locations/routes"
import productsRoutes from "@/modules/products/routes"
import settingsRoutes from "@/modules/settings/routes"
import templatesRoutes from "@/modules/templates/routes"
import userRoutes from "@/modules/users/routes"
import authPlugin from "@/plugins/auth"
import errorHandlerPlugin from "@/plugins/error-handler"
import prismaPlugin from "@/plugins/prisma"
import sensiblePlugin from "@/plugins/sensible"
import telegramBotPlugin from "@/plugins/telegram-bot"

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: "error"
    }
  })

  // Register Core Plugins
  await app.register(cors, { origin: "*" })

  // Register Custom Plugins (Order Matters)
  await app.register(sensiblePlugin)
  await app.register(errorHandlerPlugin)
  await app.register(prismaPlugin)

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Plans Tracker API",
        description: "API documentation for Plans Tracker",
        version: "1.0.0"
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development"
        }
      ]
    }
  })

  await app.register(swaggerUi, {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false
    }
  })

  await app.register(authPlugin)
  await app.register(telegramBotPlugin)

  // Register Modules
  await app.register(settingsRoutes, { prefix: "/api/settings" })
  await app.register(userRoutes, { prefix: "/api/user" })
  await app.register(familiesRoutes, { prefix: "/api/families" })
  await app.register(listsRoutes, { prefix: "/api/lists" })
  await app.register(locationsRoutes, { prefix: "/api/locations" })
  await app.register(productsRoutes, { prefix: "/api/products" })
  await app.register(templatesRoutes, { prefix: "/api/templates" })

  app.get("/", async () => {
    return { status: "ok", message: "Plans Tracker Backend (Fastify)" }
  })

  return app
}
