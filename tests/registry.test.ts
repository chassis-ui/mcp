// build/generate-content.js writes server/content.generated.ts: the text of every Markdown file
// of skills/ and prompts/, and the registry of resources the server serves. These tests compare
// both with the files on disk, so a file the generator drops or misnames is a red test.

import { describe, expect, test } from 'vitest'
import { CONTENT, RESOURCES, VERSION } from '../server/content.generated.js'
import { heading, markdownFiles, read, version } from './helpers.js'

const skills = markdownFiles('skills')
const prompts = markdownFiles('prompts')

describe('generated content', () => {
  test('holds every Markdown file of skills/ and prompts/, and nothing else', () => {
    expect(Object.keys(CONTENT).sort()).toEqual([...prompts, ...skills].sort())
  })

  test('holds each file as it is on disk', () => {
    for (const path of Object.keys(CONTENT)) {
      expect(CONTENT[path], path).toBe(read(path))
    }
  })

  test('carries the version of package.json', () => {
    expect(VERSION).toBe(version)
  })
})

describe('resource registry', () => {
  test('lists every Markdown file of skills/, once', () => {
    expect(RESOURCES.map((resource) => resource.path).sort()).toEqual(skills)
  })

  test('points at files that are in the generated content', () => {
    for (const { path } of RESOURCES) {
      expect(Object.keys(CONTENT), path).toContain(path)
    }
  })

  test('has unique names and URIs', () => {
    const names = RESOURCES.map((resource) => resource.name)
    const uris = RESOURCES.map((resource) => resource.uri)

    expect(new Set(names).size).toBe(names.length)
    expect(new Set(uris).size).toBe(uris.length)
  })

  // skills/<skill>/SKILL.md is <skill>, skills/<skill>/references/<file>.md is
  // <skill>/references/<file>
  test('names each resource after its path', () => {
    for (const { name, uri, path } of RESOURCES) {
      const expected = path
        .replace(/^skills\//, '')
        .replace(/\/SKILL\.md$/, '')
        .replace(/\.md$/, '')

      expect(name, path).toBe(expected)
      expect(uri, path).toBe(`chassis://skills/${expected}`)
    }
  })

  // chassis_get_reference offers the names that contain /references/, and a skill bundle is
  // the resources whose names start with the name of the skill
  test('has a skill and at least one reference for every skill directory', () => {
    const names: string[] = RESOURCES.map((resource) => resource.name)

    for (const skill of new Set(skills.map((path) => path.split('/')[1]))) {
      expect(names).toContain(skill)
      expect(names.some((name) => name.startsWith(`${skill}/references/`))).toBe(true)
    }
  })

  // A skill bundle is the resources of a skill in the order of the registry
  test('lists SKILL.md before the references of its skill', () => {
    const paths: string[] = RESOURCES.map((resource) => resource.path)

    for (const skill of new Set(skills.map((path) => path.split('/')[1]))) {
      const own = paths.filter((path) => path.startsWith(`skills/${skill}/`))

      expect(own[0]).toBe(`skills/${skill}/SKILL.md`)
      expect(own.slice(1)).toEqual([...own.slice(1)].sort())
    }
  })

  // The frontmatter description of a skill, the level-one heading of a reference
  test('describes every resource from its file', () => {
    for (const { description, path } of RESOURCES) {
      const file = read(path)
      const expected = path.endsWith('/SKILL.md')
        ? file.match(/^description: '(.+)'$/m)?.[1]
        : heading(file).slice('# '.length)

      expect(description, path).toBe(expected)
    }
  })

  test('keys the content and the registry with forward slashes', () => {
    for (const key of [...Object.keys(CONTENT), ...RESOURCES.map((resource) => resource.path)]) {
      expect(key).not.toContain('\\')
    }
  })
})
