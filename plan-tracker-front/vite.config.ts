import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv } from "vite"
import vueDevTools from "vite-plugin-vue-devtools"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const isDev = mode === "development"

  return {
    plugins: [vue(), ...(isDev && env.VITE_ENABLE_DEVTOOLS ? [vueDevTools()] : []), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    server: {
      host: isDev ? "0.0.0.0" : undefined,
      port: isDev ? 5173 : undefined,
      strictPort: isDev,
      allowedHosts: isDev ? true : env.VITE_HOST ? [env.VITE_HOST] : [],
      proxy: isDev
        ? {
            "/api": {
              target: env.VITE_BACKEND_URL ?? "http://localhost:3000",
              changeOrigin: true
            }
          }
        : undefined,
      hmr: isDev
        ? {
            port: 5173,
            clientPort: 443
          }
        : false
    },
    build: {
      minify: isDev ? false : "esbuild",
      sourcemap: isDev,
      rollupOptions: {
        output: {
          manualChunks: isDev
            ? undefined
            : {
                vendor: ["vue", "vue-router", "pinia"],
                telegram: ["@twa-dev/sdk"]
              }
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    }
  }
})
