# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

Chassis MCP is the MCP server and the agent skills of the Chassis UI design system. It has two deliverables, and both ship the same Markdown:

- **The hosted MCP server**, `https://mcp.chassis-ui.com/mcp`: one stateless HTTP function on Vercel. It serves the skills as resources, as prompts and through three tools (`chassis_create_design`, `chassis_implement_design`, `chassis_get_reference`).
- **The plugin** for Claude Code and Cursor: the skills of `skills/` as slash commands, and the MCP servers of `.mcp.json` (this server and the Figma MCP server, which both skills need).

The repository is one package (`private`, not published to npm), not a workspace:

```
skills/
  chassis-create-design/      # SKILL.md and references/: build screens in Figma with Chassis UI
  chassis-implement-design/   # SKILL.md and references/: Figma designs to Chassis CSS markup
prompts/
  chassis-ui.prompt.md        # the /chassis-ui prompt
server/
  index.ts                    # createServer(): the resources, prompts and tools
  content.generated.ts        # generated, not committed: the Markdown and the resource registry
  dev.ts                      # serves the handler locally (pnpm dev)
api/
  index.ts                    # the HTTP handler Vercel deploys
build/
  generate-content.js         # skills/ and prompts/ into server/content.generated.ts, with the registry
  generate-css-classes.js     # @chassis-ui/css into references/css-classes.md
  sync-version-refs.js        # the version of package.json into the plugin manifests
  release-notes.js            # the CHANGELOG entry of a version, for the GitHub release
  validate-skills.js          # the frontmatter, file names, headings and tables of the skills
  check-links.js              # the links of every Markdown file
  tests/                      # node --test: each build script on files of its own
tests/                        # Vitest: the server in memory, the handler over HTTP
.claude-plugin/               # plugin.json and marketplace.json for Claude Code
.cursor-plugin/               # plugin.json for Cursor
.github/plugin/               # a third plugin.json
.mcp.json                     # the MCP servers the plugin installs
.changeset/                   # the changesets of the next version
CHANGELOG.md                  # written by the version step
```

This repo is part of a multi-repo ecosystem (`chassis-tokens`, `chassis-css`, `chassis-react`, `chassis-icons`, `chassis-assets`, `chassis-figma`, `chassis-website`). The skills describe `chassis-css` and the Chassis UI Figma library; when a skill and the framework disagree, the framework is right.

Human contributors follow [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md): dev setup, branches, what a pull request needs, and how releases are made.

## Quick commands

Package manager is **pnpm** (pinned in `package.json`), with Node.js 22.12 or later (`.nvmrc` has 24, the version of the single-version CI jobs). Run `pnpm install` first; it also writes `server/content.generated.ts`.

- `pnpm dev` — the handler at `http://localhost:3000/mcp` (`PORT` changes the port), restarted on a change to `server/` or `api/`
- `pnpm inspect` — the MCP Inspector against the local server
- `pnpm build` — writes `server/content.generated.ts`, then `tsc --noEmit`; what Vercel runs
- `pnpm generate` — writes `css-classes.md` and `server/content.generated.ts`
- `pnpm lint` — ESLint, with typescript-eslint's recommended rules on `server/`, `api/` and `tests/`
- `pnpm lint:prettier` — Prettier over the whole repository; `pnpm format` writes
- `pnpm lint:skills` — the frontmatter of the skills and prompts, the reference files they name, one level-one heading in each file, well-formed tables, and the `@chassis-ui/css` version in the banner of `css-classes.md`
- `pnpm docs:links:offline` — the relative links and heading anchors of every Markdown file; `pnpm docs:links` also requests the external URLs
- `pnpm lint:spell` — cspell over the Markdown files; a word of the project goes into `.cspell.json`
- `pnpm typecheck` — `tsc --noEmit` over `server/`, `api/` and `tests/`
- `pnpm test` — Vitest (`tests/`): the registry, the contract of the server through the SDK client in memory, the handler over HTTP. `pnpm test -u` updates the snapshot
- `pnpm build:test` — `node --test` (`build/tests/`): each build script on files of its own, never on the repository
- `pnpm verify` — `pnpm generate`, then fails when `css-classes.md` differs from the commit
- `pnpm check:pnpm` — `pnpm audit --prod`, failing on a moderate advisory
- `pnpm changeset` — writes a changeset; `pnpm changeset --empty` writes one that releases nothing
- `pnpm test:ci` — every check of `.github/workflows/ci.yml` except the changeset check, the external links and the dependency review, in one run. A test in `build/tests/` fails when the workflow runs a script that `test:ci` does not

## Before a task is done

Run the checks of the area you changed, and report the ones that fail.

| Area changed                              | Run                                                                                                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skills/`, `prompts/`                     | `pnpm lint:prettier`, `pnpm lint:skills`, `pnpm docs:links:offline`, `pnpm lint:spell`, `pnpm test`; a changeset                                   |
| A file added to or removed from `skills/` | the row above, then `pnpm test -u` and a look at the snapshot: the registry is generated from the files                                            |
| `server/`, `api/`                         | `pnpm lint`, `pnpm typecheck`, `pnpm test`; add a test for a change of behavior, and a changeset                                                   |
| `build/`                                  | `pnpm lint`, `pnpm build:test`, `pnpm verify`; add a test in `build/tests/` for a change of behavior                                               |
| `@chassis-ui/css` in `package.json`       | `pnpm install`, `pnpm generate`, commit the new `css-classes.md`, `pnpm verify`                                                                    |
| `package.json`, `pnpm-lock.yaml`          | `pnpm install --frozen-lockfile`, `pnpm test:ci`                                                                                                   |
| `.github/workflows/`                      | `actionlint`, and `pnpm build:test`: a script `ci.yml` runs is part of `test:ci`. A job name is also in the ruleset of `main` and in `release.yml` |
| README or other Markdown                  | `pnpm lint:prettier`, `pnpm docs:links`, `pnpm lint:spell`                                                                                         |

## Generated files

- `server/content.generated.ts` holds the text of every Markdown file of `skills/` and `prompts/`, the registry of resources (`RESOURCES`) and the version of `package.json`, as a module, so the function reads nothing from disk at runtime. `build/generate-content.js` writes it on `pnpm install`, `pnpm build` and before the tests. Git ignores it. `pnpm dev` does not write it: after a change to a skill, run `pnpm build`.
- `skills/chassis-implement-design/references/css-classes.md` is written by `build/generate-css-classes.js` from the compiled stylesheet of the `@chassis-ui/css` development dependency, and is **committed**. Never edit it. Change the generator or bump the dependency, run `pnpm generate`, and commit the result with the change; the Verify job of CI fails when they differ. `CHASSIS_CSS_DIR` points the generator at a checkout of `chassis-css/packages/css` instead of `node_modules`.

## How the server finds a file

`build/generate-content.js` walks `skills/` once and writes two things into `server/content.generated.ts` from that walk, so they cannot disagree:

- `CONTENT`, the text of every Markdown file of `skills/` and of `prompts/chassis-ui.prompt.md`, keyed by path with forward slashes on every platform (`skills/chassis-create-design/SKILL.md`).
- `RESOURCES`, one entry per file of `skills/` with `name`, `uri`, `description` and `path`, in the order of the skill bundles: the skills by name, and within a skill `SKILL.md` before its references by path. The name is the path without `skills/` and `.md`, and a `SKILL.md` has the name of its directory. The URI is `chassis://skills/<name>`. The description is the frontmatter `description` of a skill and the level-one heading of a reference; a file with neither fails the generator, and so the build. A reference also has `summary`: the text after the dash of the line `- [<file>.md](./references/<file>.md) — …` in its `SKILL.md`. A reference without that line fails the generator too. And it has `sections`: one entry per heading below level one that is not in a code block, with `title`, `anchor` (the one GitHub gives the heading, which a link `file.md#anchor` carries and `pnpm docs:links:offline` checks), `level`, and `start` and `end`, the offsets of the section in the file, from its heading to the next heading of the same level or a higher one.

The server derives the rest from `RESOURCES`, built once when `server/index.ts` loads: a skill bundle (what the two skill prompts return, and `chassis_create_design` and `chassis_implement_design` with `full: true`) is every resource whose name is the skill or starts with `<skill>/`, in the order of the list, without frontmatter; a skill index (what the two tools return by default) is the `SKILL.md` without frontmatter followed by one line per reference with its file name, size, `summary`, `description` and name, and under it the level-two sections of the file with their sizes and the names of their level-three sections; `chassis_get_reference` offers the names that contain `/references/`, and with `section` returns one section of the file: the introduction of the file (what is before its first section), the headings the section is inside, then the section with its subsections. `section` is a heading or an anchor, compared without case and punctuation; one the file does not have, or a heading it has twice, is answered with an error that lists what to ask for.

To add a reference file: add the Markdown file to `skills/<skill>/references/` with one level-one heading, give it a line `- [<file>.md](./references/<file>.md) — <what it holds>` in the References list of the `SKILL.md` and mention it where an agent needs it, and run `pnpm test -u`: the next `pnpm build` or test run puts it in the registry, and the snapshot gains it. `tests/registry.test.ts` compares the registry with the files on disk. A second prompt file needs a line in `build/generate-content.js` and a `registerPrompt` in `server/index.ts`.

## Skill and prompt conventions

- A skill is `skills/<name>/SKILL.md` with the frontmatter `name` (the directory name), `description` (what it does, when to use it and when not to, in one string of at most 1024 characters: an agent picks a skill by it) and `disable-model-invocation`. Its reference files are in `skills/<name>/references/`, without frontmatter, each with one level-one heading. `SKILL.md` names every reference file, lists each as `- [<file>.md](./references/<file>.md) — <one line>` (the line the skill tools show next to the name), and no file of a skill names a Markdown file the skill does not have. `pnpm lint:skills` checks all of this but the line, which the content generator checks.
- Inside a table cell, write a pipe as `\|`, in a code span too: an unescaped pipe ends the cell, and a row with more cells than its header is not a table.
- The prompt file has the frontmatter `mode` and `description`.
- Both skills run on top of the Figma MCP server and its skills. They name its tools (`use_figma`, `get_design_context`, `search_design_system`); a skill must not assume a tool the Figma server does not have.
- An agent follows a skill word for word. Change the meaning of a skill only when the task is about the skill, and say in the summary what an agent will now do differently. A change that only formats (Prettier, a link, a table) must leave every sentence as it was.
- A class, token, component or API name in a skill must exist. For Chassis CSS, `css-classes.md` lists every class; for the rest, check `../chassis-css` and `../chassis-tokens` when they are checked out next to this repository.
- A heading of a reference is the name of a section an agent can fetch by itself (`section` of `chassis_get_reference`), and the skill tools list the headings of level two and three. Write a heading that says what the section holds, no heading twice in one file (a test fails on it), and write the introduction of a reference (before its first level-two heading) so that a section read after it alone is understood: it is sent with every section.
- The two skills each have a `references/tokens.md` on the same token namespaces, one from the Figma side and one from the CSS side. A fact that both state must stay the same in both.

## Server conventions

- The handler is stateless: `api/index.ts` builds a new `McpServer` and a new transport for every request, with no session id. The SDK binds one transport to one server, so do not share either between requests. What they serve is built once, when `server/index.ts` loads.
- `api/index.ts` answers a `GET` without `text/event-stream` in `Accept` with an HTML page (no external asset, nothing of Chassis), `GET /health` with `{ "ok": true, "version": "<version>" }`, a `GET` that opens the event stream with 405 (the server sends no server-initiated messages, so a stream would only hold a function open), and a failure with a JSON-RPC error `-32603` after a `console.error`. On Vercel it uses the body the runtime parsed into `req.body`; locally it reads the stream. `vercel.json` rewrites `/`, `/health` and `/mcp` to the function, which sees the path the client asked for.
- Verify a change through the handler (`pnpm dev`, or `tests/handler.test.ts`), not only through `createServer()` in memory: the handler is what Vercel runs.
- Imports between modules use the `.js` extension (`./resources.js`), which `tsc` and `tsx` resolve to the `.ts` file.
- `console.log` is a lint error in `server/` and `api/`: stdout belongs to the protocol on a stdio transport. Use `console.error`.
- The names, descriptions and input schemas of the tools, prompts and resources are the public API of the server. `tests/__snapshots__/server.test.ts.snap` holds them; a change there is a change for every client.
- CORS is `*` on purpose: the server is public, read-only, and takes no credentials.

## The plugin files

- `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` are the manifests of the Claude Code and Cursor plugins, with the same content: they point at `./skills/` and `./.mcp.json`. `.claude-plugin/marketplace.json` lists the plugin for `/plugin marketplace add chassis-ui/mcp`, which installs from the default branch, `main`.
- `.github/plugin/plugin.json` is a third manifest with its own `homepage` and `author`, and without `skills`, `mcpServers` and `logo`. The three are separate files on purpose; only `version` is the same in all of them, and `build/sync-version-refs.js` writes it in the version step.
- `.mcp.json` is the list of MCP servers the plugin installs for its users. It points at production. Do not point it at localhost; to try a local server, add it to your own client under another name (see CONTRIBUTING.md).

## Formatting

- 2-space indent, LF line endings, final newline, trim trailing whitespace (`.editorconfig`); `.md` keeps trailing whitespace.
- Prettier: single quotes, no semicolons, no trailing commas, 100 print width (80 for `.md`, where prose is not rewrapped and code blocks are left as written).
- `pnpm lint:prettier` checks the whole repository, the skills included, in CI too; `pnpm exec prettier --write <file>` formats a file.

## Commits

Conventional Commits style, with an imperative, lower-case summary: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `build:`, `ci:`, `chore:` (e.g. `refactor: take the server version from package.json`). `deps` is the scope of a dependency change.

Add a changeset (`pnpm changeset`) to a change of what users get, and an empty one (`pnpm changeset --empty`) to a change of `server/`, `api/`, `skills/`, `prompts/`, a generator or a plugin file that releases nothing; CI's Changeset job fails without it. While the version is `0.x`, a breaking change is a `minor` whose text starts with `**Breaking:**`. CONTRIBUTING.md says which bump a change needs.

Never commit, merge or push without being asked. CI runs on `develop` and on pull requests only. **Pushing `main` is a release**: Vercel deploys it to `https://mcp.chassis-ui.com/mcp`, the plugin installs from it, and `release.yml` creates the tag and the GitHub release when the version is new and the CI jobs passed on that commit. `main` only moves forward to a commit of `develop` (`git push origin develop:main`), never by a merge commit. The version is made on `develop` with `pnpm changeset:version`.

## Do not edit

- Generated: `server/content.generated.ts`, `skills/chassis-implement-design/references/css-classes.md` (see [Generated files](#generated-files)).
- Written by the version step (`pnpm changeset:version`): `CHANGELOG.md`, `version` in `package.json` and in the three plugin manifests. It also removes the changesets it used.
- Written by Vitest: `tests/__snapshots__/` (`pnpm test -u`).
