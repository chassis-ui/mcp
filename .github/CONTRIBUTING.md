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
  tooling is reported and doesn't fail), Changeset, and Dependency Review on a pull request.
  One command runs all of them but the changeset check and the dependency review locally:

  ```sh
  pnpm test:ci
  ```

- **A changeset** for anything that changes what users get: the server, a skill, a reference,
  a prompt or the plugin files. CI fails a pull request or a push to `develop` that changes
  `server/`, `api/`, `skills/`, `prompts/`, a generator or a plugin file without one; for such a
  change that releases nothing, such as a refactor, add an empty changeset (see
  [Changesets](#changesets)). A pull request that only touches the docs, the tests or the tooling
  doesn't need one.
- **The regenerated catalog** committed with any change to `@chassis-ui/css` or its generator.
- **A test** for a change of behavior in `server/`, `api/` or `build/`.
- **A trial with an agent** for a change to a skill, a reference or a prompt.

## Changesets

A changeset is a Markdown file in [`.changeset/`](../.changeset/) that names the version bump and
the text of the CHANGELOG entry. Write one with:

```sh
pnpm changeset
```

Pick the bump, then write the entry: what changed for someone who uses the server or the plugin,
and what they have to change, if anything. Commit the file with your change. The bump follows
semver, with the names and inputs of the tools, prompts and resources, and what a skill produces,
as the public API:

- **major**: a tool, prompt or resource is renamed or removed, or its input changes; a skill
  starts to produce what an existing project cannot use (markup for a new major version of
  Chassis CSS, for example). While the version is `0.x`, use **minor** for these and start the
  entry with `**Breaking:**`.
- **minor**: a new tool, prompt, resource, skill or reference; a skill that covers more.
- **patch**: a corrected instruction, class or token name; a fix in the server.

For a change that releases nothing, add an empty changeset instead:

```sh
pnpm changeset --empty
```

## Releases

A release is a version commit on `develop` that reaches `main`. The checks of a commit run once,
on `develop`; pushing the same commit to `main` doesn't run them again.

1. On `develop`, a maintainer runs `pnpm changeset:version`. It removes the changesets, bumps the
   version in `package.json`, writes the entry of [`CHANGELOG.md`](../CHANGELOG.md) and copies the
   version into the three plugin manifests. The maintainer reviews the result, commits it and
   pushes `develop`.
2. CI runs on that commit. The Changeset job skips the push, since it changes the version.
3. When CI has passed, the maintainer pushes the same commit to `main`:

   ```sh
   git push origin develop:main
   ```

   The ruleset of `main` requires the checks `Check (Node 22)`, `Check (Node 24)` and `Verify`
   on the commit, and blocks a force push and a deletion. A merge commit made for `main` would
   have no checks, so `main` only ever moves forward to a commit of `develop`.

4. The push is the release, in three parts that don't wait for each other:
   - **Vercel** builds `main` and serves it at `https://mcp.chassis-ui.com/mcp`.
   - **The plugin** is installed from `main`, so Claude Code gets the new skills on the next
     update of the marketplace.
   - **`.github/workflows/release.yml`** reads the version and stops when the tag `v<version>`
     exists: a push to `main` without a new version releases nothing. Otherwise it reads the
     check-runs of the commit by name, stops unless `Check (Node 22)`, `Check (Node 24)` and
     `Verify` passed on it, and creates the tag and the GitHub release `v<version>` with the
     CHANGELOG entry as its body.

`develop` and `main` are at the same commit after a release, so nothing is merged back.

A version without a CHANGELOG entry gets no GitHub release, though Vercel deploys it: don't
push a version to `main` that `pnpm changeset:version` didn't make. A version with a prerelease
part (`0.2.0-next.0`) is marked as a prerelease.

The job names `Check (Node 22)`, `Check (Node 24)` and `Verify` are the required checks of the
ruleset of `main`, and they are in the `REQUIRED` list of `release.yml`. Rename a job in
`ci.yml`, the ruleset and `release.yml` together.

## Using the issue tracker

Search existing (including closed) issues first, then
[open a new one](https://github.com/chassis-ui/mcp/issues/new/choose) if your bug or idea isn't
already covered. For a security vulnerability, don't open a public issue; see
[`SECURITY.md`](SECURITY.md). Everyone taking part follows the
[Code of Conduct](CODE_OF_CONDUCT.md).
