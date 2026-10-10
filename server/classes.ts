// chassis_check_classes: class names against the class list build/generate-css-classes.js
// writes from the compiled stylesheet of @chassis-ui/css, next to the catalog css-classes.md.
// The same walk of the stylesheet writes both, so a class the tool accepts is in the catalog
// and a class it refuses is not. The tool exists so that an agent does not read the 20 KB
// catalog whole to check the classes it wrote: it checks them here and reads the section of
// the catalog the answer names.

import { CLASSES } from './content.generated.js'

// The shape of css-classes.json: every class of the stylesheet that is for markup, with the
// index of the set of variant prefixes it takes (`sm`, `@md`, `max-lg`, `print`, `dark`,
// `hover`, as written before the colon); the utilities the Tailwind entry emits as `@utility`
// rules, which take every Tailwind variant; and how the catalog groups the classes: the
// utility families by a pattern on the name, the components by group and root
export interface ClassList {
  version: string
  sets: readonly (readonly string[])[]
  classes: Readonly<Record<string, number>>
  utilities: readonly string[]
  families: readonly (readonly [string, string])[]
  components: readonly (readonly [string, readonly string[]])[]
}

export const MODES = ['native', 'tailwind'] as const
export type Mode = (typeof MODES)[number]

const list: ClassList = CLASSES
const utilities = new Set(list.utilities)
const nativePrefixes = [...new Set(list.sets.flat())]
const families = list.families.map(([title, source]) => [title, new RegExp(source)] as const)
const groupOf = new Map(
  list.components.flatMap(([group, roots]) => roots.map((root) => [root, group] as const))
)
// The component roots, longest first: the root of a subpart is the longest that prefixes it
const roots = [...groupOf.keys()].sort((a, b) => b.length - a.length)

const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl']

function isClass(name: string): boolean {
  return Object.hasOwn(list.classes, name)
}

function prefixesOf(name: string): readonly string[] {
  return isClass(name) ? list.sets[list.classes[name]] : []
}

// The section of the catalog that lists a class, or would: its component group, or the
// utility family its name matches
function sectionOf(name: string): string | undefined {
  const root = roots.find((candidate) => name === candidate || name.startsWith(`${candidate}-`))
  if (root) return groupOf.get(root)
  return families.find(([, pattern]) => pattern.test(name))?.[0]
}

function commonPrefix(a: string, b: string): number {
  let length = 0
  while (length < a.length && length < b.length && a[length] === b[length]) length += 1
  return length
}

// Classes of the list that share the first segment of a name, the ones that share most of it
// first: what an agent may have meant
function nearOf(name: string): string[] {
  const segment = name.split('-')[0]
  if (segment === '' || segment === name) return []
  return Object.keys(list.classes)
    .filter((other) => other !== name && (other === segment || other.startsWith(`${segment}-`)))
    .sort((a, b) => commonPrefix(b, name) - commonPrefix(a, name) || a.localeCompare(b))
}

// The class names of what an agent passes: class names, space-separated class attribute
// values, or markup, whose `class` attributes are read. Each once, in the order given
export function classNamesOf(inputs: readonly string[]): string[] {
  const names = new Set<string>()
  for (const input of inputs) {
    const values = /<[a-z!/]/i.test(input)
      ? [...input.matchAll(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2])
      : [input]
    for (const value of values) {
      for (const name of value.split(/\s+/)) if (name !== '') names.add(name)
    }
  }
  return [...names]
}

function code(names: readonly string[]): string {
  return names.map((name) => `\`${name}\``).join(', ')
}

// Variant prefixes as the catalog writes them, a run of the five breakpoints as a range:
// `sm:`–`2xl:`, `@sm:`–`@2xl:`, `max-sm:`–`max-2xl:`, `print:`, `dark:`, `hover:`
function variants(prefixes: readonly string[]): string {
  const parts: string[] = []
  const rest = new Set(prefixes)
  for (const modifier of ['', '@', 'max-']) {
    const run = BREAKPOINTS.map((bp) => `${modifier}${bp}`)
    if (run.every((prefix) => rest.has(prefix))) {
      parts.push(`\`${run[0]}:\`–\`${run.at(-1)}:\``)
      for (const prefix of run) rest.delete(prefix)
    }
  }
  return [...parts, ...[...rest].map((prefix) => `\`${prefix}:\``)].join(', ')
}

// Why a class is not in the catalog in a CSS mode, or undefined when it is. A name is a base
// class behind an optional variant prefix (`md:d-flex`, `md:hover:p-md` in tailwind mode). In
// the native build a base takes the prefixes the stylesheet has for it; in the Tailwind entry
// a utility takes every Tailwind variant, a component class none but what the stylesheet has
function problemOf(name: string, mode: Mode): string | undefined {
  const colon = name.lastIndexOf(':')
  const prefix = colon === -1 ? undefined : name.slice(0, colon)
  const base = colon === -1 ? name : name.slice(colon + 1)
  const utility = utilities.has(base)
  const takes = prefixesOf(base)

  if (!isClass(base)) {
    const subject = prefix === undefined ? 'not' : `\`${base}\` is not`
    const note =
      mode === 'tailwind'
        ? ' (Tailwind core utilities are not checked here; the skill writes Chassis names)'
        : ''
    return `${subject} a Chassis class${note}`
  }
  if (prefix === undefined || takes.includes(prefix)) return undefined

  if (mode === 'native') {
    if (!nativePrefixes.includes(prefix)) {
      return `\`${prefix}:\` is not a variant prefix of the native build; they are ${variants(nativePrefixes)}, each on the classes that take it`
    }
    const has =
      takes.length > 0
        ? `it takes ${variants(takes)}`
        : 'it takes no variant prefix in the native build'
    const tailwind = utility ? '; in tailwind mode every Tailwind variant applies to it' : ''
    return `\`${base}\` does not take \`${prefix}:\`: ${has}${tailwind}`
  }

  if (utility) return undefined
  const has = takes.length > 0 ? `, only ${variants(takes)} of the stylesheet` : ''
  return `\`${base}\` is not a utility of the Tailwind entry, so no Tailwind variant applies to it${has}`
}

// What chassis_check_classes answers: one line per class that is not in the catalog, with the
// section of css-classes.md to read and the classes near it, or one line when every class is.
// An input without a class name is an error
export function checkClasses(
  inputs: readonly string[],
  mode: Mode
): { text: string; isError: boolean } {
  const names = classNamesOf(inputs)
  const where = `@chassis-ui/css ${list.version}, ${mode} mode`
  if (names.length === 0) {
    return {
      text: 'No class names given. Pass class names, the values of class attributes, or markup, whose `class` attributes are read.',
      isError: true
    }
  }

  const refused = names.flatMap((name) => {
    const problem = problemOf(name, mode)
    return problem === undefined ? [] : [{ name, problem }]
  })
  if (refused.length === 0) {
    const all = names.length === 1 ? 'The class is' : `All ${names.length} classes are`
    return { text: `${all} in the Chassis catalog (${where}).`, isError: false }
  }

  const lines = refused.map(({ name, problem }) => {
    const base = name.slice(name.lastIndexOf(':') + 1)
    const section = sectionOf(base)
    const near = nearOf(base)
    const parts = [
      `- \`${name}\`: ${problem}.`,
      section && `Catalog section: ${section}.`,
      near.length > 0 &&
        `Near it: ${code(near.slice(0, 8))}${near.length > 8 ? ` and ${near.length - 8} more` : ''}.`
    ]
    return parts.filter(Boolean).join(' ')
  })

  const text = [
    `${refused.length} of ${names.length} class${names.length === 1 ? '' : 'es'} ${refused.length === 1 ? 'is' : 'are'} not in the Chassis catalog (${where}):`,
    lines.join('\n'),
    'The other classes are in the catalog. A catalog section is fetched with `chassis_get_reference`, name `chassis-implement-design/references/css-classes`, `section` as named above.'
  ].join('\n\n')
  return { text, isError: false }
}
