// build/generate-css-classes.js reads the compiled @chassis-ui/css and writes the class
// catalog of the chassis-implement-design skill. The tests run it on the small package of
// fixtures/css, where every class is known, and read the catalog it writes. Run via
// `pnpm build:test`.

import assert from 'node:assert/strict'
import path from 'node:path'
import { after, before, describe, test } from 'node:test'
import { createFixture, readFile, removeFixture, root, runScript } from './helpers.mjs'

const SCRIPT = 'build/generate-css-classes.js'
const OUTPUT = 'skills/chassis-implement-design/references/css-classes.md'
const PACKAGE = path.join(root, 'build/tests/fixtures/css')

// The lines of a section: from its heading to the next heading of the same or a higher level
function section(catalog, heading) {
  const lines = catalog.split('\n')
  const start = lines.indexOf(heading)
  assert.notEqual(start, -1, `No "${heading}" in the catalog`)

  const level = heading.match(/^#+/)[0].length
  const end = lines.findIndex(
    (line, index) => index > start && /^#+ /.test(line) && line.match(/^#+/)[0].length <= level
  )
  return lines.slice(start + 1, end === -1 ? undefined : end).filter(Boolean)
}

describe('generate-css-classes', () => {
  let dir
  let result
  let catalog

  before(async () => {
    // The script writes into the directory of the skill, which it expects to exist
    dir = createFixture(SCRIPT, { [path.join(path.dirname(OUTPUT), '.keep')]: '' })
    result = await runScript(dir, SCRIPT, { CHASSIS_CSS_DIR: PACKAGE })
    catalog = result.status === 0 ? readFile(dir, OUTPUT) : ''
  })

  after(() => removeFixture(dir))

  test('exits 0 and reads the package of CHASSIS_CSS_DIR', () => {
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /from @chassis-ui\/css 9\.9\.9 \(/)
    assert.match(result.stdout, /1 unclassified/)
  })

  test('names the version of the package in the banner', () => {
    assert.match(catalog, /^<!-- AUTO-GENERATED from @chassis-ui\/css 9\.9\.9 by /m)
  })

  test('writes the sections in order', () => {
    const headings = catalog.split('\n').filter((line) => /^##? /.test(line))

    assert.deepEqual(headings, [
      '# Chassis CSS Class Catalog',
      '## Scales',
      '## Utilities and helpers',
      '## Components',
      '## JavaScript data attributes',
      '## Tailwind entry'
    ])
  })

  test('reads the breakpoints from the custom properties of :root', () => {
    const rows = section(catalog, '### Breakpoints').map((row) =>
      row
        .split('|')
        .map((cell) => cell.trim())
        .filter(Boolean)
    )

    assert.deepEqual(rows.slice(2), [
      ['`xs`', 'none', '0'],
      ['`sm`', '`sm:`', '576px'],
      ['`md`', '`md:`', '768px'],
      ['`lg`', '`lg:`', '992px'],
      ['`xl`', '`xl:`', '1200px'],
      ['`2xl`', '`2xl:`', '1400px']
    ])
  })

  test('reads the spacing scale, the steps it has only', () => {
    assert.ok(section(catalog, '### Spacing').includes('`zero` 0 · `sm` 0.5rem · `md` 1rem'))
  })

  test('groups the classes of a family by the variants they take', () => {
    // sm\:d-flex to \32 xl\:d-flex are five escaped identifiers: one range
    assert.deepEqual(section(catalog, '### Display'), [
      '- [md:] `d-block`',
      '- [sm:–2xl:] `d-flex`',
      '- [print:] `d-none`'
    ])
  })

  test('collapses a family into one template and lists the values that exist', () => {
    assert.deepEqual(section(catalog, '### Padding'), [
      '- [no variants] `p-{size}` ({size}: sm md lg)'
    ])
    assert.deepEqual(section(catalog, '### Foreground color'), [
      '- [no variants] `fg-{ctx}` ({ctx}: primary danger)'
    ])
    assert.deepEqual(section(catalog, '### Opacity'), [
      '- [no variants] `opacity-{level}` ({level}: 50 90)'
    ])
    assert.deepEqual(section(catalog, '### Grid'), ['- [no variants] `col-span-{n}` ({n}: 1 2)'])
  })

  test('prints a class that is alone in its template as itself', () => {
    assert.deepEqual(section(catalog, '### Gap'), ['- [no variants] `gap-md`'])
    // An escaped slash
    assert.deepEqual(section(catalog, '### Sizing'), ['- [no variants] `w-1/2`'])
  })

  test('lists a class of no family under Other', () => {
    assert.deepEqual(section(catalog, '### Other'), ['- `mystery-thing`'])
  })

  test('leaves out comments, strings, URLs, internal classes and is- classes', () => {
    // The catalog prints a class in backticks
    for (const name of ['comment-class', 'string-class', 'url-class', 'cx-backdrop', 'is-open']) {
      assert.equal(catalog.includes(`\`${name}\``), false, name)
    }
  })

  test('lists a component with its subparts, its modifiers and its direct color', () => {
    const [button] = section(catalog, '### Actions')

    assert.match(button, /^- `button` — subparts .*`button-icon`, `button-label`; /)
    assert.match(button, /; modifiers `disabled`, `outline`; direct color$/)
  })

  test('lists a component without a direct color, and one that has only a modifier', () => {
    assert.deepEqual(section(catalog, '### Surfaces'), [
      '- `card` — subparts `card-body`, `card-sm`',
      '- `modal` — subparts `modal-dialog`; modifiers `show`'
    ])
  })

  test('leaves a group empty when the stylesheet has none of its components', () => {
    assert.deepEqual(section(catalog, '### Forms'), [])
  })

  test('reads the data attributes and the toggle values of the JavaScript', () => {
    const [toggles, attributes] = section(catalog, '## JavaScript data attributes')

    assert.match(toggles, /`data-cx-toggle` values: `collapse`, `modal`\.$/)
    assert.match(
      attributes,
      /plugin code: `data-cx-dismiss`, `data-cx-target`, `data-cx-toggle`\. /
    )
  })

  test('counts the utilities of the Tailwind entry and lists the excluded names', () => {
    const [tailwind] = section(catalog, '## Tailwind entry')

    assert.match(tailwind, /emits 3 Chassis utilities/)
    assert.match(tailwind, /they are Chassis classes: `container`, `collapse`\. /)
  })

  test('writes a catalog that Prettier leaves as it is', async () => {
    const { default: prettier } = await import('prettier')
    const file = path.join(root, OUTPUT)
    const options = await prettier.resolveConfig(file)

    assert.equal(await prettier.check(catalog, { ...options, filepath: file }), true)
  })
})

describe('generate-css-classes, with a CHASSIS_CSS_DIR that holds no package', () => {
  let dir

  before(() => {
    dir = createFixture(SCRIPT, { [path.join(path.dirname(OUTPUT), '.keep')]: '' })
  })

  after(() => removeFixture(dir))

  // The installed package, through node_modules: the catalog of the repository
  test('falls back to the installed package', async () => {
    const result = await runScript(dir, SCRIPT, { CHASSIS_CSS_DIR: path.join(dir, 'missing') })
    const installed = JSON.parse(readFile(root, 'node_modules/@chassis-ui/css/package.json'))

    assert.equal(result.status, 0, result.stderr)
    assert.ok(result.stdout.includes(`from @chassis-ui/css ${installed.version} (`))
    assert.equal(readFile(dir, OUTPUT), readFile(root, OUTPUT))
  })
})
