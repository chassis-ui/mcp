# Changelog

## 0.3.0

### Minor Changes

- 6af5b69: The skill tools return the instructions and an index of the references, not every reference.

  - **Breaking:** `chassis_create_design` and `chassis_implement_design` return the `SKILL.md` without its frontmatter, followed by an index of the skill's reference files: for each its file name, its size, the line the skill gives it, its title and its name for `chassis_get_reference`. A call is 29 KB and 9 KB instead of 106 KB and 94 KB; an agent fetches a reference when the instructions send it there. The input `full: true` returns what the tools returned before, the instructions and every reference inline
  - The prompts `chassis-create-design` and `chassis-implement-design` keep returning the whole skill: a prompt is the user's own choice
  - `chassis_get_reference` says in its description what it returns; its names are unchanged
  - The resource registry carries the one-line summary each `SKILL.md` gives its references, and the build fails for a reference the `SKILL.md` does not list that way

## 0.2.0

### Minor Changes

- 06e2673: `chassis-implement-design` is rewritten for Chassis CSS 0.7, and the plugin installs from a marketplace.

  - **Breaking:** `chassis-implement-design` writes markup for `@chassis-ui/css` 0.7: the short size names (`p-md`), the `sm:` to `2xl:` and `@sm:` to `@2xl:` prefixes, the CSS grid and the current component classes. A project on an earlier Chassis CSS gets classes it does not have
  - The skill works in a native CSS project and in a Tailwind CSS v4 project that uses the Chassis Tailwind entry, and says how the two differ
  - `references/css-classes.md` is generated from the compiled stylesheet of `@chassis-ui/css` 0.7.2: every class, its variant prefixes, the subparts and modifiers of each component, the `data-cx-*` attributes and the facts of the Tailwind entry
  - `references/tokens.md`, `components.md`, `patterns.md` and `workflow.md` of the skill follow: the translation of the Figma token namespaces to classes, the current markup of each component family, theming with `data-cx-theme`
  - Claude Code installs the plugin with `/plugin marketplace add chassis-ui/mcp` and `/plugin install chassis-ui@chassis-ui`
  - The server runs on `@modelcontextprotocol/sdk` 1.32, and reports the version of the release, which it no longer holds as a string of its own
  - The README covers the plugin, Cursor and other MCP clients, and names the Figma MCP server the skills need

  No tool, prompt or resource changed its name or its input.

- c0976df: The server greets a browser, reports its health and fails as JSON-RPC.

  - `https://mcp.chassis-ui.com/mcp` and `https://mcp.chassis-ui.com/` opened in a browser show a page with the version, the endpoint and the install commands; `GET /health` answers `{ "ok": true, "version": "<version>" }`
  - An MCP client that opens the standalone event stream (`GET` with `Accept: text/event-stream`) gets 405: the server sends no server-initiated messages, and the stream only held a function open. The official SDKs take 405 as "no stream" and go on
  - A failure inside the function answers a JSON-RPC error `-32603` with status 500, and a body over 4 MiB a 413, instead of a request that hangs; the detail goes to the logs
  - The CORS headers allow `Mcp-Protocol-Version`, which clients send since protocol 2025-06-18, and expose `Mcp-Session-Id`
  - The description of a resource is now the frontmatter description of the skill or the title of the reference file, taken from the file; the registry of resources is generated with the content, so a reference file cannot be left out of the server. The names and URIs of the resources are unchanged
  - The skill bundles are built once per instance of the function, not on every call

### Patch Changes

- 758ef28: The `chassis-ui` prompt and two links of the skills are corrected.

  - The `chassis-ui` prompt no longer sends an agent to `component-keys.md`, a reference file that was removed: it says to resolve a `componentKey` at runtime with `search_design_system`, as the `chassis-create-design` skill does
  - `chassis-implement-design`: the link to the lint checklist of `workflow.md` points at its heading, and the auto-layout table of `patterns.md` is a table again (the alternatives of `justify-content-*` and `align-items-*` are written with escaped pipes)

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
