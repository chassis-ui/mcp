---
'@chassis-ui/mcp': minor
---

`chassis-implement-design` is rewritten for Chassis CSS 0.7, and the plugin installs from a marketplace.

- **Breaking:** `chassis-implement-design` writes markup for `@chassis-ui/css` 0.7: the short size names (`p-md`), the `sm:` to `2xl:` and `@sm:` to `@2xl:` prefixes, the CSS grid and the current component classes. A project on an earlier Chassis CSS gets classes it does not have
- The skill works in a native CSS project and in a Tailwind CSS v4 project that uses the Chassis Tailwind entry, and says how the two differ
- `references/css-classes.md` is generated from the compiled stylesheet of `@chassis-ui/css` 0.7.2: every class, its variant prefixes, the subparts and modifiers of each component, the `data-cx-*` attributes and the facts of the Tailwind entry
- `references/tokens.md`, `components.md`, `patterns.md` and `workflow.md` of the skill follow: the translation of the Figma token namespaces to classes, the current markup of each component family, theming with `data-cx-theme`
- Claude Code installs the plugin with `/plugin marketplace add chassis-ui/mcp` and `/plugin install chassis-ui@chassis-ui`
- The server runs on `@modelcontextprotocol/sdk` 1.32, and reports the version of the release, which it no longer holds as a string of its own
- The README covers the plugin, Cursor and other MCP clients, and names the Figma MCP server the skills need

No tool, prompt or resource changed its name or its input.
