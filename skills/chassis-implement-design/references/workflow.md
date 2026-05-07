# Chassis Implement Workflow — Detailed Procedures

Step-by-step playbooks for translating Chassis Figma views into Chassis CSS code. Use the checklists; do not skip steps.

## Screen Mode — Full View from Figma

### Phase 1: Prepare

1. **Confirm the source.**
   - Figma URL → extract `fileKey` and `nodeId` (convert `-` to `:` in nodeId)
   - Or: active selection in Figma desktop MCP

2. **Confirm the target.**
   - Which file/route in the project?
   - Is there an existing Chassis layout to drop the view into, or is this a new page?
   - Single theme (web/light) or multi-theme (Brand × Theme × App)?

3. **Load required tools.**
   - Verify Figma MCP is connected
   - Load `figma-implement-design` skill before any code generation

4. **Decide reuse strategy.**
   - Search the project for existing Chassis snippets / partials covering similar sections — reuse over recreation
   - Check `chassis-website/_site/`, `chassis-css/site/`, project component libraries

### Phase 2: Discover

5. **Get high-level structure.**
   - `get_metadata(fileKey, nodeId)` — returns the node tree
   - Identify section nodes (header, hero, feature blocks, footer, sidebars, etc.)
   - Identify Chassis component instances vs. raw frames

6. **Pull the Code Connect map.**
   - `get_code_connect_map(fileKey, nodeId)` — returns mapped Chassis snippets if any
   - **If a mapping exists for a node, use it verbatim** — this overrides any generic translation

7. **Pull variables for the whole node.**
   - `get_variable_defs(fileKey, nodeId)` — returns the Chassis token names actually bound in the design
   - Build a lookup: Figma variable name → Chassis CSS class (use [tokens.md](./tokens.md))

8. **Pull design context per section.**
   - For each section identified in step 5, `get_design_context(fileKey, sectionNodeId)`
   - For very large sections, drill further into subsections

9. **Capture screenshots.**
   - `get_screenshot` for the full view (final validation reference)
   - `get_screenshot` per section (per-section validation)

### Phase 3: Translate

For each section, in order (top → bottom for pages, outer → inner for nested):

10. **Identify component instances.**
    - For each Figma instance, locate its Chassis family in [components.md](./components.md)
    - Note the variant set: `size`, `context`, `style`, `state`, `has-*` booleans
    - Translate variants to **space-separated modifiers** on the root class

11. **Extract Asset text.**
    - For each component, walk children for `*Asset` layers
    - Read each Asset's TEXT property — that's the visible text
    - Map Asset role → semantic HTML element:
      - `Title Text Asset` → `<h{n}>` or `card-title`
      - `Subtitle Asset` → `font-lead` paragraph or `card-subtitle`
      - `Label Asset` → `<label>` or inline `<span>`
      - `Description Asset` / `Body Asset` → `<p class="card-body">` or `<p>`
      - `Action Asset` → text content of the button
      - `Helper Asset` → `<small class="form-text">`
    - **Discard** the `Asset` wrapper — it does not become a DOM node

12. **Resolve token-bound styles.**
    - For every styled property in the section's design context, look up the bound Figma variable
    - Convert via [tokens.md](./tokens.md) to a Chassis CSS class
    - Apply on the appropriate element

13. **Emit semantic HTML.**
    - Pick the correct semantic element for the role (see [patterns.md → Semantic HTML](./patterns.md#semantic-html))
    - Stack utilities and component class on the same element where possible
    - Honor accessibility: `aria-*`, `role`, `for`, `scope`, focus order

14. **Wire behaviors.**
    - Add `data-cx-toggle` / `data-cx-target` / `data-cx-dismiss` / `data-cx-spy` / `data-cx-ride` for interactive components
    - Confirm corresponding JS is loaded (`@chassis-ui/css/dist/js/chassis.js` or partial bundles)

15. **Validate the section.**
    - Render in browser, compare to per-section screenshot from step 9
    - Fix discrepancies via tokens, not raw CSS

### Phase 4: Multi-Theme Validation (if applicable)

16. **Render under each target Brand × Theme × App combination.**
    - Toggle `data-cx-theme` (or equivalent project mechanism) on the document/wrapper
    - Confirm the section adapts correctly

17. **Watch for:**
    - Hardcoded colors that don't invert
    - Insufficient contrast in dark mode
    - Layout breaks from text-length differences across brand fonts
    - Logos / illustrations that need theme-conditional rendering ([patterns.md → Theme-Conditional Assets](./patterns.md#theme-conditional-assets))

18. **Fix at the token / class level**, not by overriding inline styles.

### Phase 5: Final Sweep

19. **Run the Chassis lint checklist:**
    - [ ] No Tailwind class names — no `className`, `text-{color}-{n}`, `bg-{color}-{n}`, `p-{n}`, `gap-{n}`, `font-bold`, `rounded-lg`
    - [ ] No arbitrary Tailwind values — no `p-[14px]`, `bg-[#hex]`, `text-[1.25rem]`
    - [ ] No abbreviated breakpoints — `medium:`, `large:`, never `md:`, `lg:`, `col-md-`
    - [ ] No `data-bs-*` — all `data-cx-*`
    - [ ] No hyphenated multi-word modifiers — `button primary outline`, not `button-primary-outline`
    - [ ] No leftover `Asset` wrapper divs
    - [ ] All localhost icon SVGs evaluated for `@chassis-ui/icons` replacement
    - [ ] All accessibility roles / labels present

20. **Compare the full render** with the full-view screenshot from step 9.

### Phase 6: Report

21. **Produce the deliverable summary** using the format in [SKILL.md → Deliverable Format](../SKILL.md#deliverable-format):
    - **Implemented**: list each section
    - **Reused**: any project snippets reused
    - **Composed**: anything built from primitives
    - **Iconified**: localhost SVGs replaced with `@chassis-ui/icons`
    - **Flagged**: any inline raw CSS used, with reason
    - **Blocked**: any sections that couldn't be implemented — include exact failure mode

---

## Component Mode — Single Instance to Snippet

Compressed playbook when the deliverable is a single component:

1. `get_design_context` for the instance node
2. `get_code_connect_map` — if a mapping exists, return it verbatim
3. `get_variable_defs` for the node
4. Identify Chassis family → look up canonical snippet in [components.md](./components.md)
5. Resolve variants → space-separated modifiers
6. Extract Asset text → inline as element content
7. Resolve token-bound styles → Chassis classes
8. Emit semantic HTML with classes, `data-cx-*` if interactive
9. Validate against screenshot

---

## Section Mode — Subsection of Existing Page

Same as Screen Mode Phase 2 → Phase 5, scoped to the single section node. Skip the multi-section orchestration in Phase 3 step ordering.

---

## Failure Modes & Fallbacks

| Symptom                                     | Likely cause                                        | Fix                                                                                              |
| ------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Empty text in output                        | Looked at top-level instance, missed `*Asset` child | Re-walk node tree for `*Asset` layers; lift their TEXT property                                  |
| Tailwind classes leaked into output         | Used MCP output verbatim                            | Discard MCP output's class layer; rewrite from scratch using Chassis classes                     |
| Hyphenated modifier (e.g. `button-primary`) | Copied MCP output class names or Bootstrap habit                      | Use space-separated modifiers: `button primary`                                                  |
| Card content displays wrong                 | Used `card-body` as the content wrapper instead of `card-content`               | Chassis: `card-content` is the wrapper; `card-body` is the text paragraph                     |
| Theme switch breaks colors                  | Used raw hex or unit color tokens                   | Replace with `fg-*` / `bg-*` / context-prefix variants                                           |
| `get_design_context` truncated              | Section too large                                   | Use `get_metadata` first, then per-subsection `get_design_context`                               |
| No variables returned                       | Used `getLocalVariableCollectionsAsync` only        | Use `get_variable_defs` — that's the source of truth for library variables                       |
| Icon renders blank                          | Icon SVG fetch failed                               | Resolve via `@chassis-ui/icons` slug instead; see [components.md → Icons](./components.md#icons) |
