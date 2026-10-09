// Copies the version of package.json into the plugin manifests. They show the version to the
// users of the plugin and are not part of a dependency graph, so `changeset version` cannot
// update them.
//
// Runs as part of `pnpm changeset:version`, after `changeset version` has bumped package.json,
// which is the source of the version. Run it from the root of the repository.

import fs from 'node:fs/promises'
import path from 'node:path'

const MANIFESTS = [
  '.claude-plugin/plugin.json',
  '.cursor-plugin/plugin.json',
  '.github/plugin/plugin.json'
]

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?$/
// The top-level field: a manifest is indented by two spaces
const VERSION_RE = /^( {2}"version":\s*)"[^"]*"/m

async function readVersion() {
  const pkg = JSON.parse(await fs.readFile(path.resolve('package.json'), 'utf8'))

  if (!pkg.version || !SEMVER_RE.test(pkg.version)) {
    console.error(`❌ Invalid or missing version in package.json: "${pkg.version}"`)
    process.exit(1)
  }

  return pkg.version
}

/**
 * Writes the version into one manifest, leaving the rest of the file as it is
 * @param {string} file - The manifest, from the root of the repository
 * @param {string} version - The package version
 * @returns {Promise<boolean>} True if the file was changed
 */
async function syncManifest(file, version) {
  const original = await fs.readFile(file, 'utf8')

  if (!VERSION_RE.test(original)) {
    console.error(`❌ No version field in ${file}`)
    process.exit(1)
  }

  const updated = original.replace(VERSION_RE, (_match, field) => `${field}"${version}"`)

  if (updated === original) {
    return false
  }

  await fs.writeFile(file, updated, 'utf8')
  console.log(`📄 Updated ${file} → ${version}`)
  return true
}

async function main() {
  const version = await readVersion()
  console.log(`🔄 Syncing version references to v${version}`)

  const results = []
  for (const file of MANIFESTS) {
    results.push(await syncManifest(file, version))
  }

  const updatedCount = results.filter(Boolean).length

  console.log(
    updatedCount > 0
      ? `✅ Synced ${updatedCount} of ${results.length} references`
      : 'ℹ️  Already in sync, nothing to update'
  )
}

main().catch((error) => {
  console.error(`❌ Unexpected error: ${error.message}`)
  process.exit(1)
})
