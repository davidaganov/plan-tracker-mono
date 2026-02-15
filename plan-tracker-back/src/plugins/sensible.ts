import sensible, { FastifySensibleOptions } from "@fastify/sensible"
import fp from "fastify-plugin"

export default fp<FastifySensibleOptions>(
  async (fastify) => {
    await fastify.register(sensible)
  },
  { name: "sensible" }
)
