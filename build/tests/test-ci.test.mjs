// `pnpm test:ci` runs what CI runs. A check that is added to .github/workflows/ci.yml and
// not to the `test:ci` script makes a local pass say less than it claims. Run via
// `pnpm build:test`.

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFile, root } from './helpers.mjs'

// What CI runs and `test:ci` does not, with the reason
const NOT_LOCAL = {
  install: 'the dependencies are installed',
  audit: 'reports only; `check:pnpm` is the audit that fails the job',
  'docs:links':
    'the external URLs, which a job that does not block checks; `docs:links:offline` is the rest'
}

const { scripts } = JSON.parse(readFile(root, 'package.json'))
const workflow = readFile(root, '.github/workflows/ci.yml')

// The scripts of the steps that are one command: `run: pnpm lint`
const ciScripts = [...workflow.matchAll(/^\s+run: pnpm ([a-z][\w:-]*)/gm)].map((match) => match[1])
const localScripts = scripts['test:ci'].split(' && ').map((command) => command.replace('pnpm ', ''))

describe('pnpm test:ci', () => {
  test('finds the steps of the workflow', () => {
    assert.ok(ciScripts.includes('verify'))
    assert.ok(ciScripts.length >= 12, `${ciScripts.length} steps found`)
  })

  test('runs every script the workflow runs', () => {
    const missing = ciScripts
      .filter((script) => !(script in NOT_LOCAL))
      .filter((script) => !localScripts.includes(script))

    assert.deepEqual([...new Set(missing)], [])
  })

  test('runs scripts that exist, once', () => {
    assert.deepEqual(
      localScripts.filter((script) => !(script in scripts)),
      []
    )
    assert.equal(new Set(localScripts).size, localScripts.length)
  })
})
