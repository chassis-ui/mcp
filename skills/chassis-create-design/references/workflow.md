# Chassis Design Workflow — Detailed Procedures

Step-by-step playbooks for the two entry modes. Use the checklists; do not skip steps.

## Build Mode — New Screen from Scratch

### Phase 1: Prepare

1. **Confirm the source of truth.** Ask the user (or infer from context):
   - Source code in a repo? → read the relevant page/component files
   - Screenshot? → request via attachment or fetch
   - Written description? → ask clarifying questions about layout/sections

2. **Confirm the target file.**
   - User-provided Figma URL → extract `fileKey` and (optional) `nodeId`
   - If no node specified, plan to create a new top-level frame

3. **Load required tools.**
   - Verify Figma MCP is connected
   - If `use_figma` will be called, load the `figma-use` skill first

4. **Confirm theme/mode targets.**
   - Single theme (e.g., web/light only)? Note the active modes.
   - Multi-theme? List all brand × theme × app combinations to validate.

### Phase 2: Plan Sections

5. **Decompose the screen into sections.** Typical section types:
   - Header / navbar
   - Hero
   - Feature blocks / cards
   - Forms
   - Data tables / lists
   - Footer
   - Modals / drawers (treat as separate sub-deliverables)

6. **List sections in build order.** Top to bottom for pages; outer to inner for nested layouts.

7. **For each section, list candidate components.** Cross-reference [components.md](./components.md). Note any gaps where no library component fits — flag for user before building.

### Phase 3: Build Section-by-Section

For each section in order:

8. **Discover.** Run `search_design_system` with the component family name. Confirm `componentKey`.

9. **Verify variant coverage.** Read the component's variants table. Confirm the variants you need (`size`, `context`, `state`, `has-*`) exist.

10. **Verify token coverage.** Every color, font, spacing, sizing, radius, border, shadow, and opacity decision in the section must map to a Chassis variable or style. Cross-reference [tokens.md](./tokens.md). If anything doesn't fit, ask the user before hardcoding.

11. **Plan the section frame.**
    - Use auto-layout where appropriate for the section's flow
    - Set spacing using `space/context/*` tokens
    - Set padding using same scale

12. **Place component instances.** For each instance:
    - Import via `componentKey`
    - Set explicit position if parent is **not** auto-layout (preserve `x`, `y`, `width`, `height`)
    - Set variants
    - Inspect `componentProperties` for `has-*` / `is-*` / `show-*` keys — **all default to `true`**. Set the unwanted ones to `false` **before** Asset overrides, otherwise the instance arrives showing every decoration. See [Boolean Visibility Props](./patterns.md#boolean-visibility-props--default-true).
    - Set `*-instance` swap props (icons, etc.) for the boolean props you keep `true`

13. **Override Asset text.** For each text content:
    - Locate the nested `*Asset` layer ([Asset Override Pattern](./patterns.md#asset-override-pattern))
    - Set the TEXT property on the asset, not the parent
    - If no `*Asset` exists for a role you need → wrong component, reconsider

14. **Validate the section visually.** Compare against the source. Adjust before moving on.

15. **Move to next section.** Repeat 8–14.

### Phase 4: Multi-Theme Validation (if applicable)

16. **Switch the screen frame to each target mode** (Theme: Dark, Brand: B, etc.)

17. **Inspect each section** in the alternate mode. Watch for:
    - Hardcoded colors that don't invert
    - Insufficient contrast in dark mode
    - Layout breaks from text length differences across brand fonts

18. **Fix issues at the token level**, not by overriding instances.

### Phase 5: Report

19. **Produce the deliverable summary** using the format in [SKILL.md → Deliverable Format](../SKILL.md#deliverable-format):
    - **Built**: list each new section
    - **Blocked**: any sections / elements that couldn't be built — include exact failure mode

---

## Reconnect Mode — Existing Screen with Detached Layers

### Phase 1: Inventory

1. **Walk the existing frame.** For each visible top-level layer, classify:

| Tag                | Meaning                                                  |
| ------------------ | -------------------------------------------------------- |
| `library-instance` | Already a valid Chassis component instance — leave alone |
| `detached`         | Was a Chassis instance, since detached                   |
| `local-wrapper`    | Locally-defined component wrapping a Chassis primitive   |
| `raw-frame`        | Hand-built frame, not derived from any component         |

2. **For each non-library layer, hypothesize the matching Chassis component.** Match by visual + structural intent, not by exact appearance.

3. **List anything you cannot match.** These are blocked items — not your job to invent custom components.

### Phase 2: Plan Replacements

4. **Order replacements outer-to-inner.** Replacing an outer container before its children avoids re-doing inner work.

5. **For each replacement, decide the strategy.**

| Strategy    | When                                                              |
| ----------- | ----------------------------------------------------------------- |
| **Swap**    | A library component matches 1:1 → replace and re-apply props/text |
| **Compose** | No single component fits, but multiple primitives compose to it   |
| **Skip**    | Already a valid library instance                                  |
| **Block**   | No mapping possible → report                                      |

6. **For each Swap / Compose**, capture:
   - Original `x`, `y`, `width`, `height` (only matters in non-auto-layout parents)
   - Original text content (for re-application via Assets)
   - Original variant intent (size, context, state)

### Phase 3: Replace Section-by-Section

For each replacement (one at a time):

7. **Import the replacement component(s)** via `componentKey`.

8. **Place at original position.** If parent is not auto-layout, set `x`, `y`, `width`, `height` explicitly to match the original.

9. **Re-apply text** via the Asset Override Pattern.

10. **Re-apply variants and props.**

11. **Delete the original layer.** Verify the new instance occupies the visual space correctly.

12. **Validate visually.** Compare against the original (or the source-of-truth design if more recent).

13. **Move to next.** Never bulk-replace.

### Phase 4: Verify Integrity

14. **Walk the frame again** using the inventory taxonomy. Confirm everything is now `library-instance` or explicitly Blocked.

15. **Run multi-theme validation** if the screen targets multiple themes (see Build Phase 4).

### Phase 5: Report

16. **Produce the deliverable summary**:
    - **Swapped**: count + list
    - **Composed**: count + list
    - **Already connected**: count
    - **Blocked**: each item with exact failure mode (e.g., "No library component for radial slider control")

---

## Common Procedures

### Importing a Component

```
1. search_design_system({ query: "button-smooth" })
2. → returns componentKey "abcdef..."
3. use_figma to insert instance with that key into target frame
4. Set position (or rely on auto-layout)
5. Set variants
6. Set Asset text overrides
```

### Overriding Asset Text

```
1. Get instance node ID
2. Inspect children — find layer named "*Asset"
3. Get nested asset instance node ID
4. Set TEXT property on the asset instance (not parent)
```

### Section-Level Theme Switch

```
1. Select section frame
2. Open Appearance panel → Apply variable mode
3. Set Brand / Theme / App as needed
4. Validate visual integrity
```

### Session Context — Capture and Hand Off Discovered Keys

Component keys, text style keys, and variable IDs are resolved at runtime via `search_design_system` and `get_metadata`. These lookups take several tool calls. Once discovered, they should be captured and carried forward so they aren't re-discovered from scratch in the next session or context window.

**During a build session — after each component or style key is confirmed:**

Record it immediately in your working notes:

```
# Discovered keys (file: <fileKey>)
cx.comp.navbar       → c1e2dd8018e1440a72748d542c3adc2e1dfbc03d  (size=small)
cx.comp.tab          → a5a682e0178815555c38ba7ce3d8544b7d895ded  (variant=top)
font/display/small/mass → 472f0ee1366d54724816222ad36095dea2506f89
theme collection     → VariableCollectionId:f99b4c5f.../302:8
light mode ID        → 302:4
```

**At the end of each session (or when approaching context limit) — emit a session context block:**

```json
{
  "_chassisSessionContext": true,
  "fileKey": "<fileKey>",
  "pageId": "<pageNodeId>",
  "wrapperId": "<wrapperNodeId>",
  "builtSections": ["navbar"],
  "pendingSections": ["page-header", "tab-bar", "filter-row", "table"],
  "discoveredKeys": {
    "components": {
      "navbar":    { "key": "<key>", "variant": "size=small" },
      "tab":       { "key": "<key>", "variant": "variant=top" }
    },
    "textStyles": {
      "font/display/small/mass": "<key>",
      "font/text/medium/mass":   "<key>"
    },
    "colorVariables": {
      "fg-main": "<variableId>"
    },
    "themeCollection": "<collectionId>",
    "lightModeId": "<modeId>",
    "darkModeId":  "<modeId>"
  }
}
```

Paste this block at the top of your next session message. A new context window can use these keys directly without re-running `search_design_system` discovery calls.

**On session resume — if a session context block is present:**

1. Parse the `discoveredKeys` map
2. Verify the wrapper node still exists (`get_metadata` on `wrapperId`)
3. Skip discovery for any component/style already in the map — use the key directly
4. Proceed to the first item in `pendingSections`

> **Why this matters:** Context window limits are a build constraint, not an exception. Treating session continuity as a first-class concern prevents multi-session builds from re-discovering the same 15 keys every time.

### Recovering When Stuck

If you cannot complete an action after one attempt:

1. **Don't retry the same approach** — diagnose first
2. Check the component actually has the variant/prop you're trying to set
3. Check the parent frame is the right kind (auto-layout vs. absolute)
4. Check the Asset layer naming matches `*Asset` exactly
5. If still stuck after diagnosis, **stop and report** — don't bulk-edit through the failure

---

## Quality Checklist (run before declaring done)

- [ ] Every text is set via an Asset layer, not a parent prop
- [ ] Boolean visibility props (`has-*` / `is-*` / `show-*`) explicitly subtracted to match design intent (defaults are `true`)
- [ ] Every color is a `color/context/*` token (or explicitly user-approved literal)
- [ ] Every spacing is a `space/context/*` or `space/unit/*` token
- [ ] Every text node has a `font/*` **text style** applied (single chip in the Typography panel) — not raw values, not loose `typography/*` variable bindings
- [ ] Every shadow is a `shadow/context/*` **effect style** — not a raw `effects` object
- [ ] No deprecated `… @ x.x`-named components in use
- [ ] Button sizes are consistent within each action group
- [ ] One form style throughout each form
- [ ] Multi-theme combinations validated (if applicable)
- [ ] Original positions preserved in non-auto-layout parents
- [ ] Deliverable summary written using the Built/Swapped/Composed/Already connected/Blocked format
- [ ] Session context block emitted (if build is incomplete or context limit is near) — see [Session Context — Capture and Hand Off Discovered Keys](#session-context--capture-and-hand-off-discovered-keys)
