import { execFileSync } from 'node:child_process'
import { root } from './helpers.js'

// The tests compare the server with skills/ and prompts/ as they are on disk, so the
// generated module must not be the one of an earlier edit
export default function setup(): void {
  execFileSync(process.execPath, ['build/generate-content.js'], { cwd: root, stdio: 'pipe' })
}
