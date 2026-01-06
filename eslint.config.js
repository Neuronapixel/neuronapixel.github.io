import js from '@eslint/js';
import globals from 'globals';
import vueEslintParser from 'vue-eslint-parser';
import typescriptEslintParser from '@typescript-eslint/parser';
import vuePlugin from 'eslint-plugin-vue';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

const tsFiles = ['**/*.{ts,tsx,cts,mts}'];
const vueFiles = ['**/*.vue'];
const vitestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
};

const tsConfigs = typescriptEslintPlugin.configs['flat/recommended'].map((config) => ({
  ...config,
  files: config.files ?? tsFiles,
}));

const tsVueConfigs = typescriptEslintPlugin.configs['flat/recommended'].map((config) => ({
  ...config,
  files: vueFiles,
  languageOptions: {
    ...config.languageOptions,
    parser: vueEslintParser,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      parser: typescriptEslintParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      extraFileExtensions: ['.vue'],
    },
  },
}));

export default [
  {
    ignores: ['docs/**', 'dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  ...tsConfigs,
  ...tsVueConfigs,
  {
    files: ['src/**/*.{js,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{config,conf}.{js,ts,cjs,mjs}', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    files: ['**/*.test.{js,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...vitestGlobals,
      },
    },
  },
];
