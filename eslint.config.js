import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import unicornPlugin from 'eslint-plugin-unicorn'
import prettierPlugin from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  // Global ignores
  {
    ignores: ['**/*.min.js', '**/dist/', 'node_modules/', '.vercel/']
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  prettierPlugin,
  {
    plugins: { import: importPlugin, unicorn: unicornPlugin },
    rules: {
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
      'prettier/prettier': 'warn'
    }
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser
    }
  }
])
