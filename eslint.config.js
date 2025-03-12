import vueEslintParser from "vue-eslint-parser";
import typescriptEslintParser from "@typescript-eslint/parser";
import vuePlugin from "eslint-plugin-vue";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.{js,ts,vue,tsx}"],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    plugins: {
      vue: vuePlugin,
      "@typescript-eslint": typescriptEslintPlugin
    },
    rules: {
      // Your custom rules here
    }
  },
  {
    files: [
      "**/__tests__/*.{js,ts,vue,tsx}",
      "**/tests/unit/**/*.spec.{js,ts,vue,tsx}"
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly"
      }
    }
  }
];
