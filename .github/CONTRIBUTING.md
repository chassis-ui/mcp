# Contributing to Chassis MCP

Thanks for taking the time to contribute. This doc covers dev setup, conventions, and what a pull
request needs before it can be merged.

## Dev setup

You need Node.js 22.12 or later and pnpm (the version in `packageManager` of `package.json`;
`corepack enable` picks it up).

```sh
git clone https://github.com/chassis-ui/mcp.git chassis-mcp
cd chassis-mcp
pnpm install
```

`pnpm install` also writes `server/content.generated.ts`, which the server imports and git
ignores (see [What is generated](#what-is-generated)).

The repository is one package, not a workspace:

| Path                                                                                 | What it holds                                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [`skills/`](../skills/)                                                              | The two agent skills: a `SKILL.md` each, and the reference files it sends an agent to in `references/` |
| [`prompts/`](../prompts/)                                                            | The `/chassis-ui` prompt                                                                               |
| [`server/`](../server/)                                                              | The MCP server: its resources, prompts and tools, and `dev.ts`, which serves it locally                |
| [`api/index.ts`](../api/index.ts)                                                    | The HTTP handler that Vercel deploys as `https://mcp.chassis-ui.com/mcp`                               |
| [`build/`](../build/)                                                                | The two generators, and their tests in `build/tests/`                                                  |
| [`tests/`](../tests/)                                                                | The tests of the server and the handler                                                                |
| `.claude-plugin/`, `.cursor-plugin/`, `.github/plugin/`, [`.mcp.json`](../.mcp.json) | The plugin manifests, and the MCP servers the plugin installs                                          |

## Running the server

```sh
pnpm dev
```

This serves the handler of `api/index.ts` at `http://localhost:3000/mcp` and restarts it when a
file of `server/` or `api/` changes. Set `PORT` for another port. After a change to `skills/` or
`prompts/`, run `pnpm build` so the server has the new text.

To call it by hand, run the MCP Inspector against it in a second terminal:

```sh
pnpm inspect
```

The script reads `PORT` with shell syntax (`${PORT:-3000}`), which `cmd.exe` does not expand: on
Windows, run it from Git Bash or WSL.

To try it in an agent, add the local server to your own client under another name. Don't edit
[`.mcp.json`](../.mcp.json): it is the list of servers the plugin installs for its users, and it
points at production. In Claude Code:

```sh
claude mcp add --transport http --scope local chassis-ui-local http://localhost:3000/mcp
```

`--scope local` keeps the entry in your own settings for this project, outside the repository.
Remove it with `claude mcp remove chassis-ui-local`.

## What is generated

Two files are written by scripts. Never edit either by hand.

- **`server/content.generated.ts`** holds the text of every Markdown file of `skills/` and
  `prompts/` and the version of `package.json`, so the deployed function reads nothing from disk.
  `build/generate-content.js` writes it on `pnpm install` and `pnpm build`, and the tests write it
  before they run. It is not committed.
- **`skills/chassis-implement-design/references/css-classes.md`** is the class catalog of the
  chassis-implement-design skill. `build/generate-css-classes.js` writes it from the compiled
  stylesheet of the `@chassis-ui/css` development dependency, and it **is** committed. After a
  bump of `@chassis-ui/css`, or a change to the generator:

  ```sh
  pnpm generate
  ```

  Commit the result with the change. `pnpm verify` and the Verify job of CI fail when the commit
  and a fresh run differ. Set `CHASSIS_CSS_DIR` to a checkout of `chassis-css/packages/css` to
  generate from a build that is not released yet.

## Changing a skill

The skills are the product: an agent follows them word for word, and nothing but the agent checks
them.

- Say what an agent must do, in the order it does it. Give the reason for a rule, so the agent
  can apply it to a case the skill does not list.
- A name of a class, a token, a component or a Figma API call must exist. For Chassis CSS,
  `references/css-classes.md` lists every class of the framework; a class that is not there does
  not exist.
- Try the change with an agent, on a real Figma frame, before you open the pull request, and say
  in the pull request which client and model you used.
- Both skills need the Figma MCP server in the agent's session. The plugin installs it with the
  Chassis server.

To add a reference file, add the Markdown file to `skills/<skill>/references/`, add its entry to
[`server/resources.ts`](../server/resources.ts) (the name is the path without `skills/` and
`.md`), mention it in the `SKILL.md` where the agent needs it, and run `pnpm test -u` to add it to
the snapshot. The tests of `tests/registry.test.ts` fail while a file of `skills/` is missing
from the server.

## Changing the server

- The handler is stateless: every request gets a new server and a new transport, and there is no
  session. Test a change through the handler, with `pnpm dev` or in `tests/handler.test.ts`, and
  not only through `createServer()` in memory: the handler is what Vercel runs.
- The names, descriptions and inputs of the tools, prompts and resources are what every client is
  shown. `tests/__snapshots__/server.test.ts.snap` holds them; a change to that file is a change
  for every agent that uses the server. Update it with `pnpm test -u` and review the difference.
- `console.log` is a lint error in `server/` and `api/`. Write diagnostics with `console.error`.

## Branch and commit conventions

`develop` is the integration branch: branch from it, and open pull requests against it. `main`
is what users run: Vercel deploys every push to `main` to `https://mcp.chassis-ui.com/mcp`, and
the plugin installs from it (see [Releases](#releases)).

Commits follow [Conventional Commits](https://www.conventionalcommits.org), with an imperative,
lower-case summary:

- **Types in use**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`.
- **Scopes in use**: `deps` for dependency changes; omitted otherwise. Add `server` or `skills`
  when it helps.
- Examples from this repo's history: `build(deps): drop @vercel/node, bump the sdk and the lint
toolchain`, `refactor: take the server version from package.json`, `ci: add the ci workflow`.

Branch names aren't templated; name yours descriptively (for example `fix/tooltip-markup`).

## What a pull request needs before merge

- **Passing CI**: `.github/workflows/ci.yml` runs on every pull request and every push to
  `develop`. Its jobs are Check (ESLint, Prettier on the whole repository, the type check, the
  tests of the server and the tests of the build scripts, on Node.js 22 and 24), Verify (the
  class catalog matches a fresh run of its generator), Audit (`pnpm check:pnpm`, which is
  `pnpm audit --prod` and fails on a moderate advisory in what the server runs; the audit of the
  tooling is reported and doesn't fail) and Dependency Review on a pull request. One command
  runs all of them but the dependency review locally:

  ```sh
  pnpm test:ci
  ```

- **The regenerated catalog** committed with any change to `@chassis-ui/css` or its generator.
- **A test** for a change of behavior in `server/`, `api/` or `build/`.
- **A trial with an agent** for a change to a skill, a reference or a prompt.

## Releases

A release is a version commit on `develop` that reaches `main`.

1. On `develop`, a maintainer bumps the version:

   ```sh
   pnpm change-version --patch
   ```

   (`--minor` and `--major` likewise; `--dry-run` shows what would change.) It writes the new
   version to `package.json` and to the three plugin manifests. The server reads its version
   from `package.json` at build time.

2. The maintainer commits the result, pushes `develop` and waits for CI to pass on that commit.
3. The maintainer merges `develop` into `main` and pushes `main`. Vercel builds and deploys the
   function, and the plugin marketplace serves the new skills, since Claude Code installs the
   plugin from the default branch.

There is no changelog and no tag yet.

## Using the issue tracker

Search existing (including closed) issues first, then
[open a new one](https://github.com/chassis-ui/mcp/issues/new/choose) if your bug or idea isn't
already covered. For a security vulnerability, don't open a public issue; see
[`SECURITY.md`](SECURITY.md). Everyone taking part follows the
[Code of Conduct](CODE_OF_CONDUCT.md).
