import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import unicornPlugin from 'eslint-plugin-unicorn'
import prettierPlugin from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  {
    ignores: [
      // Local files that git ignores, a checkout of the repository in .claude/worktrees/ among them
      '.claude/',
      '**/dist/',
      '.vercel/',
      // Written by build/generate-content.js
      'server/content.generated.ts'
    ]
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  prettierPlugin,
  {
    plugins: { import: importPlugin, unicorn: unicornPlugin },
    rules: {
      'import/no-unassigned-import': 'error',
      'prettier/prettier': 'warn',
      'unicorn/prefer-node-protocol': 'error'
    }
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: { ...globals.node }
    }
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
      parser: tseslint.parser
    }
  },
  {
    files: ['build/**'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off'
    }
  },
  // server/ and api/ — the TypeScript sources of the deployed function
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['server/**/*.ts', 'api/**/*.ts']
  })),
  {
    files: ['server/**/*.ts', 'api/**/*.ts'],
    rules: {
      // stdout belongs to the protocol on a stdio transport; diagnostics go to stderr
      'no-console': ['error', { allow: ['error', 'warn'] }]
    }
  }
])
