import { FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"
import { ServiceError } from "@/common/errors"

/**
 * Global error handler plugin.
 * Converts ServiceError instances to appropriate HTTP errors.
 */
const errorHandlerPlugin: FastifyPluginAsync = fp(
  async (server) => {
    server.setErrorHandler((error, _request, reply) => {
      // Handle ServiceError instances
      if (error instanceof ServiceError) {
        switch (error.type) {
          case "NotFound":
            return reply.notFound(error.message)
          case "Forbidden":
            return reply.forbidden(error.message)
          case "BadRequest":
            return reply.badRequest(error.message)
        }
      }

      // Handle legacy "Type:message" format for backwards compatibility
      if (error instanceof Error && error.message.includes(":")) {
        const [type, ...messageParts] = error.message.split(":")
        const message = messageParts.join(":").trim()

        if (type && message && ["NotFound", "Forbidden", "BadRequest"].includes(type)) {
          switch (type) {
            case "NotFound":
              return reply.notFound(message)
            case "Forbidden":
              return reply.forbidden(message)
            case "BadRequest":
              return reply.badRequest(message)
          }
        }
      }

      // Pass through other errors (including Fastify's httpErrors)
      throw error
    })
  },
  {
    name: "error-handler",
    dependencies: ["sensible"]
  }
)

export default errorHandlerPlugin
