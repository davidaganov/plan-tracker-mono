import "dotenv/config"
import { buildApp } from "@/app"

const start = async () => {
  const app = await buildApp()

  try {
    const port = parseInt(process.env.PORT || "3000", 10)
    await app.listen({ port, host: "0.0.0.0" })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start().catch((err) => {
  console.error("Critical error during startup:", err)
  process.exit(1)
})
