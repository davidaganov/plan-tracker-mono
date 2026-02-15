import { fileURLToPath } from "node:url"
import { configDefaults, defineConfig, mergeConfig } from "vitest/config"
import viteConfig from "./vite.config"

const resolvedViteConfig =
  typeof viteConfig === "function" ? viteConfig({ mode: "test", command: "serve" }) : viteConfig

export default defineConfig(
  mergeConfig(resolvedViteConfig as any, {
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url))
    }
  })
)
