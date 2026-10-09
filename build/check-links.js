// Checks the links of the repository's Markdown files, so a moved file or a renamed heading
// shows up before a reader, or an agent that follows a skill, finds it.
//
//   node build/check-links.js            relative paths, heading anchors and external URLs
//   node build/check-links.js --offline  the same without the external URLs
//
// Checks every Markdown file under the directory it is run in, so a new file is checked
// without being listed. Exits 1 and lists every broken link when one is found. Run it from
// the root of the repository.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import GithubSlugger from 'github-slugger'

const { values: options } = parseArgs({
  options: {
    offline: { type: 'boolean', default: false }
  }
})

const root = process.cwd()

// Not the repository's own text: installed packages, local files that git ignores, and the
// files the tests of the build scripts read
const SKIPPED = new Set(['node_modules', '.git', '.claude', '.vercel', 'dist', 'fixtures'])

// A file of this repository on GitHub, named by its URL. Checked in the working tree: `main`
// gets a file that a change adds or moves only when the change is released.
const OWN_FILE_RE = /^https:\/\/github\.com\/chassis-ui\/mcp\/(?:blob|tree)\/main\/([^#?]+)/

const broken = []

function report(file, link, reason) {
  broken.push(`${file}: ${link} (${reason})`)
}

function markdownFiles(directory = '') {
  return readdirSync(path.join(root, directory), { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return SKIPPED.has(entry.name) ? [] : markdownFiles(entryPath)
      }

      return entry.name.endsWith('.md') ? [entryPath] : []
    })
    .sort()
}

function stripCodeBlocks(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '')
}

function stripCode(markdown) {
  return stripCodeBlocks(markdown).replace(/`[^`\n]*`/g, '')
}

function markdownLinks(markdown) {
  const text = stripCode(markdown)
  const links = []
  for (const match of text.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    links.push(match[1])
  }

  for (const match of text.matchAll(/^\s*\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)/gm)) {
    links.push(match[1])
  }

  return [...new Set(links)]
}

function markdownAnchors(markdown) {
  const slugger = new GithubSlugger()
  const anchors = new Set()
  for (const match of stripCodeBlocks(markdown).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    anchors.add(slugger.slug(match[1].replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')))
  }

  return anchors
}

async function fetchStatus(url) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const method of ['HEAD', 'GET']) {
      try {
        const response = await fetch(url, {
          method,
          redirect: 'follow',
          signal: AbortSignal.timeout(15_000),
          headers: { 'user-agent': 'chassis-mcp-link-check' }
        })
        if (response.ok) {
          return response.status
        }

        // Some servers refuse HEAD but answer GET; a 404 is final.
        lastError = response.status
        if (response.status === 404 || response.status === 410) {
          return response.status
        }
      } catch (error) {
        lastError = error.cause?.code ?? error.name
      }
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1000 * attempt)
    })
  }

  return lastError
}

const files = markdownFiles()
const external = new Map()

for (const file of files) {
  const absolute = path.join(root, file)
  const markdown = readFileSync(absolute, 'utf8')

  for (const link of markdownLinks(markdown)) {
    const ownFile = OWN_FILE_RE.exec(link)
    if (ownFile) {
      if (!existsSync(path.join(root, decodeURI(ownFile[1])))) {
        report(file, link, 'no such file')
      }

      continue
    }

    if (/^https?:\/\//.test(link)) {
      if (!external.has(link)) {
        external.set(link, [])
      }

      external.get(link).push(file)
      continue
    }

    if (/^[a-z]+:/i.test(link)) {
      continue
    }

    const [target, anchor] = link.split('#')
    const targetFile = target ? path.resolve(path.dirname(absolute), decodeURI(target)) : absolute
    if (!existsSync(targetFile)) {
      report(file, link, 'no such file')
      continue
    }

    if (
      anchor &&
      targetFile.endsWith('.md') &&
      !markdownAnchors(readFileSync(targetFile, 'utf8')).has(anchor)
    ) {
      report(file, link, 'no such heading')
    }
  }
}

if (!options.offline) {
  await Promise.all(
    [...external].map(async ([url, urlFiles]) => {
      const status = await fetchStatus(url)
      if (typeof status !== 'number' || status >= 400) {
        for (const file of urlFiles) {
          report(file, url, String(status))
        }
      }
    })
  )
}

if (broken.length > 0) {
  console.error(`${broken.length} broken link${broken.length === 1 ? '' : 's'}:`)
  for (const line of broken.sort()) {
    console.error(`  ${line}`)
  }

  process.exit(1)
}

console.log(
  `All links of ${files.length} Markdown files resolve${options.offline ? ' (external URLs not checked)' : ''}.`
)
