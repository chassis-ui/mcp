---
name: design-for-mundi
description: Use this skill alongside chassis-create-design when the task involves designing an application page, view, or multi-section layout in Figma for Mundi.
disable-model-invocation: false
---

# Build / Update Screens and Views using Chassis UI Figma Library

Use this skill when building a new Figma screen or reconnecting an existing one to the Chassis UI library stack.

This skill supports two entry modes:

- `build`: creating a new screen from scratch using Chassis system components
- `reconnect`: replacing detached layers or local wrappers in an existing screen with proper library instances

Load these capabilities before starting:

- Figma MCP read access (`get_metadata`, `get_screenshot`, `search_design_system`)
- `figma-use` skill before any `use_figma` call, when your environment requires it

Do not use this skill for a single targeted component fix. For one narrow issue, keep the scope to only that component.

## Skill Boundaries

- Use this skill when the deliverable is a **composed Figma view** (new or updated) — full-page screens, modals, dialogs, drawers, sidebars, panels, or any multi-section container — built from design system component instances.
- If the user wants to generate **code from a Figma design**, switch to [chassis-implement-design](../chassis-implement-design/SKILL.md).

## Prerequisites

- Figma MCP server must be connected
- The target Figma file must have a published design system with components (or access to a team library)
- User should provide either:
  - A Figma file URL / file key to work in
  - Or context about which file to target (the agent can discover pages)
- Source code or description of the screen/view to build/update

## Core Rule

The Chassis UI Figma library uses an **"Asset layer override" pattern** for text and content. Many components — expose **no top-level text property**. Text content must be set by selecting nested instances whose name ends in `Asset` (e.g., `Text Asset`, `Label Asset`, `Title Text Asset`, `Subtitle Asset`) that expose their own TEXT properties.

Never assume a Chassis component has a `label`, `text`, or `title` property until you have verified it. If the property is absent, look for a child `*Asset` instance.

## Required Workflow

### 1. Identify the Scope

Decide which mode applies:

- **build**: the user wants a new screen. Identify which page template variant is needed from the context.
- **reconnect**: the user has an existing frame. Run `get_metadata` on the frame first and inventory existing instances before touching anything.

If reconnecting, classify each section before writing:

| Classification | Meaning |
|---|---|
| `already-connected` | Already a valid library instance |
| `exact-swap` | A library component can replace it directly |
| `compose-from-primitives` | Must be built from multiple library components |
| `blocked` | Library does not expose what is needed, or import fails |

### 2. Capture Current State

Before any writes:

1. `get_metadata` on the target frame or page node.
2. `get_screenshot` for visual reference.
3. Back up the target frame by duplicating it and naming the copy `Backup - <description>`. Do this in a separate `use_figma` call and return the backup node ID.

### 3. Build or Identify the Page Shell

All Chassis screens share this outer structure:

```
Root frame (1512 × variable height)
├── Sidebar                    [256 px wide]   import from cx.comp.* or reuse existing
└── Page Template              [fills rest]
    ├── Page Title             [60 px tall]
    └── Page Content
        └── Main
```

When building from scratch, assemble the shell before placing content components.

### 4. Populate Page Title

The `Page Title` component follows the Asset override pattern:

| Sub-layer | What to set |
|---|---|
| `Title Text Asset` | Override this child to set the page heading |
| `Subtitle Asset` | Override for the subtitle / description |
| `Actions` slot | Inject one or more `Solid Button` instances here |
| `Back Button` | Hidden by default — reveal when the page has a parent |
| `Title Badge` | Hidden by default — reveal for status badges |
| `Subtitle Action` | Hidden by default — reveal for interactive subtitle |

### 5. Choose and Import the Correct Components

Use the component map below. Always import by `componentKey` rather than by name.

#### Buttons

| Situation | Component | componentKey |
|---|---|---|
| Primary page action (default) | **Solid Button** | `fb59f05dc563e3c3b5a1dd281fe21041a91c2121` |
| Icon-only action | **Solid Icon-Button** | `c870dae5d758e9691fa59f6728264d0ec01f6734` |
| Secondary / softer action | **Smooth Button** | `62e22ef7c7bb5ceb8c42d89e7b6cd2c15086be0b` |
| Inline or nav link | **Link Button** | `52a5a7856dc8b559547934f79279a59dcc85bf17` |
| Action that opens a menu | **Dropdown Button** | `b5c9294f0d6576fd0dbc60c4bcb3feae193f3b18` |

**All button label overrides use the Asset pattern.** After importing a `Solid Button`, select the `Label Asset` child and override its content. There is no `label` property at the component level.

#### Form Inputs

| Situation | Component | componentKey |
|---|---|---|
| Standard input (default) | **Regular Form Input** | `22e8c038e7254e49e9be3b1fd9907c98f24dae9c` |
| Floating label style | **Floating Form Input** | `d3c4758ef79de7d5f9f3acee061cc5ccb71aa3da` |
| Border-only / low-emphasis | **Outline Form Input** | `07a5aa5a0d5351db1d74d0d2c41e8dc828981006` |
| Full field wrapper (outline) | **Outline Form Field** | `c969d1b99f71c1c88ce2a40b0cfc2453b399b579` |
| One-time password | **OTP Form Input** | `dc1aacaaef22c0a259f48ee339fa529c569d6bfc` |
| Checkbox or radio | **Form Check** | `2cb023fc5104e0b27494abf2259d5f05a1e0bb6f` |

#### Other Core Components

| Component | componentKey |
|---|---|
| **Modal Window** | `915394273730cf892b2c474a94098ac51c3037e6` |
| **Small Segment Item** | `164d6f0c86730811c7cef8d62bc3249cf8bf2286` |
| **Common Avatar** | `c55594e1786437d4115135c1f72d2a46f06a8c2d` |
| **Tooltip** | `913960095d085d83d22e41c7efea042775459782` |

### 6. Populate Slots and Reveal Hidden Layers

After placing components, handle slots and optional layers:

**Slots** (inject content into these frames):
- `Actions` in Page Title → inject `Solid Button` instances
- `Table Body` in table components → inject the appropriate table row instances

**Hidden by default — reveal only when needed:**
- `Back Button` — page has a parent page
- `Title Badge` — a status label is required
- `Subtitle Action` — subtitle has an interactive element
- `Filters` row — table filtering is active
- `Aside` panel — split-layout content
- `Advanced Paginator` — dataset has more than one page (preferred)
- `Simple Paginator` — minimal prev/next only
- `Table Empty` — dataset is empty, no rows to show
- `Notification` — a page-level alert is needed

### 7. Apply Tokens

Use the following token names when setting fills, corner radii, and typography. Do not use raw values if the equivalent token is available.

**Colors (semantic, from `Design System / Themes`):**
```
colors/background/bg-primary
colors/background/bg-primary-soft
colors/background/bg-primary-medium
colors/background/bg-primary-strong
```

**Colors (palette scale, from `cx.tokens.MAIN / theme`):**
```
color/palette/primary/20  /40  /50  /70  /80  /90
color/shadow/primary
```

**Border radius (from `Design System`):**
```
border/border-radius/rounded-0   border/border-radius/rounded-xxs
border/border-radius/rounded-md  border/border-radius/rounded-lg
border/border-radius/rounded-xl  border/border-radius/rounded-2xl
border/border-radius/rounded-3xl border/border-radius/rounded-full
```

**Component-specific (from `cx.tokens.MAIN / app`):**
```
borderRadius/card    borderRadius/modal    borderWidth/button
opacity/base/solid   opacity/level/solid
```

### 8. Validate Each Section

After placing or swapping each section:

1. Screenshot the changed section (`get_screenshot` scoped to that node).
2. Confirm no placeholder text remains.
3. Confirm the instance is library-backed (not a detached copy).
4. Confirm the Asset overrides are applied and correct.
5. After all sections, screenshot the full frame.

### 9. Handle Import Failures

If `importComponentSetByKeyAsync()` or `importComponentByKeyAsync()` fails:

1. Stop — do not continue other edits.
2. Check whether the key exists elsewhere in the target file already.
3. Try importing the individual component key instead of the set key.
4. If still failing, classify the section as `blocked` and report the exact failure.

Do not silently skip blocked sections.

---

## Writing Rules

- Use the **Asset layer override pattern** for all text content — never assume a top-level text property exists.
- Prefer `componentKey` over component name when importing.
- Do not reveal hidden sub-layers unless the use case explicitly requires them.
- Preserve `x`, `y`, width, and height explicitly when replacing inside non-auto-layout parents.
- Do not convert frames to auto-layout unless the user requests structural cleanup.
- Do not use the deprecated `Dropdown Button @ 0.2` — use `Dropdown Button` (`b5c9294f0d6576fd0dbc60c4bcb3feae193f3b18`) instead.
- Work one section at a time. Never rewrite an entire screen in a single script.

---

## Deliverable Format

When closing the task, report:

- **Built**: new sections or screens created using library components
- **Swapped**: sections replaced directly with library instances
- **Composed**: sections rebuilt from library primitives
- **Already connected**: sections that were already valid library instances
- **Blocked**: sections that could not be connected — include the exact failure mode

If everything is blocked, state that plainly with the specific failure reason.
