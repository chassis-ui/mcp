## What this changes

<!-- One or two sentences. If it fixes an open issue, add "Fixes #123". -->

## Why

<!-- The problem this solves. For a skill change, what an agent got wrong before it. -->

## How to check it

<!--
The quickest way for a reviewer to see it: a request to the local server, the test that fails
without the change, or the prompt and the Figma frame a skill change was tried on.
-->

---

See [CONTRIBUTING.md](CONTRIBUTING.md#what-a-pull-request-needs-before-merge) for the details
behind each of these.

- [ ] `pnpm test:ci` passes locally
- [ ] **Changeset** (`pnpm changeset`) if the server, a skill, a reference, a prompt or a plugin
      file changed, saying what a user has to change; an empty one (`pnpm changeset --empty`) if
      the change releases nothing
- [ ] **`css-classes.md` regenerated** with `pnpm generate` and committed, if `@chassis-ui/css`
      or `build/generate-css-classes.js` changed; never edited by hand
- [ ] **`server/resources.ts` updated**, if a file was added to or removed from `skills/`
- [ ] **Snapshot updated** (`pnpm test -u`) and reviewed, if a tool, prompt or resource changed
      its name, description or input
- [ ] **Tried with an agent**, if a skill, reference or prompt changed: which client, and on what
