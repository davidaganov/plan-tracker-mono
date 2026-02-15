import "dotenv/config"
import { FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaClient } from "@prisma/client"

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const prismaPlugin: FastifyPluginAsync = fp(
  async (server, _options) => {
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL || "file:./dev.db"
    })

    const prisma = new PrismaClient({
      adapter,
      log: ["info", "warn", "error"]
    })

    await prisma.$connect()

    server.decorate("prisma", prisma)

    server.addHook("onClose", async (server) => {
      await server.prisma.$disconnect()
    })
  },
  { name: "prisma" }
)

export default prismaPlugin
