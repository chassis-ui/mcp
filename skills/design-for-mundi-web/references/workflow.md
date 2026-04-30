# Mundi Workflow — Detailed Procedures

Phase-by-phase playbooks for the Mundi-specific modes. These overlay the canonical `chassis-create-design` workflow — do not skip Chassis steps, only apply the Mundi adjustments noted here.

---

## Mode: `new-flow` — Build a multi-step flow from scratch

### Phase 1: Prepare

1. **Confirm the source.** Code, screenshot, written description, or live URL on `app.getmundi.app/...`.
2. **Confirm the target file.** Mundi Figma file or any file with the Mundi library linked. Extract `fileKey` and optional `nodeId` from the URL.
3. **Load required skills in order:** `figma-use` → `figma-generate-design` → `chassis-create-design` → this skill.
4. **Confirm theme/mode targets.** Mundi ships Light + Dark — clarify whether both must be delivered for this flow.
5. **Confirm the locale.** Mundi runs in `tr-TR` (primary) and `en-US`. Section names use the primary-locale flow name (e.g. `Bankaya Aktar` for Outbound Transfer).

### Phase 2: Plan the flow

6. **List the steps.** A flow is a sequence of logical steps the user moves through (form → review → confirmation). Each step gets one **canonical** state and its own Page Template.
7. **List the variants per step.** For each step, enumerate the alternative states: validation error, suggested results shown, balance warning, loading, etc. All variants of a step share that step's Page Template.
8. **List orthogonal/overlay states.** Modals, alerts, confirmation dialogs, processing-delay screens. Each gets its own page frame using `Alert Screen` (or equivalent overlay-screen component) — not a toggle inside any Page Template.
9. **Decide Page Template per step.** Each step that is structurally different (e.g. form vs. review with conditional notification panels vs. receipt) needs its own Page Template. Steps that are structurally identical can share one, but in practice most multi-step flows have at least two distinct templates.
10. **Decide initial Page Template stage for each.** New step → start with a **local master frame**. Don't promote to a library component until the step's layout is stable.

### Phase 3: Build each step's source Page Template

11. **Create a working section** in the file for the step's master frame. Name it descriptively (e.g. `Outbound Transfer — Step 1: Form`, `Outbound Transfer — Step 2: Review`).
12. **Build the master state with all conditional layers for that step present.** Set visibility/variants to the default/most-common state. Every nested layer that any variant of this step needs must already exist in this master.
13. **Bind all colors, spacing, sizing, typography to Chassis tokens** — see `chassis-create-design/references/tokens.md`. Page Template has no fill — it inherits the page background.
14. **Use Mundi-preferred Chassis variants** — see [components.md](./components.md):
    - Primary form → `form-floating`
    - Filters → `form-regular`
    - Primary action → `button-solid` (`md`)
    - Secondary → `button-smooth`
    - Tertiary → `button-link`
    - Destructive → `button-outline` (Mundi convention)
15. **Page Title:** Asset-override `Title Text Asset`, optionally `Subtitle Asset`. Place primary domain action(s) in the `Actions` slot. Do not reveal hidden sub-layers (Back Button, Title Badge, Subtitle Action) unless required.
16. **Main:** auto-layout, hugs height. Use Chassis components per `chassis-create-design`.

### Phase 4: Build the page frames (variants)

17. **Create a Section** for the flow with a domain-language name (e.g. `Bankaya Aktar`). All flow page frames live inside it.
18. **Create the canonical Step-1 page frame** using `Application Template`:
    - Insert `Application Template` from the Mundi library.
    - Detach it immediately — the shell (Sidebar + default Page Template, pre-configured background + auto-layout) is now local.
    - Swap the default Page Template instance with the **Step-1 source Page Template** instance.
    - Name: `{Domain} / {Subdomain} - 1` (e.g. `Transfers / Outbound - 1`).
19. **Duplicate the canonical Step-1 frame for each variant of Step 1.** Lay out **vertically** below it (rows = variants). Name `1.1`, `1.2`, ... In each duplicate, only toggle / swap / override — never restructure.
20. **Repeat steps 18–19 for each subsequent step,** each time swapping in that step's own Page Template. Lay out **horizontally** to the right (columns = steps).
21. **In each duplicate, only override.** Toggle nested-layer visibility, swap nested variants, override Asset text, insert/remove items in slot containers. Never restructure.

### Phase 5: Build overlay states

22. **Each overlay = its own page frame.** Use `Alert Screen` / `Modal Screen` / `Dialog Screen` from the Mundi library at `1512 × 982`. Place it floating to the side of the main grid. Name it `{Domain} / {Subdomain} - {OverlayName}` (e.g. `Transfers / Outbound - Delay`).
23. **Configure overlay content via the overlay-screen component's own Asset/slot props.** Do not embed Sidebar + Page Template inside an overlay.

### Phase 6: Validate

24. **`get_screenshot` per page frame.** Catch placeholder text, clipped Asset layers, divergent structure.
25. **Theme sweep.** If both Light and Dark are in scope, screenshot both at the wrapper level. Bind theme overrides at the page-frame level, not section level.
26. **Step propagation check.** For each step, verify a structural change to that step's source Page Template lands in every variant frame of that step. If a variant diverges, restore by re-instancing the step's source and re-applying its overrides only.
27. **Naming + grid check.** All frames follow `{Domain} / {Subdomain} - {Step}[.{Variant}]` and sit on the columns-as-steps / rows-as-variants grid.

### Phase 7: Report

28. Report each frame in one of the buckets: **Built / Master created / Master updated / State synced / Promoted / Swapped / Blocked**.

---

## Mode: `extend-flow` — Add a new step or variant

1. **For a new step (column):**
   - Determine whether an existing Page Template fits the new step's structure. If it's structurally different, create a new local master frame for this step (Phase 3 above).
   - Create a new page frame via `Application Template` insert → detach → swap in the new step's Page Template.
   - Place it to the right of the rightmost step.
   - Name `{Domain} / {Subdomain} - {NextStep}`.
2. **For a new variant (row):**
   - Duplicate the canonical state of the relevant step to the row below the last variant.
   - Override only what differs from the canonical state.
   - Name `{Step}.{NextVariant}`.
3. **If the new variant needs a layer that does not exist on the step's source Page Template** — STOP. The layer belongs on the source. Edit the source first (mode `update-flow`), then continue.
4. Validate per Phase 6 above.

---

## Mode: `update-flow` — Propagate a change across all states

1. **Open the source Page Template** — local master frame OR the published library component. Never edit a state frame.
2. **Make the change once.**
3. **Verify state pickup.** Sample 2–3 state frames and screenshot. The change must be visible without further edits.
4. **For divergent states:** restore by re-instancing the source and re-applying that state's toggles only. Do not patch the divergence in place.
5. **For published-library Page Templates:** edit the source component file → republish → consuming file accepts library updates.
6. Report under **Master updated** (or **State synced** if you also realigned a divergent state).

---

## Mode: `update-screen` — Update a single Mundi screen

Use this when the screen is **standalone** (not part of a flow with shared Page Template) or the change is scoped to a single page frame.

1. Inventory the page frame's children: Sidebar instance / Page Template instance / detached layer / local wrapper.
2. **Sidebar update?** Swap the instance to the current Mundi library variant — don't edit children.
3. **Page Title update?** Override Asset layers and slot contents.
4. **Main update?** Apply Chassis component swaps, Asset overrides, Chassis token rebindings per `chassis-create-design`.
5. **Detached layers / local wrappers?** Re-instance from the Mundi or Chassis library. Preserve `x`, `y`, `width`, `height` if the parent isn't auto-layout.
6. Use `instance.swapComponent(newVariant)` so prop overrides survive.
7. Validate (screenshot) and report.

---

## Mode: `promote-template` — Promote local master to a library component

Run this when a flow has stabilized and the master Page Template should become a versioned library component.

1. **Confirm stability.** No structural changes pending. All state frames currently sync cleanly from the master.
2. **Convert the master frame to a component.** In the source file (the file that owns the Mundi library), select the master frame → **Create Component**.
3. **Name it `{Flow Name} Page Template`** (e.g. `Outbound Transfer Page Template`). Add a description matching the flow's purpose.
4. **Define component properties** for the most-frequently-overridden values: visible/hidden booleans for conditional layers, instance-swap props for variant-bearing children, text props on Asset layers.
5. **Publish to the library.** Bump the library version per the team's convention.
6. **In each consuming file, accept library updates** and **re-instance** the Page Template in every state frame:
   - Select the existing local Page Template instance in a state frame
   - Replace via instance-swap with the published component
   - Re-apply that state's overrides
7. **Delete the now-orphaned local master** from the consuming file (the published component replaces it).
8. Report under **Promoted**, listing the library version, the component key, and the count of re-instanced state frames.

---

## Failure Modes & Fallbacks

| Symptom                                                  | Likely cause                                                        | Fix                                                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| State frame doesn't pick up master change                | State has been detached from the source Page Template               | Re-instance the source; re-apply toggles                                           |
| State frame has structural differences                   | Someone edited the state directly instead of the source             | Move the change to the source; re-instance the state                               |
| Page Template won't fit in the page frame                | Page Template is set to fixed width or fixed height                 | Set width to FILL (1256), height to HUG                                            |
| Sidebar overlaps content                                 | Page frame is missing horizontal auto-layout                        | Wrap children in horizontal auto-layout, or set Page Template `x = 256` explicitly |
| Theme switch breaks colors                               | Raw colors used instead of `color/context/...` tokens               | Rebind every color via `setBoundVariableForPaint`                                  |
| Overlay state has no backdrop                            | Overlay-screen component used without its built-in backdrop variant | Use `Alert Screen` / `Modal Screen` directly — they include the backdrop           |
| Library component instance can't be edited structurally  | This is by design                                                   | Edit the source component file → republish → accept updates                        |
| `Application Template` detach produces a 1440-wide frame | Stale library version                                               | Update library; current Mundi shell is 1512 wide                                   |

---

## Quality Checklist (Mundi additions — run after the `chassis-create-design` checklist)

> The `chassis-create-design` checklist (Asset overrides, token bindings, text styles, boolean props, no deprecated components, etc.) always runs first. This checklist covers only items specific to the Mundi shell and flow pattern.

### Shell & structure

- [ ] Page frame started from `Application Template` (insert → detach → swap) — not assembled from primitives
- [ ] Sidebar is a single, undetached library instance; variant/props changed through its prop API
- [ ] Page Template instance is the correct one for this step (not reused from a structurally different step)
- [ ] Page frame width is `1512 px`; Page Template width is `1256 px`
- [ ] Page Template height hugs content — no forced fixed height

### Flow & naming

- [ ] Every step's content is inside a **Page Template** (local master or library component instance) — no step content built directly in a raw page frame
- [ ] Each structurally distinct step has its own Page Template (form / review / confirmation are not sharing one)
- [ ] Variants of a step share the **same** step Page Template — no per-variant structural edits on variant frames
- [ ] Canvas laid out as columns = steps, rows = variants
- [ ] Frames named `{Domain} / {Subdomain} - {Step}[.{Variant}]`; overlay states named `{Domain} / {Subdomain} - {OverlayName}`
- [ ] Overlay states (modals, alerts, dialogs) are separate page frames using `Alert Screen` / modal-screen components — not toggles inside a Page Template

### Page Title

- [ ] `Title Text Asset` overridden with the page heading
- [ ] `Subtitle Asset` visible only when context info (account name, period, status) is present
- [ ] `Actions` slot contains primary domain actions only (`New transfer`, `Deposit`, `Buy funds`, …) — no filters or view controls
- [ ] `Back Button` revealed only when the page has a clear navigation parent

### Content & conventions

- [ ] All copy uses Mundi domain vocabulary (`Yield`, `Position`, `Idle cash`, `Transfer`, etc.) — no invented synonyms
- [ ] Primary flow forms use `form-floating`; filters/settings forms use `form-regular` — not mixed
- [ ] `button-outline` used only for destructive actions; `button-smooth` for normal secondary
- [ ] No theme modes mixed within a single page frame (light and dark = two separate state frames)
- [ ] Deliverable summary uses Mundi buckets: Built / Master created / Master updated / State synced / Promoted / Swapped / Blocked
