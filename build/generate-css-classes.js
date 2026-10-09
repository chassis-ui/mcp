// Generates skills/chassis-implement-design/references/css-classes.md from the
// compiled output of @chassis-ui/css, so the class catalog the skill ships can
// never drift from the framework.
//
// Sources (all read from the package, never from the docs):
//   dist/css/chassis.css        every class selector, the variant prefixes, the compound modifiers
//   dist/js/chassis.js          the data-cx-* attribute names and the data-cx-toggle values
//   dist/tailwind/theme.css     the class names the Tailwind entry excludes from Tailwind core
//   dist/tailwind/utilities.css the number of @utility rules of the Tailwind entry
//
// The package is resolved from CHASSIS_CSS_DIR when set (for example a checkout
// of chassis-css: ../chassis-css/packages/css), else from node_modules.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'skills/chassis-implement-design/references/css-classes.md')
const PKG = resolvePackage()

const CONTEXTS = [
  'default',
  'alternate',
  'primary',
  'secondary',
  'neutral',
  'success',
  'danger',
  'warning',
  'info',
  'black',
  'white'
]
const SIZES = [
  'zero',
  '4xs',
  '3xs',
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl'
]
const LEVELS = ['05', '10', '20', '30', '40', '50', '60', '70', '80', '90', '95']
const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl']
const VARIANT_PREFIX = /^(max-(?:sm|md|lg|xl|2xl)|@?(?:sm|md|lg|xl|2xl)|print|dark|hover):(.+)$/

// Modifier words that never name a component on their own.
const MODIFIERS = new Set([
  ...CONTEXTS,
  ...SIZES,
  'light',
  'dark',
  'basic',
  'solid',
  'smooth',
  'outline',
  'link',
  'fluid',
  'flush',
  'plain',
  'plaintext',
  'horizontal',
  'vertical',
  'active',
  'disabled',
  'selected',
  'show',
  'showing',
  'hiding',
  'fade',
  'collapsing',
  'visible',
  'invisible',
  'striped',
  'bordered',
  'borderless',
  'hoverable',
  'grouped',
  'stacked',
  'scrollable',
  'fullscreen',
  'translucent',
  'circle',
  'rounded',
  'shadow',
  'border',
  'animated',
  'paused',
  'reverse',
  'numbered',
  'bulletless',
  'inline',
  'instant',
  'sheet',
  'nonmodal',
  'thumbnail',
  'contained',
  'submenu',
  'icon'
])

// Utility and helper families, in the order they are written. A base class is
// placed in the first family whose pattern matches it.
const FAMILIES = [
  ['Display', /^d-/],
  [
    'Flex',
    /^(flex-|justify-content-|justify-items-|justify-self-|align-items-|align-self-|align-content-|place-|order-)/
  ],
  [
    'Grid',
    /^(grid$|grid-|col-span-|col-start-|col-end-|col-auto$|row-span-|row-start-|row-end-|row-auto$|auto-cols-|auto-rows-)/
  ],
  ['Gap', /^(gap-|row-gap-|column-gap-)/],
  ['Vertical align', /^align-(baseline|top|middle|bottom|text-top|text-bottom)$/],
  ['Space between children', /^space-[xy]-/],
  ['Divide', /^divide-/],
  ['Padding', /^-?p[tbsexy]?-/],
  ['Margin', /^-?m[tbsexy]?-/],
  ['Sizing', /^(w-|h-|min-w-|max-w-|min-h-|max-h-|vw-|vh-|dvh-|min-vw-|min-vh-)/],
  ['Foreground color', /^(fg-|[a-z]+-fg-)/],
  ['Background color', /^(bg-|[a-z]+-bg-)/],
  ['Dim (backdrop) color', /^(dim-|[a-z]+-dim-)/],
  ['Border', /^(border(-|$)|[a-z]+-border-)/],
  ['Border radius', /^rounded(-|$)/],
  ['Shadow', /^shadow(-|$)/],
  ['Opacity', /^(opacity-|cue-opacity-)/],
  [
    'Typography',
    /^(font-|text-|lh-|underline-offset-|h[1-6]$|blockquote$|attribution$|bulletless$|inline$)/
  ],
  ['Icon', /^(icon(-|$)|[a-z]+-icon-)/],
  ['Link', /^(link(-|$)|[a-z]+-link-|stretched-link$|icon-link)/],
  ['Position', /^(position-|top-|bottom-|start-|end-|translate-|z-|sticky-|fixed-)/],
  [
    'Overflow, object fit, float, interaction',
    /^(overflow-|object-fit-|float-|user-select-|pointer-event|cursor-|container-type|contains-)/
  ],
  ['Ratio', /^ratio/],
  ['Context', /^context$/],
  [
    'Helpers',
    /^(visually-hidden|clearfix|vr$|hstack$|vstack$|focus-ring|text-truncate|caret|directional-icon|last-mb-)/
  ]
]

// Classes the plugins add for their own use; not for markup.
const INTERNAL = /^(cx-|no-transition$|swap-in$|always-show$|collapsible$|static$)/

// Component roots, grouped as the docs group them. Subparts are every base class
// that starts with "<root>-"; modifiers come from the compound selectors.
const COMPONENT_GROUPS = [
  ['Layout', ['container']],
  ['Actions', ['button', 'button-group', 'close-button', 'toggler']],
  [
    'Forms',
    [
      'form-field',
      'form-label',
      'col-form-label',
      'form-input',
      'form-help',
      'form-floating',
      'form-check',
      'check-input',
      'form-switch',
      'form-card',
      'form-caret',
      'input-group',
      'input-addon',
      'input-adorn',
      'form-range',
      'form-otp',
      'combobox',
      'datepicker',
      'chip-input',
      'strength',
      'valid-feedback',
      'invalid-feedback',
      'valid-tooltip',
      'invalid-tooltip',
      'validation-icons',
      'ghost-input'
    ]
  ],
  ['Navigation', ['navbar', 'nav', 'nav-overflow', 'breadcrumb', 'pagination', 'stepper', 'menu']],
  [
    'Surfaces',
    ['card', 'accordion', 'collapse', 'list', 'table', 'dialog', 'modal', 'drawer', 'alert']
  ],
  ['Feedback', ['notification', 'toast', 'tooltip', 'popover', 'progress', 'spinner', 'skeleton']],
  ['Data', ['badge', 'chip', 'avatar', 'carousel', 'tab-content', 'tab-pane', 'figure', 'image']]
]

function resolvePackage() {
  const candidates = [process.env.CHASSIS_CSS_DIR, join(ROOT, 'node_modules/@chassis-ui/css')]
  for (const dir of candidates) {
    if (dir && existsSync(join(dir, 'dist/css/chassis.css'))) return dir
  }
  throw new Error(
    'Cannot find @chassis-ui/css. Run `pnpm install`, or set CHASSIS_CSS_DIR to a checkout of chassis-css/packages/css.'
  )
}

function read(path) {
  return readFileSync(join(PKG, path), 'utf-8')
}

function unescapeIdent(raw) {
  return raw
    .replace(/\\([0-9a-f]{1,6}) ?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/\\(.)/g, '$1')
}

// Every selector prelude of the stylesheet: the text before a "{" that is not a declaration.
function selectors(css) {
  const clean = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/url\([^)]*\)/g, 'url()')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
  const out = []
  let start = 0
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (ch === '{') {
      const prelude = clean.slice(start, i).trim()
      if (prelude && !prelude.startsWith('@')) out.push(prelude)
      start = i + 1
    } else if (ch === '}' || ch === ';') {
      start = i + 1
    }
  }
  return out
}

const IDENT = String.raw`(?:\\[0-9a-f]{1,6} ?|\\.|[A-Za-z0-9_-])+`
const CLASS_RE = new RegExp(String.raw`\.(${IDENT})`, 'g')
const COMPOUND_RE = new RegExp(String.raw`\.(${IDENT})(?:\.(${IDENT}))+`, 'g')

function collect(css) {
  const classes = new Map() // base class -> Set of variant prefixes
  const compounds = []
  for (const selector of selectors(css)) {
    for (const match of selector.matchAll(CLASS_RE)) {
      const name = unescapeIdent(match[1])
      const variant = name.match(VARIANT_PREFIX)
      const base = variant ? variant[2] : name
      const prefix = variant ? variant[1] : null
      if (!classes.has(base)) classes.set(base, new Set())
      if (prefix) classes.get(base).add(prefix)
    }
    for (const match of selector.matchAll(COMPOUND_RE)) {
      const names = match[0]
        .split(/\.(?![0-9a-f]{1,6} )/)
        .filter(Boolean)
        .map((part) => unescapeIdent(part))
      if (names.every((name) => !VARIANT_PREFIX.test(name))) compounds.push(names)
    }
  }
  return { classes, compounds }
}

function variantSignature(variants) {
  const parts = []
  if (BREAKPOINTS.every((bp) => variants.has(bp))) parts.push('sm:–2xl:')
  else if (BREAKPOINTS.some((bp) => variants.has(bp)))
    parts.push(
      BREAKPOINTS.filter((bp) => variants.has(bp))
        .map((bp) => `${bp}:`)
        .join(' ')
    )
  if (BREAKPOINTS.every((bp) => variants.has(`max-${bp}`))) parts.push('max-sm:–max-2xl:')
  if (BREAKPOINTS.every((bp) => variants.has(`@${bp}`))) parts.push('@sm:–@2xl:')
  for (const single of ['print', 'dark', 'hover'])
    if (variants.has(single)) parts.push(`${single}:`)
  return parts.join(', ')
}

// Replaces one dimension of a class name with a placeholder so a family of
// classes prints as one template: {ctx}, {size}, {level} or {n}.
const DIMENSIONS = [
  ['{ctx}', CONTEXTS, (v) => `(^|-)(${v})(?=-|$)`, () => true],
  ['{size}', SIZES, (v) => `(^|-)(${v})(?=-|$)`, () => true],
  ['{level}', LEVELS, (v) => `(^|-)(${v})$`, (name) => /opacity|^shadow-/.test(name)],
  [
    '{n}',
    Array.from({ length: 13 }, (_, i) => String(i + 1)),
    (v) => `(^|-)(${v})(?=/|$)`,
    (name) => !/opacity|^shadow-/.test(name)
  ]
]

function templatize(names) {
  const groups = new Map() // template -> { names, values: Map(placeholder -> Set) }
  for (const name of names) {
    let template = name
    const values = new Map()
    for (const [placeholder, list, pattern, applies] of DIMENSIONS) {
      if (!applies(name)) continue
      const re = new RegExp(pattern(list.join('|')))
      const match = template.match(re)
      if (match) {
        template = template.replace(re, `$1${placeholder}`)
        values.set(placeholder, match[2])
        break
      }
    }
    if (!groups.has(template)) groups.set(template, { names: [], values: new Map() })
    const group = groups.get(template)
    group.names.push(name)
    for (const [placeholder, value] of values) {
      if (!group.values.has(placeholder)) group.values.set(placeholder, new Set())
      group.values.get(placeholder).add(value)
    }
  }
  // A template that stands for a single class prints as that class.
  const out = []
  for (const [template, group] of groups) {
    if (group.names.length === 1)
      out.push({ template: group.names[0], names: group.names, note: '' })
    else {
      const notes = []
      for (const [placeholder, list] of DIMENSIONS) {
        const have = group.values.get(placeholder)
        if (have && have.size < list.length)
          notes.push(`${placeholder}: ${list.filter((v) => have.has(v)).join(' ')}`)
      }
      out.push({ template, names: group.names, note: notes.join('; ') })
    }
  }
  return out.sort((a, b) => a.template.localeCompare(b.template))
}

function code(text) {
  return `\`${text}\``
}

function familyOf(name) {
  for (const [title, pattern] of FAMILIES) if (pattern.test(name)) return title
  return null
}

async function build() {
  const css = read('dist/css/chassis.css')
  const js = read('dist/js/chassis.js')
  const version = JSON.parse(read('package.json')).version
  const { classes, compounds } = collect(css)

  const roots = new Set(COMPONENT_GROUPS.flatMap(([, list]) => list))
  // The root a class is a subpart of: the longest root that prefixes it.
  const rootOf = (name) =>
    [...roots]
      .filter((root) => name !== root && name.startsWith(`${root}-`))
      .sort((a, b) => b.length - a.length)[0]

  // Utilities and helpers
  const families = new Map(FAMILIES.map(([title]) => [title, []]))
  const leftovers = []
  for (const name of classes.keys()) {
    if (roots.has(name) || rootOf(name) || INTERNAL.test(name)) continue
    const family = familyOf(name)
    if (family) families.get(family).push(name)
    else if (!MODIFIERS.has(name) && !/^(is-|has-)/.test(name)) leftovers.push(name)
  }

  // Components
  const subparts = new Map([...roots].map((root) => [root, []]))
  for (const name of classes.keys()) {
    const root = rootOf(name)
    if (root) subparts.get(root).push(name)
  }
  const modifiers = new Map([...roots].map((root) => [root, new Set()]))
  const colored = new Set()
  for (const names of compounds) {
    const root = names.find((name) => roots.has(name))
    if (!root) continue
    for (const name of names) {
      if (name === root || roots.has(name) || rootOf(name) || INTERNAL.test(name)) continue
      if (CONTEXTS.includes(name)) colored.add(root)
      else modifiers.get(root).add(name)
    }
  }

  // Scales read from the custom properties of :root
  const prop = (name) => [...css.matchAll(new RegExp(`--cx-${name}-([a-z0-9]+):\\s*([^;]+);`, 'g'))]
  const breakpoints = new Map(prop('breakpoint').map((m) => [m[1], m[2].trim()]))
  const spaces = new Map(prop('space').map((m) => [m[1], m[2].trim()]))

  // JavaScript
  const attributes = [...new Set(js.match(/data-cx-[a-z-]+/g))].sort()
  const toggles = [
    ...new Set([...js.matchAll(/data-cx-toggle=\\?"([a-z-]+)/g)].map((m) => m[1]))
  ].sort()

  // Tailwind entry
  const theme = read('dist/tailwind/theme.css')
  const excluded = [...theme.matchAll(/@source not inline\("([^"]+)"\)/g)].map((m) => m[1])
  const utilityCount = (read('dist/tailwind/utilities.css').match(/^@utility /gm) || []).length

  const lines = []
  const p = (...text) => lines.push(...text)

  p(
    '# Chassis CSS Class Catalog',
    '',
    `<!-- AUTO-GENERATED from @chassis-ui/css ${version} by build/generate-css-classes.js. Do not edit; run \`pnpm generate:css-classes\`. -->`,
    '',
    `Every class below exists in \`dist/css/chassis.css\` of \`@chassis-ui/css\` ${version}. A class that is not here does not exist. Placeholders stand for a dimension of a family:`,
    '',
    `- \`{ctx}\` — a context color: ${CONTEXTS.map(code).join(' ')}`,
    `- \`{size}\` — a step of the size scale: ${SIZES.map(code).join(' ')}`,
    `- \`{level}\` — an opacity level: ${LEVELS.map(code).join(' ')}`,
    '- `{n}` — a number (grid lines, spans, twelfths)',
    '',
    'When a template lists fewer values after it, only those exist. The bracket before a list names the variant prefixes those classes take: `sm:`–`2xl:` are the viewport breakpoints, `@sm:`–`@2xl:` the container-query breakpoints, `max-sm:`–`max-2xl:` the narrower-than variants, `print:`, `dark:` (system preference only in this build) and `hover:` their media states. Write the prefix before the class, with a colon: `md:d-flex`, `@lg:col-span-6`.',
    '',
    '## Scales',
    '',
    '### Breakpoints',
    '',
    '| Name | Prefix | Min width |',
    '| --- | --- | --- |',
    ...['xs', ...BREAKPOINTS].map(
      (bp) =>
        `| \`${bp}\` | ${bp === 'xs' ? 'none' : code(`${bp}:`)} | ${breakpoints.get(bp) ?? ''} |`
    ),
    '',
    '### Spacing',
    '',
    'The values of the default tokens (`--cx-space-*`); a project with its own tokens has other values under the same names.',
    '',
    SIZES.filter((s) => spaces.has(s))
      .map((s) => `${code(s)} ${spaces.get(s)}`)
      .join(' · '),
    ''
  )

  p('## Utilities and helpers', '')
  for (const [title] of FAMILIES) {
    const names = families.get(title)
    if (names.length === 0) continue
    p(`### ${title}`, '')
    const bySignature = new Map()
    for (const entry of templatize(names)) {
      const signatures = entry.names.map((name) => variantSignature(classes.get(name)))
      const signature = signatures.every((s) => s === signatures[0])
        ? signatures[0]
        : 'varies by class'
      if (!bySignature.has(signature)) bySignature.set(signature, [])
      bySignature.get(signature).push(entry)
    }
    for (const [signature, entries] of bySignature) {
      const items = entries.map((e) => code(e.template) + (e.note ? ` (${e.note})` : ''))
      p(`- [${signature || 'no variants'}] ${items.join(', ')}`)
    }
    p('')
  }
  if (leftovers.length > 0) p('### Other', '', `- ${leftovers.sort().map(code).join(', ')}`, '')

  p(
    '## Components',
    '',
    'For each component: the root class, its subpart classes, the modifiers that appear on the root in the stylesheet, and whether a context color (`primary`, `danger`, …) is written directly on the root ("direct color"). A component without a direct color takes `context {ctx}` instead. State classes such as `active`, `disabled` and `show` are listed where the stylesheet styles them.',
    ''
  )
  for (const [group, list] of COMPONENT_GROUPS) {
    p(`### ${group}`, '')
    for (const root of list) {
      if (!classes.has(root)) continue
      const parts = templatize(subparts.get(root))
        .map((e) => code(e.template) + (e.note ? ` (${e.note})` : ''))
        .join(', ')
      const mods = [...modifiers.get(root)].sort().map(code).join(', ')
      const facts = [
        parts && `subparts ${parts}`,
        mods && `modifiers ${mods}`,
        colored.has(root) && 'direct color'
      ].filter(Boolean)
      p(`- ${code(root)}${facts.length > 0 ? ` — ${facts.join('; ')}` : ''}`)
    }
    p('')
  }

  p(
    '## JavaScript data attributes',
    '',
    `Plugins initialize from markup. \`data-cx-toggle\` values: ${toggles.map(code).join(', ')}.`,
    '',
    `Attribute names that appear literally in the plugin code: ${attributes.map(code).join(', ')}. A plugin also reads each of its options as \`data-cx-{option}\` on the element (for example \`data-cx-backdrop\`, \`data-cx-keyboard\`, \`data-cx-placement\`, \`data-cx-content\`, \`data-cx-title\`); the options of each plugin are in components.md and on its docs page.`,
    '',
    '## Tailwind entry',
    '',
    `\`@chassis-ui/css/tailwind\` emits ${utilityCount} Chassis utilities as Tailwind \`@utility\` rules under the same names as above, so every Tailwind variant applies to them (\`dark:\`, \`light:\`, \`hover:\`, \`sm:\`–\`2xl:\`, \`@sm:\`–\`@2xl:\`, \`print:\`). Components stay plain CSS. These names are excluded from Tailwind core because they are Chassis classes: ${excluded.map(code).join(', ')}. The grid placement classes (\`col-span-*\`, \`col-start-*\`, \`row-span-*\`, …) are Tailwind core's own there, with the same declarations as the regular build.`,
    ''
  )

  writeFileSync(OUT, await prettier.format(lines.join('\n'), { filepath: OUT }), 'utf-8')
  console.log(
    `Generated ${OUT} from @chassis-ui/css ${version} (${classes.size} classes, ${roots.size} component roots, ${leftovers.length} unclassified)`
  )
}

await build()
