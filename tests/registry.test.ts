// server/resources.ts is written by hand and server/content.generated.ts by
// build/generate-content.js. These tests fail when either one misses a file of skills/ or
// prompts/, so a new reference cannot be left out of the server without a red test.

import { describe, expect, test } from 'vitest'
import { CONTENT, VERSION } from '../server/content.generated.js'
import { RESOURCES } from '../server/resources.js'
import { markdownFiles, read, version } from './helpers.js'

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

  test('describes every resource', () => {
    for (const { description, path } of RESOURCES) {
      expect(description.length, path).toBeGreaterThan(10)
    }
  })
})
