// build/generate-content.js writes the Markdown of skills/ and prompts/ and the version of
// package.json into a TypeScript module, as template literals, with the registry of the
// resources the server serves. A backtick, a `${` or a backslash that is not escaped changes
// the text the server returns, or breaks the build; a file the registry misses is a resource
// the server does not have. Run via `pnpm build:test`.

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { after, before, describe, test } from 'node:test'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { createFixture, readFile, removeFixture, runScript, writeFiles } from './helpers.mjs'

const SCRIPT = 'build/generate-content.js'
const OUTPUT = 'server/content.generated.ts'

// What a template literal would read as its own syntax
const TRICKY = [
  '---',
  'name: one',
  "description: 'A skill'",
  '---',
  '',
  '# One',
  '',
  'Inline `code`, a fence, and a literal ${placeholder} with a \\${escaped} one.',
  '',
  '```js',
  'const text = `Hello ${name}`',
  'const path = "C:\\\\temp\\n"',
  'const regex = /\\d+\\.\\d+/',
  '```',
  '',
  'A backslash before a backtick \\` and at the end of a line \\',
  'Quotes \' and ", a dash — and an emoji ✅.',
  ''
].join('\n')

const FILES = {
  'package.json': JSON.stringify({ name: 'fixture', version: '9.8.7' }),
  'prompts/chassis-ui.prompt.md': '---\nmode: agent\n---\n\n# Prompt\n',
  'skills/one/SKILL.md': TRICKY,
  'skills/one/references/first.md': '# First\n\n| a | b |\n| - | - |\n| `x` | y |\n',
  'skills/two/SKILL.md': '# Two\n',
  // Not Markdown: left out
  'skills/one/notes.txt': 'Not a skill file',
  'server/.keep': ''
}

const MARKDOWN = Object.keys(FILES).filter((file) => file.endsWith('.md'))

// The generated module, compiled as the build compiles it
async function load(dir) {
  const { outputText } = ts.transpileModule(readFile(dir, OUTPUT), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  })
  const compiled = path.join(dir, 'content.generated.mjs')

  fs.writeFileSync(compiled, outputText)
  return import(pathToFileURL(compiled).href)
}

describe('generate-content', () => {
  let dir
  let result
  let generated

  before(async () => {
    dir = createFixture(SCRIPT, FILES)
    result = await runScript(dir, SCRIPT)
    generated = result.status === 0 ? await load(dir) : {}
  })

  after(() => removeFixture(dir))

  test('exits 0 and names the number of files and of resources', () => {
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, new RegExp(`with ${MARKDOWN.length} files and 3 resources`))
  })

  test('holds every Markdown file of prompts/ and skills/, and nothing else', () => {
    assert.deepEqual(Object.keys(generated.CONTENT).sort(), [...MARKDOWN].sort())
  })

  test('holds each file character for character', () => {
    for (const file of MARKDOWN) {
      assert.equal(generated.CONTENT[file], FILES[file], file)
    }
  })

  test('holds the version of package.json', () => {
    assert.equal(generated.VERSION, '9.8.7')
  })

  test('marks the module as generated', () => {
    assert.match(readFile(dir, OUTPUT), /^\/\/ AUTO-GENERATED/)
  })

  // Every file of skills/ and nothing else, SKILL.md before the references of its skill, named
  // after its path, with forward slashes
  test('lists the files of skills/ as resources, in the order of the bundles', () => {
    assert.deepEqual(
      generated.RESOURCES.map(({ name, uri, path }) => ({ name, uri, path })),
      [
        {
          name: 'one',
          uri: 'chassis://skills/one',
          path: 'skills/one/SKILL.md'
        },
        {
          name: 'one/references/first',
          uri: 'chassis://skills/one/references/first',
          path: 'skills/one/references/first.md'
        },
        {
          name: 'two',
          uri: 'chassis://skills/two',
          path: 'skills/two/SKILL.md'
        }
      ]
    )
  })

  test('describes a skill by its frontmatter and a reference by its heading', () => {
    assert.deepEqual(
      generated.RESOURCES.map(({ description }) => description),
      ['A skill', 'First', 'Two']
    )
  })

  test('types the registry as a tuple of literals', () => {
    assert.match(readFile(dir, OUTPUT), /^] as const$/m)
  })
})

describe('generate-content, with a file that has no description and no heading', () => {
  let dir

  before(() => {
    dir = createFixture(SCRIPT, {
      ...FILES,
      'skills/two/references/bare.md': 'A paragraph, no heading\n'
    })
  })

  after(() => removeFixture(dir))

  test('fails, names the file and writes no module', async () => {
    const result = await runScript(dir, SCRIPT)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /skills\/two\/references\/bare\.md/)
    assert.equal(fs.existsSync(path.join(dir, OUTPUT)), false)
  })
})

describe('generate-content, after a file changed', () => {
  let dir

  before(() => {
    dir = createFixture(SCRIPT, FILES)
  })

  after(() => removeFixture(dir))

  test('writes the new text and the new version over the old module', async () => {
    await runScript(dir, SCRIPT)
    writeFiles(dir, {
      'package.json': JSON.stringify({ name: 'fixture', version: '10.0.0' }),
      'skills/two/SKILL.md': '# Two, edited\n',
      'skills/two/references/added.md': '# Added\n'
    })

    const result = await runScript(dir, SCRIPT)
    const generated = await load(dir)

    assert.equal(result.status, 0, result.stderr)
    assert.equal(generated.VERSION, '10.0.0')
    assert.equal(generated.CONTENT['skills/two/SKILL.md'], '# Two, edited\n')
    assert.equal(generated.CONTENT['skills/two/references/added.md'], '# Added\n')
  })
})

describe('generate-content, without the prompt file', () => {
  let dir

  before(() => {
    const files = Object.entries(FILES).filter(([file]) => !file.startsWith('prompts/'))
    dir = createFixture(SCRIPT, Object.fromEntries(files))
  })

  after(() => removeFixture(dir))

  test('fails and writes no module', async () => {
    const result = await runScript(dir, SCRIPT)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /chassis-ui\.prompt\.md/)
    assert.equal(fs.existsSync(path.join(dir, OUTPUT)), false)
  })
})
