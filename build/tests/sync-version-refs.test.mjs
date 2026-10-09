// The version step, after `changeset version`. build/sync-version-refs.js runs in
// `pnpm changeset:version` only. It writes the version of package.json into the three plugin
// manifests. Run via `pnpm build:test`.

import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import { createFixture, readFile, removeFixture, root, runScript, writeFiles } from './helpers.mjs'

const SCRIPT = 'build/sync-version-refs.js'

const MANIFESTS = [
  '.claude-plugin/plugin.json',
  '.cursor-plugin/plugin.json',
  '.github/plugin/plugin.json'
]

// A manifest as Prettier leaves it: an array on one line, and a nested "version" that is not
// the version of the plugin
const manifest = (version) => `{
  "name": "chassis-ui",
  "version": "${version}",
  "author": {
    "name": "Chassis UI"
  },
  "keywords": ["chassis-ui", "mcp"],
  "engine": {
    "version": "1.0.0"
  }
}
`

const fixture = (version, manifests = MANIFESTS) =>
  createFixture(SCRIPT, {
    'package.json': JSON.stringify({ name: 'fixture', version }),
    ...Object.fromEntries(manifests.map((file) => [file, manifest('0.1.5')]))
  })

describe('sync-version-refs.js', () => {
  let dir

  afterEach(() => removeFixture(dir))

  test('writes the version of package.json into the three manifests', async () => {
    dir = fixture('0.2.0')

    const { status, stdout } = await runScript(dir, SCRIPT)

    assert.equal(status, 0)
    assert.match(stdout, /Synced 3 of 3 references/)
    for (const file of MANIFESTS) {
      assert.equal(readFile(dir, file), manifest('0.2.0'), file)
    }
  })

  test('leaves the rest of a manifest as it is, a nested version too', async () => {
    dir = fixture('0.2.0')

    await runScript(dir, SCRIPT)

    const text = readFile(dir, MANIFESTS[0])
    assert.match(text, /"keywords": \["chassis-ui", "mcp"\]/)
    assert.match(text, / {4}"version": "1\.0\.0"/)
  })

  test('writes a prerelease version', async () => {
    dir = fixture('0.2.0-next.1')

    const { status } = await runScript(dir, SCRIPT)

    assert.equal(status, 0)
    assert.match(readFile(dir, MANIFESTS[2]), /^ {2}"version": "0\.2\.0-next\.1",$/m)
  })

  test('changes nothing when the manifests have the version', async () => {
    dir = fixture('0.1.5')

    const { status, stdout } = await runScript(dir, SCRIPT)

    assert.equal(status, 0)
    assert.match(stdout, /Already in sync/)
  })

  test('counts the manifests it changed', async () => {
    dir = fixture('0.2.0')
    writeFiles(dir, { [MANIFESTS[1]]: manifest('0.2.0') })

    const { stdout } = await runScript(dir, SCRIPT)

    assert.match(stdout, /Synced 2 of 3 references/)
  })

  test('fails when a manifest is missing', async () => {
    dir = fixture('0.2.0', MANIFESTS.slice(0, 2))

    const { status, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 1)
    assert.match(stderr, /\.github\/plugin\/plugin\.json/)
  })

  test('fails when a manifest has no version field', async () => {
    dir = fixture('0.2.0')
    writeFiles(dir, { [MANIFESTS[0]]: '{\n  "name": "chassis-ui"\n}\n' })

    const { status, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 1)
    assert.match(stderr, /No version field in \.claude-plugin\/plugin\.json/)
  })

  test('fails on a version that is not a version', async () => {
    dir = fixture('next')

    const { status, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 1)
    assert.match(stderr, /Invalid or missing version in package\.json/)
    assert.equal(readFile(dir, MANIFESTS[0]), manifest('0.1.5'))
  })
})

// The manifests of the repository: the script finds the version field of each, and they
// have the version of package.json
describe('sync-version-refs.js, on the manifests of the repository', () => {
  let dir

  afterEach(() => removeFixture(dir))

  test('finds them in sync', async () => {
    dir = createFixture(SCRIPT, {
      'package.json': readFile(root, 'package.json'),
      ...Object.fromEntries(MANIFESTS.map((file) => [file, readFile(root, file)]))
    })

    const { status, stdout, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 0, stderr)
    assert.match(stdout, /Already in sync/)
  })
})
