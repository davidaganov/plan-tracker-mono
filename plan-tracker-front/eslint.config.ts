import skipFormatting from "@vue/eslint-config-prettier/skip-formatting"
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript"
import configPrettier from "eslint-config-prettier"
import pluginPrettier from "eslint-plugin-prettier"
import pluginVue from "eslint-plugin-vue"
import { globalIgnores } from "eslint/config"

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"]
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  skipFormatting,
  configPrettier,

  {
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      // Vue rules
      "vue/multi-word-component-names": "off",
      "vue/no-multiple-template-root": "off",
      "vue/valid-v-slot": ["error", { allowModifiers: true }],
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/block-order": [
        "error",
        {
          order: ["script", "template", "style"]
        }
      ],
      "vue/attributes-order": [
        "error",
        {
          order: [
            "DEFINITION",
            "LIST_RENDERING",
            "CONDITIONALS",
            "RENDER_MODIFIERS",
            "TWO_WAY_BINDING",
            "OTHER_DIRECTIVES",
            "SLOT",
            "CONTENT",
            "OTHER_ATTR",
            "UNIQUE",
            "GLOBAL",
            "EVENTS"
          ],
          alphabetical: false
        }
      ],

      // Prettier rules
      "prettier/prettier": ["error", { endOfLine: "auto" }],

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/unified-signatures": "off",
      "@typescript-eslint/consistent-type-imports": "off"
    }
  }
)
