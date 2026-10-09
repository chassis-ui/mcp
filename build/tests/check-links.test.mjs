// build/check-links.js checks the links of every Markdown file: a path that is gone, a
// heading that was renamed, a URL that answers 404. Run via `pnpm build:test`.

import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { after, afterEach, before, describe, test } from 'node:test'
import { createFixture, removeFixture, root, runScript } from './helpers.mjs'

const SCRIPT = 'build/check-links.js'

describe('check-links.js', () => {
  let dir

  const check = (files, args = ['--offline']) => {
    dir = createFixture(SCRIPT, files)
    return runScript(dir, SCRIPT, { args })
  }

  afterEach(() => removeFixture(dir))

  test('passes links to files, to headings and inside a file', async () => {
    const { status, stdout, stderr } = await check({
      'README.md': [
        '# Readme',
        '',
        '[guide](docs/guide.md), [a heading](docs/guide.md#set-up--run), [here](#readme),',
        '[a directory](docs/), [a file that is not Markdown](LICENSE#L1),',
        '[mail](mailto:someone@example.com) and [a definition][def].',
        '',
        '[def]: ./docs/guide.md#twice-1'
      ].join('\n'),
      LICENSE: 'MIT',
      'docs/guide.md':
        '# Guide\n\n## Set up & run\n\n## Twice\n\n## Twice\n\n[up](../README.md#readme)\n'
    })

    assert.equal(status, 0, stderr)
    assert.match(stdout, /All links of 2 Markdown files resolve/)
  })

  test('reports a file that does not exist', async () => {
    const { status, stderr } = await check({ 'README.md': '# Readme\n\n[gone](docs/gone.md)\n' })

    assert.equal(status, 1)
    assert.match(stderr, /^1 broken link:\n {2}README\.md: docs\/gone\.md \(no such file\)/)
  })

  test('reports a heading that does not exist, in the file and in another', async () => {
    const { status, stderr } = await check({
      'README.md': '# Readme\n\n[a](#gone) [b](guide.md#lint-checklist)\n',
      'guide.md': '# Guide\n\n## Phase 5 — Lint checklist\n'
    })

    assert.equal(status, 1)
    assert.match(stderr, /^2 broken links:/)
    assert.match(stderr, /README\.md: #gone \(no such heading\)/)
    assert.match(stderr, /README\.md: guide\.md#lint-checklist \(no such heading\)/)
  })

  test('resolves a link from the directory of its file', async () => {
    const { status, stderr } = await check({
      'skills/alpha/SKILL.md': '# Alpha\n\n[ok](./references/guide.md)\n',
      'skills/alpha/references/guide.md': '# Guide\n\n[broken](./references/guide.md)\n'
    })

    assert.equal(status, 1)
    assert.match(stderr, /^1 broken link:/)
    assert.match(stderr, /references\/guide\.md: \.\/references\/guide\.md \(no such file\)/)
  })

  test('does not read a link in a code span or a code block', async () => {
    const { status, stderr } = await check({
      'README.md': '# Readme\n\n`[a](gone.md)`\n\n```md\n[b](gone.md)\n# Not a heading\n```\n'
    })

    assert.equal(status, 0, stderr)
  })

  test('does not take a heading inside a code block for an anchor', async () => {
    const { status, stderr } = await check({
      'README.md': '# Readme\n\n[a](#not-a-heading)\n\n```md\n# Not a heading\n```\n'
    })

    assert.equal(status, 1)
    assert.match(stderr, /#not-a-heading \(no such heading\)/)
  })

  test('checks a GitHub URL of a file of this repository in the working tree', async () => {
    const { status, stderr } = await check({
      'README.md':
        '# Readme\n\n[a](https://github.com/chassis-ui/mcp/blob/main/LICENSE) [b](https://github.com/chassis-ui/mcp/blob/main/GONE.md)\n',
      LICENSE: 'MIT'
    })

    assert.equal(status, 1)
    assert.match(stderr, /^1 broken link:/)
    assert.match(stderr, /blob\/main\/GONE\.md \(no such file\)/)
  })

  test('leaves out installed packages, ignored directories and test fixtures', async () => {
    const { status, stdout, stderr } = await check({
      'README.md': '# Readme\n',
      '.claude/plan.md': '[a](gone.md)\n',
      'dist/notes.md': '[a](gone.md)\n',
      'build/tests/fixtures/broken.md': '[a](gone.md)\n'
    })

    assert.equal(status, 0, stderr)
    assert.match(stdout, /All links of 1 Markdown files resolve/)
  })

  test('reads the Markdown files of directories that start with a dot', async () => {
    const { status, stderr } = await check({
      'README.md': '# Readme\n',
      '.github/CONTRIBUTING.md': '# Contributing\n\n[a](../GONE.md)\n'
    })

    assert.equal(status, 1)
    assert.match(stderr, /\.github\/CONTRIBUTING\.md: \.\.\/GONE\.md \(no such file\)/)
  })

  test('does not request an external URL with --offline', async () => {
    const { status, stdout, stderr } = await check({
      'README.md': '# Readme\n\n[a](http://127.0.0.1:1/gone)\n'
    })

    assert.equal(status, 0, stderr)
    assert.match(stdout, /external URLs not checked/)
  })
})

describe('check-links.js, with the external URLs', () => {
  let dir
  let server
  let origin

  before(async () => {
    server = createServer((request, response) => {
      response.writeHead(request.url === '/page' ? 200 : 404).end()
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    origin = `http://127.0.0.1:${server.address().port}`
  })

  after(() => server.close())
  afterEach(() => removeFixture(dir))

  test('passes a URL that answers 200', async () => {
    dir = createFixture(SCRIPT, { 'README.md': `# Readme\n\n[a](${origin}/page)\n` })

    const { status, stdout, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 0, stderr)
    assert.match(stdout, /All links of 1 Markdown files resolve\.\n$/)
  })

  test('reports a URL that answers 404, once for each file that has it', async () => {
    dir = createFixture(SCRIPT, {
      'README.md': `# Readme\n\n[a](${origin}/gone) [b](${origin}/page)\n`,
      'AGENTS.md': `# Agents\n\n[a](${origin}/gone)\n`
    })

    const { status, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 1)
    assert.match(stderr, /^2 broken links:/)
    assert.ok(stderr.includes(`README.md: ${origin}/gone (404)`))
    assert.ok(stderr.includes(`AGENTS.md: ${origin}/gone (404)`))
  })
})

describe('check-links.js, on the repository', () => {
  test('finds no broken relative link or anchor', async () => {
    const { status, stderr } = await runScript(root, SCRIPT, { args: ['--offline'] })

    assert.equal(status, 0, stderr)
  })
})
