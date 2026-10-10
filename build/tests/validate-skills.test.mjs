// build/validate-skills.js checks what nothing but an agent reads: the frontmatter of the
// skills and prompts, the files they send an agent to, their headings and tables, and the
// version the class catalog is generated from. Each test breaks one thing in a valid
// fixture. Run via `pnpm build:test`.

import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import { createFixture, readFile, removeFixture, root, runScript } from './helpers.mjs'

const SCRIPT = 'build/validate-skills.js'
const CATALOG = 'skills/chassis-implement-design/references/css-classes.md'
const CLASS_LIST = 'skills/chassis-implement-design/references/css-classes.json'

const installed = JSON.parse(readFile(root, 'node_modules/@chassis-ui/css/package.json')).version

const skill = ({ name = 'alpha', description = 'Does alpha. Use for alpha.', extra = '' } = {}) =>
  `---\nname: ${name}\ndescription: '${description}'\n${extra}---\n\n# Alpha\n\nRead [the guide](./references/guide.md) first, then tables.md.\n`

const VALID = {
  'package.json': JSON.stringify({ devDependencies: { '@chassis-ui/css': installed } }),
  'skills/alpha/SKILL.md': skill(),
  'skills/alpha/references/guide.md': '# Guide\n\nSee tables.md and SKILL.md.\n',
  'skills/alpha/references/tables.md':
    '# Tables\n\n| A | B |\n| --- | --- |\n| `x \\| y` | z |\n\n```md\n# Not a heading\n| a | b | c |\n```\n',
  'prompts/alpha.prompt.md':
    '---\nmode: agent\ndescription: Runs alpha\n---\n\n# /alpha\n\nSee guide.md.\n'
}

describe('validate-skills.js', () => {
  let dir

  // Runs the script on the valid fixture with some files replaced
  const validate = async (files = {}) => {
    dir = createFixture(SCRIPT, { ...VALID, ...files })
    return runScript(dir, SCRIPT)
  }

  const fails = async (files, message) => {
    const { status, stdout, stderr } = await validate(files)

    assert.equal(status, 1, stdout)
    assert.match(stderr, message)
    assert.match(stderr, /^1 problem:/)
  }

  afterEach(() => removeFixture(dir))

  test('passes a valid skill and prompt', async () => {
    const { status, stdout, stderr } = await validate()

    assert.equal(status, 0, stderr)
    assert.match(stdout, /1 skills and 1 prompts are valid/)
  })

  test('fails on frontmatter that does not parse', () =>
    fails(
      { 'skills/alpha/SKILL.md': skill({ description: "It's alpha" }) },
      /SKILL\.md: the frontmatter does not parse/
    ))

  test('fails on a skill without frontmatter', () =>
    fails(
      { 'skills/alpha/SKILL.md': '# Alpha\n\nguide.md, tables.md\n' },
      /SKILL\.md: does not open with frontmatter/
    ))

  test('fails on a name that is not the directory name', () =>
    fails(
      { 'skills/alpha/SKILL.md': skill({ name: 'beta' }) },
      /`name` is "beta", not the directory name "alpha"/
    ))

  test('fails on a description over the limit of the specification', () =>
    fails(
      { 'skills/alpha/SKILL.md': skill({ description: 'a'.repeat(1025) }) },
      /`description` has 1025 characters, more than 1024/
    ))

  test('fails when description and when_to_use pass the listing limit together', () =>
    fails(
      {
        'skills/alpha/SKILL.md': skill({
          description: 'a'.repeat(1000),
          extra: `when_to_use: '${'b'.repeat(537)}'\n`
        })
      },
      /`description` and `when_to_use` have 1537 characters, more than 1536/
    ))

  test('fails on a description that is not a string', () =>
    fails(
      { 'skills/alpha/SKILL.md': skill().replace(/^description: .*$/m, 'description: [a, b]') },
      /`description` is missing or not a string/
    ))

  test('fails on a frontmatter key no client reads', () =>
    fails(
      { 'skills/alpha/SKILL.md': skill({ extra: 'disable-model-invokation: false\n' }) },
      /unknown frontmatter key "disable-model-invokation"/
    ))

  test('accepts the keys of Claude Code', async () => {
    const { status, stderr } = await validate({
      'skills/alpha/SKILL.md': skill({
        extra: 'disable-model-invocation: false\nallowed-tools: Read\n'
      })
    })

    assert.equal(status, 0, stderr)
  })

  test('fails when SKILL.md names a file the skill does not have', () =>
    fails(
      { 'skills/alpha/SKILL.md': skill() + '\nThen references/gone.md.\n' },
      /SKILL\.md: names gone\.md, which is not a file of the skill/
    ))

  test('fails when a reference names a file the skill does not have', () =>
    fails(
      { 'skills/alpha/references/guide.md': '# Guide\n\nSee gone.md, tables.md.\n' },
      /guide\.md: names gone\.md, which is not a file of the skill/
    ))

  test('fails when SKILL.md does not name a reference', () =>
    fails(
      { 'skills/alpha/references/orphan.md': '# Orphan\n' },
      /SKILL\.md: does not name orphan\.md/
    ))

  test('fails on a second level-one heading', () =>
    fails(
      { 'skills/alpha/references/guide.md': '# Guide\n\n# Again\n' },
      /guide\.md: has 2 level-one headings, not one/
    ))

  test('fails on a reference with frontmatter', () =>
    fails(
      { 'skills/alpha/references/guide.md': '---\nname: guide\n---\n\n# Guide\n' },
      /guide\.md: a reference file has no frontmatter/
    ))

  test('fails on a table row with a pipe that is not escaped', () =>
    fails(
      {
        'skills/alpha/references/tables.md':
          '# Tables\n\n| A | B |\n| --- | --- |\n| `x | y` | z |\n'
      },
      /tables\.md: a table row has 3 cells where its header has 2/
    ))

  test('fails on a prompt without a description', () =>
    fails(
      { 'prompts/alpha.prompt.md': '---\nmode: agent\n---\n\n# /alpha\n' },
      /alpha\.prompt\.md: `description` is missing or not a string/
    ))

  test('fails when a prompt names a file no skill has', () =>
    fails(
      {
        'prompts/alpha.prompt.md':
          '---\ndescription: Runs alpha\n---\n\n# /alpha\n\nSee component-keys.md.\n'
      },
      /alpha\.prompt\.md: names component-keys\.md, which is not a file of a skill/
    ))

  test('lists every problem', async () => {
    const { status, stderr } = await validate({
      'skills/alpha/SKILL.md': skill({ name: 'beta' }),
      'skills/alpha/references/orphan.md': '# Orphan\n\n# Again\n'
    })

    assert.equal(status, 1)
    assert.match(stderr, /^3 problems:/)
  })
})

describe('validate-skills.js, on the class catalog', () => {
  let dir

  const catalog = (version) =>
    `# Chassis CSS Class Catalog\n\n<!-- AUTO-GENERATED from @chassis-ui/css ${version} by build/generate-css-classes.js. Do not edit. -->\n`

  const validate = (version, pinned = installed, listVersion = version) => {
    dir = createFixture(SCRIPT, {
      'package.json': JSON.stringify({ devDependencies: { '@chassis-ui/css': pinned } }),
      'skills/chassis-implement-design/SKILL.md': skill({ name: 'chassis-implement-design' })
        .replace('./references/guide.md', './references/css-classes.md')
        .replace('tables.md', 'css-classes.md'),
      [CATALOG]: catalog(version),
      [CLASS_LIST]: JSON.stringify({ version: listVersion, sets: [], classes: {} })
    })
    return runScript(dir, SCRIPT)
  }

  afterEach(() => removeFixture(dir))

  test('passes a catalog of the installed @chassis-ui/css', async () => {
    const { status, stderr } = await validate(installed)

    assert.equal(status, 0, stderr)
  })

  test('fails on a catalog of another version', async () => {
    const { status, stderr } = await validate('0.0.1')

    assert.equal(status, 1)
    assert.ok(
      stderr.includes(`is generated from @chassis-ui/css 0.0.1, and ${installed} is installed`)
    )
  })

  test('fails on a class list of another version than the catalog', async () => {
    const { status, stderr } = await validate(installed, installed, '0.0.1')

    assert.equal(status, 1)
    assert.match(stderr, /^1 problem:/)
    assert.ok(
      stderr.includes(
        `css-classes.json: is generated from @chassis-ui/css 0.0.1, and the catalog from ${installed}`
      )
    )
  })

  test('fails when the class list is missing', async () => {
    dir = createFixture(SCRIPT, {
      'package.json': JSON.stringify({ devDependencies: { '@chassis-ui/css': installed } }),
      'skills/chassis-implement-design/SKILL.md': skill({ name: 'chassis-implement-design' })
        .replace('./references/guide.md', './references/css-classes.md')
        .replace('tables.md', 'css-classes.md'),
      [CATALOG]: catalog(installed)
    })

    const { status, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 1)
    assert.match(stderr, /css-classes\.json: is missing/)
  })

  test('fails when package.json does not pin one version', async () => {
    const { status, stderr } = await validate(installed, `^${installed}`)

    assert.equal(status, 1)
    assert.match(stderr, /package\.json: @chassis-ui\/css is "\^/)
  })

  test('fails on a catalog without the banner of the generator', async () => {
    dir = createFixture(SCRIPT, {
      'package.json': JSON.stringify({ devDependencies: { '@chassis-ui/css': installed } }),
      'skills/chassis-implement-design/SKILL.md': skill({ name: 'chassis-implement-design' })
        .replace('./references/guide.md', './references/css-classes.md')
        .replace('tables.md', 'css-classes.md'),
      [CATALOG]: '# Chassis CSS Class Catalog\n'
    })

    const { status, stderr } = await runScript(dir, SCRIPT)

    assert.equal(status, 1)
    assert.match(stderr, /has no AUTO-GENERATED banner/)
  })
})

describe('validate-skills.js, on the repository', () => {
  test('finds the skills and the prompt valid', async () => {
    const { status, stdout, stderr } = await runScript(root, SCRIPT)

    assert.equal(status, 0, stderr)
    assert.match(stdout, /2 skills and 1 prompts are valid/)
  })
})
