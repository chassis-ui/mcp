// What the tests of the build scripts share.
//
// A generator finds the repository from its own path. A test copies it into a directory of
// its own, next to the files it reads, runs it there with Node.js as `pnpm` runs it, and
// reads the exit code, the output and the files it wrote. Nothing of the repository is
// changed.

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * Writes files into a directory, creating the directories they are in
 * @param {string} dir - The directory
 * @param {Record<string, string>} files - The content by path
 */
export function writeFiles(dir, files) {
  for (const [file, content] of Object.entries(files)) {
    const absolute = path.join(dir, file)

    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    fs.writeFileSync(absolute, content)
  }
}

/**
 * Creates a temporary directory that holds a copy of a build script and the given files
 * @param {string} script - The script, from the root of the repository
 * @param {Record<string, string>} [files] - The content by path
 * @returns {string} The directory
 */
export function createFixture(script, files = {}) {
  // The real path: macOS has its temporary directory behind a symbolic link
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'chassis-mcp-build-test-')))

  writeFiles(dir, { ...files, [script]: fs.readFileSync(path.join(root, script), 'utf8') })
  // The packages a script imports. A junction on Windows, where a symbolic link needs rights
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'junction')
  return dir
}

export function removeFixture(dir) {
  fs.rmSync(dir, { recursive: true, force: true })
}

export function readFile(dir, file) {
  return fs.readFileSync(path.join(dir, file), 'utf8')
}

/**
 * Runs the copy of a script in a fixture with Node.js
 * @param {string} dir - The directory of the fixture
 * @param {string} script - The script, from the root of the fixture
 * @param {Record<string, string | undefined>} [env] - Environment variables to add
 * @returns {Promise<{ status: number, stdout: string, stderr: string }>} Never rejects on a
 *   failing exit code
 */
export function runScript(dir, script, env = {}) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [path.join(dir, script)],
      { cwd: dir, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: undefined, ...env } },
      (error, stdout, stderr) => {
        if (error && typeof error.code !== 'number') {
          reject(error)
          return
        }

        resolve({ status: error ? error.code : 0, stdout, stderr })
      }
    )
  })
}
