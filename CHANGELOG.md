# Changelog

## [0.1.5] - 2026-05-06

### Changed

- The README describes how to add the server to a project and how to copy the skills
- The plugin manifest under `.github/plugin/` has a display name, a repository and the description of the other two

## [0.1.4] - 2026-05-06

### Changed

- The server reports its own version to a client, in step with the plugin

## [0.1.3] - 2026-05-06

### Changed

- The Claude Code plugin loads the skills from `skills/`, so they are its slash commands

## [0.1.2] - 2026-05-06

### Changed

- `chassis-create-design`: rules and recipes from design sessions, on typography, patterns and the workflow, and a shorter text that takes less of an agent's context

## [0.1.1] - 2026-05-03

### Added

- The tools `chassis_create_design`, `chassis_implement_design` and `chassis_get_reference`, and the prompts `chassis-create-design` and `chassis-implement-design`, which return a skill with its reference files

### Changed

- `chassis-implement-design` no longer translates Bootstrap class names

### Fixed

- The deployment on Vercel

## [0.1.0] - 2026-04-30

### Added

- The skills `chassis-create-design` and `chassis-implement-design`, with their reference files
- The `/chassis-ui` prompt
- The MCP server at `https://mcp.chassis-ui.com/mcp`, with every skill and reference file as a resource
- Plugin manifests for Claude Code, for Cursor and under `.github/plugin/`
