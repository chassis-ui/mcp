// The body of the GitHub release, from the CHANGELOG. release.yml runs
// build/release-notes.js for a new version only, so an error in it shows when a version is
// being released. Run via `pnpm build:test`.

import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { createFixture, removeFixture, runScript } from './helpers.mjs'

const SCRIPT = 'build/release-notes.js'

const CHANGELOG = `# Changelog

## 0.2.0

### Minor Changes

- abc1234: The skill is rewritten

\`\`\`md
## A heading inside a code block
\`\`\`

### Patch Changes

- def5678: A fix

## 0.2.0-beta.1

### Patch Changes

- A prerelease

## [0.1.20] - 2026-05-08

### Fixed

- The twentieth patch

## [0.1.2] - 2026-05-06

### Fixed

- The second patch

## [0.1.1] - 2026-05-03

## [0.1.0] - 2026-04-30

### Added

- The last entry

---

[0.1.0]: https://github.com/chassis-ui/mcp/releases/tag/v0.1.0
`

describe('release-notes.js', () => {
  let dir

  const notes = (...args) => runScript(dir, SCRIPT, { args })

  before(() => {
    dir = createFixture(SCRIPT, {
      'CHANGELOG.md': CHANGELOG,
      'package.json': JSON.stringify({ version: '0.1.2' })
    })
  })

  after(() => removeFixture(dir))

  test('prints the entry of a hand-written heading, without the heading', async () => {
    const { status, stdout } = await notes('0.1.2')

    assert.equal(status, 0)
    assert.equal(stdout, '### Fixed\n\n- The second patch\n')
  })

  test('prints the entry of a Changesets heading', async () => {
    const { status, stdout } = await notes('0.2.0')

    assert.equal(status, 0)
    assert.match(stdout, /^### Minor Changes\n/)
    assert.match(stdout, /- def5678: A fix\n$/)
  })

  test('does not end the entry at a heading inside a code block', async () => {
    const { stdout } = await notes('0.2.0')

    assert.match(stdout, /## A heading inside a code block/)
    assert.match(stdout, /### Patch Changes/)
  })

  test('accepts the version as a tag', async () => {
    const { status, stdout } = await notes('v0.1.2')

    assert.equal(status, 0)
    assert.equal(stdout, '### Fixed\n\n- The second patch\n')
  })

  test('uses the version of package.json without an argument', async () => {
    const { status, stdout } = await notes()

    assert.equal(status, 0)
    assert.equal(stdout, '### Fixed\n\n- The second patch\n')
  })

  test('does not take a version for one that starts with it', async () => {
    const patch = await notes('0.1.20')
    const prerelease = await notes('0.2.0-beta.1')

    assert.equal(patch.stdout, '### Fixed\n\n- The twentieth patch\n')
    assert.equal(prerelease.stdout, '### Patch Changes\n\n- A prerelease\n')
  })

  test('ends the last entry before the link definitions', async () => {
    const { status, stdout } = await notes('0.1.0')

    assert.equal(status, 0)
    assert.match(stdout, /^### Added\n\n- The last entry\n/)
    assert.doesNotMatch(stdout, /releases\/tag/)
  })

  test('fails when the CHANGELOG has no entry for the version', async () => {
    const { status, stdout, stderr } = await notes('0.3.0')

    assert.equal(status, 1)
    assert.equal(stdout, '')
    assert.match(stderr, /has no entry for 0\.3\.0/)
  })

  test('fails when the entry is empty', async () => {
    const { status, stdout, stderr } = await notes('0.1.1')

    assert.equal(status, 1)
    assert.equal(stdout, '')
    assert.match(stderr, /entry for 0\.1\.1 is empty/)
  })
})

// The CHANGELOG of the repository: every version it names can be released
describe('release-notes.js, on CHANGELOG.md of the repository', () => {
  let dir

  before(async () => {
    const { readFile, root } = await import('./helpers.mjs')

    dir = createFixture(SCRIPT, {
      'CHANGELOG.md': readFile(root, 'CHANGELOG.md'),
      'package.json': readFile(root, 'package.json')
    })
  })

  after(() => removeFixture(dir))

  test('has an entry for the version of package.json', async () => {
    const { status, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 0, stderr)
  })
})
