import { FastifyRequest, FastifyReply } from "fastify"

/**
 * Pre-handler hook that ensures request has authenticated user.
 * Use this in route options: { preHandler: [requireAuth] }
 */
export async function requireAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!request.user) {
    throw request.server.httpErrors.unauthorized("Authentication required")
  }
}

/**
 * Helper to get authenticated user from request.
 * Throws if user is not authenticated.
 */
export function getAuthUser(request: FastifyRequest): NonNullable<FastifyRequest["user"]> {
  if (!request.user) {
    throw request.server.httpErrors.unauthorized("Authentication required")
  }
  return request.user
}
