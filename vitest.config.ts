import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Writes server/content.generated.ts from the files on disk before the tests import it
    globalSetup: ['tests/global-setup.ts']
  }
})
