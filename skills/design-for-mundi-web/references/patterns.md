# Mundi Patterns

Mundi-specific patterns layered on top of `chassis-create-design/references/patterns.md`. Read the Chassis patterns file first — Asset Override Pattern, button composition, form composition, table composition all carry over unchanged.

This file documents:

1. The Application Template / Page Template / Sidebar shell pattern
2. The flow grid layout and naming
3. Master-and-state propagation
4. Overlay-screen composition
5. Mundi theme switching
6. Mundi-specific anti-patterns

---

## Application Template — Standard Page Frame Scaffold

`Application Template` is the **standard way to create any new Mundi page frame**. It is a convenience component that ships with:

- A `Sidebar` instance (with fixed position settings pre-configured)
- A default `Page Template` instance (placeholder to swap with the step's actual Page Template)
- Pre-defined `color/page/bg-body` background fill
- Horizontal auto-layout with correct sizing

**Workflow: Insert → Detach → Swap → Configure**

1. Insert `Application Template` from the Mundi library.
2. Detach immediately — the frame is now fully local with all correct shell settings.
3. Swap the default Page Template instance with the step's actual Page Template (local master or published library component).
4. Override Page Title and populate Main.

This is the standard workflow for **every** new Mundi page frame — new flow, existing flow, first screen or tenth variant.

Resulting structure:

```
Page Frame (1512 × auto, typically 982)
├── Sidebar          x=0,    256 × 982    [library instance, fixed position settings]
└── Page Template    x=256,  1256 × auto  [step's library component or local master]
    ├── Page Title       [Asset-override]
    └── Page Content
        └── Main         [auto-layout, hugs height]
```

---

## Flow Grid Layout

Lay out flows on a 2D grid:

```
                Step 1 (col)     Step 2 (col)     Step 3 (col)
canonical row   - 1              - 2              - 3
variant row 1   - 1.1            - 2.1            - 3.1
variant row 2   - 1.2
variant row 3   - 1.3
variant row 4   - 1.4

orthogonal/overlay states float to the side:
                - Delay
```

**Spacing on the canvas:** keep a consistent gap between page frames so the grid is legible at zoomed-out view. Mundi's existing flows use ~`128 px` horizontal gap and ~`128 px` vertical gap.

### Naming convention

| Frame role                | Pattern                                              | Example                        |
| ------------------------- | ---------------------------------------------------- | ------------------------------ |
| Canonical state of a step | `{Domain} / {Subdomain} - {Step}`                    | `Transfers / Outbound - 1`     |
| Variant of a step         | `{Domain} / {Subdomain} - {Step}.{Variant}`          | `Transfers / Outbound - 1.2`   |
| Overlay state             | `{Domain} / {Subdomain} - {OverlayName}`             | `Transfers / Outbound - Delay` |
| Section wrapping the flow | Domain-language flow name (`tr-TR` if Turkish-first) | `Bankaya Aktar`                |

---

## Step-and-Variant Propagation Pattern

Each flow step has its own source Page Template. All variants of a step are page frames containing an instance of **that step's** Page Template. Variant differences are produced by:

| Override mechanism                 | Use for                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| Nested-layer **visibility toggle** | Show/hide error banner, empty state, suggested results, balance warning               |
| Nested-instance **variant swap**   | Button `default → loading`, form field `default → error`, badge `pending → completed` |
| **Asset-layer text override**      | Recipient name, amount, account, status text                                          |
| **Slot-container item add/remove** | Recipient list rows, position list rows, activity feed rows                           |

**Forbidden in a variant frame:**

- Adding a layer that doesn't exist on that step's source Page Template
- Removing a layer (only hide it via visibility toggle)
- Resizing or repositioning structural children
- Detaching the Page Template instance

If a variant needs something the step's source doesn't have → add it to that step's source first (`update-flow` mode), let it propagate, then hide it where unneeded.

### Visualizing the propagation

```
Step-1 source Page Template (form layout)
      │
      ▼  instance ──→  Step-1 page frame         (default: empty form)
      ▼  instance ──→  Step-1.1 page frame       (validation errors shown)
      ▼  instance ──→  Step-1.2 page frame       (suggested recipients shown)
      ▼  instance ──→  Step-1.3 page frame       (balance warning shown)

Step-2 source Page Template (review layout — structurally different)
      │
      ▼  instance ──→  Step-2 page frame         (default: review state)
      ▼  instance ──→  Step-2.1 page frame       (conditional notification shown)

Step-3 source Page Template (confirmation/receipt layout)
      │
      ▼  instance ──→  Step-3 page frame         (success receipt)
      ▼  instance ──→  Step-3.1 page frame       (with follow-up action)
```

Editing Step-1's source updates all Step-1 variants. It does not affect Step-2 or Step-3.

---

## Overlay-Screen Composition

Overlays in Mundi are **whole page frames**, not toggles inside the Page Template.

```
Overlay page frame (1512 × 982)
└── Alert Screen instance (1512 × 982)   [single library instance, full-frame]
    ├── Backdrop layer    [built-in, dimmed bg-main]
    └── Alert content
        ├── Icon / illustration
        ├── Title Asset
        ├── Body Asset
        └── Actions slot
```

Mundi-owned overlay-screen components: `Alert Screen`, `Modal Screen`, `Dialog Screen`. Each includes its own backdrop. **Do not** add a backdrop layer manually, do not place these inside another page frame, do not reveal sidebar/Page Title under an overlay.

### Triggers and return paths

When an overlay is part of a flow (e.g. `Outbound Transfer - Delay` triggered when processing exceeds 2s):

- Place the overlay page frame **next to** the flow grid, not inside it.
- Name it after the trigger: `{Flow} - {TriggerName}`.
- Document the entry/exit transitions in the frame description if helpful — Figma does not enforce them.

---

## Mundi Theme Switching

Inherits Chassis's Brand × Theme × App collection model. Mundi-specific defaults:

- **Brand:** `Mundi`
- **Theme:** `Light` (default), `Dark`
- **App:** `Mundi Web`

### Where to set the override

Set theme overrides at the **page frame** (the `1512 × 982` wrapper), not at section level:

```js
pageFrame.setExplicitVariableModeForCollection(themeCollection, darkModeId);
```

This switches the entire screen — Sidebar, Page Title, Main, all state-controlled colors — atomically.

### Rules

1. **Never bind raw colors.** Every fill, stroke, and text color must come from a `color/context/...` token.
2. **One theme per page frame.** If both light and dark variants of a state are needed, duplicate the state page frame and set the override on the duplicate.
3. **Apply theme overrides only at the wrapper.** Don't set per-section overrides — they break atomic switching and are hard to maintain.
4. **Logos and theme-conditional illustrations** use Chassis's `figma/switch/theme/mode-1` switch variables to toggle visibility. See `chassis-create-design/references/patterns.md` → "Themes & Modes".

---

## Domain-First Content Pattern

Mundi UIs always lead with the **domain noun** the user is operating on:

| Wrong      | Right                              |
| ---------- | ---------------------------------- |
| `Submit`   | `Transfer`                         |
| `Confirm`  | `Confirm transfer`                 |
| `Save`     | `Save recipient`                   |
| `Continue` | `Review transfer`                  |
| `OK`       | `Got it` (rare) or domain-specific |
| `Add`      | `Add recipient` / `Add position`   |

Page Titles use the **flow's user-facing name**, not a generic action verb:

| Wrong        | Right                                           |
| ------------ | ----------------------------------------------- |
| `Send Money` | `Outbound Transfer` (en) / `Bankaya Aktar` (tr) |
| `Investment` | `My Positions` (en) / `Pozisyonlarım` (tr)      |

See [content.md](./content.md) for the full vocabulary.

---

## Mundi Anti-Patterns Gallery

| Anti-pattern                                  | Symptom                                                                         | Fix                                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Raw frame instead of Page Template**        | Step content built directly in a page frame — no Page Template instance present | Create a local-master Page Template frame for the step; re-build content inside it; insert an instance into each state page frame |
| **Toggling a modal inside a Page Template**   | Page Template has a hidden `Modal` layer that gets shown for the modal state    | Move modal to a separate page frame with `Modal Screen`                                                                           |
| **Editing a variant's structure**             | A variant frame has a layer its step's canonical frame doesn't have             | Add the layer to the step's source Page Template; hide it where unneeded                                                          |
| **Detached Page Template**                    | A variant frame's Page Template is no longer linked to the step's source        | Re-instance from the step's source; re-apply variant's overrides                                                                  |
| **1440-wide page frame**                      | Sidebar overlaps content or there's empty space on the right                    | Resize page frame to `1512 × 982`                                                                                                 |
| **Sidebar with edited children**              | Sidebar item label was directly text-edited                                     | Revert; configure via Sidebar's component props/variants                                                                          |
| **Two solid buttons in Page Title actions**   | Two visual primaries fighting for attention                                     | One `button-solid` + one `button-smooth` (or `link`)                                                                              |
| **`form-regular` for a transfer flow**        | Labels above fields, dense layout in a primary flow                             | Use `form-floating` for primary flows                                                                                             |
| **Generic copy** (`Submit`, `Continue`, `OK`) | Loss of domain context                                                          | Use domain verbs: `Transfer`, `Confirm transfer`, `Got it`                                                                        |
| **Theme override at section level**           | Some sections of a page switch theme but others don't                           | Move the override up to the page frame                                                                                            |
| **Application Template detached every time**  | Sidebar duplicated, Page Templates not shared                                   | Use direct placement (Sidebar instance + Page Template instance)                                                                  |
| **Page Template fixed height**                | All states are the same height even when content differs                        | Set height to HUG                                                                                                                 |
| **Overlapping flow grid**                     | Variants laid out horizontally instead of vertically                            | Columns = steps, rows = variants                                                                                                  |
