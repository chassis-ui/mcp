# Mundi Design System — AI Agent Skill

> **Purpose:** Guidance for AI agents building or modifying Figma designs that use the Mundi design system.  
> **Source file:** [mnd.web.tmpl.settings](https://www.figma.com/design/xo6Y4ZIcQEmiAHf8PtZkON/mnd.web.tmpl.settings)  
> **Last analysed:** 2026-04-21

---

## 1. Core Principles

### 1.1 "Asset" Layer Override Pattern (CRITICAL)
Many components expose editable content through **child layers named `*Asset`** (e.g., `Label Asset`, `Title Text Asset`, `Subtitle Asset`). These are **not** component properties — they must be overridden by selecting the child instance inside the component and editing it directly.

**Examples:**
- `Solid Button` → no `label` property. Override the `Label Asset` child to set button text.
- `Page Title` → override `Title Text Asset` and `Subtitle Asset` children.
- `Title Badge` → override the badge child layer.

**Rule:** If a component appears to lack a text property, look for a child layer whose name ends in `Asset`. Override that child instead.

### 1.2 Slot Pattern
Some components contain `slot` layers (e.g., `Actions`, `Table Body`) that are placeholders for injecting other components. Populate slots by placing the correct component inside the slot frame.

### 1.3 Hidden-by-default Layers
Many sub-elements within components are hidden by default. Reveal them only when needed:
- `Back Button` in Page Title — show when the page has a parent
- `Title Badge` — show when a status badge is required
- `Subtitle Action` — show when the subtitle has an interactive action
- `Filters` row — show when table filtering is active
- `Aside` panel — show for split-layout pages
- `Simple Paginator` / `Advanced Paginator` — show when content paginates
- `Table Empty` — show when a table has no data
- `Notification` — show when a page-level alert is needed

---

## 2. Token Libraries

### 2.1 Primary Token Library — `cx.tokens.MAIN`
The canonical token source. Applied via two variable collections:

| Collection | Purpose |
|------------|---------|
| `app` | Component-level spacing, sizing, opacity, border-radius |
| `brand` | Typography spacing/tracking tuned per content type |
| `theme` | Semantic colour palette |

**Color tokens** (collection: `theme`)
```
color/palette/primary/20  … /40 /50 /70 /80 /90
color/shadow/primary
```

**Opacity tokens** (collection: `app`)
```
opacity/base/solid
opacity/level/solid
```

**Border/radius tokens** (collection: `app`)
```
borderRadius/card
borderRadius/modal
borderWidth/button
```

**Typography tokens** (collection: `brand`)
```
typography/letterSpacing/base/zero
typography/letterSpacing/text/base
typography/letterSpacing/html/base
typography/letterSpacing/code/base
typography/paragraphSpacing/base/zero
typography/paragraphSpacing/base/small
typography/paragraphSpacing/text/base
typography/paragraphSpacing/text/paragraph
typography/paragraphSpacing/html/base
typography/paragraphSpacing/html/paragraph
typography/paragraphSpacing/code/base
typography/paragraphSpacing/code/paragraph
typography/paragraphSpacing/display/paragraph
```

### 2.2 Design System Library
Contains semantic aliases that the themed components consume.

**Background colors** (collection: `Themes`)
```
colors/background/bg-primary
colors/background/bg-primary-soft
colors/background/bg-primary-medium
colors/background/bg-primary-strong
```

**Border radius** (collections: `Primitives` + `Themes`)
```
border/border-radius/rounded-0
border/border-radius/rounded-xxs
border/border-radius/rounded-md
border/border-radius/rounded-lg
border/border-radius/rounded-xl
border/border-radius/rounded-2xl
border/border-radius/rounded-3xl
border/border-radius/rounded-full
```

---

## 3. Component Library Index

Components are split across dedicated `cx.comp.*` libraries. Always import from the correct library.

### 3.1 Buttons

| Component | Library | Notes |
|-----------|---------|-------|
| **Solid Button** ⭐ DEFAULT | `cx.comp.button.solid` | No `label` prop — override `Label Asset` child. Use for all primary CTAs. |
| **Solid Icon-Button** | `cx.comp.button.solid` | Icon-only variant of Solid Button. |
| **Smooth Button** | `cx.comp.button.smooth` | Softer visual style for secondary actions. |
| **Link Button** | `cx.comp.button-link` | Inline text-link style. Two versions exist; prefer the most recently updated one. |
| **Dropdown Button** | `cx.comp.dropdown` | Opens a dropdown panel. Replaces the deprecated `Dropdown Button @ 0.2`. |

**When to use which button:**
- Primary action on a page → `Solid Button`
- Secondary / less prominent action → `Smooth Button`
- Inline or navigational link → `Link Button`
- Action that reveals a menu → `Dropdown Button`
- Icon-only action → `Solid Icon-Button`

### 3.2 Form Inputs

| Component | Library | Notes |
|-----------|---------|-------|
| **Regular Form Input** ⭐ DEFAULT | `cx.comp.form.regular` | Standard input. Use unless a specific style is required. |
| **Floating Form Input** | `cx.comp.form.floating` | Label floats above the value on focus/fill. |
| **Outline Form Input** | `cx.comp.form.outline` | Border-only style for lower-emphasis contexts. |
| **Outline Form Field** | `cx.comp.form.outline` | Full field wrapper (label + input + helper) in outline style. |
| **OTP Form Input** | `mnd.web.tmpl.otp` | One-time-password digit boxes. |
| **Form Check** | `cx.comp.form-check` | Checkboxes and radio buttons. |

### 3.3 Navigation & Overlays

| Component | Library | Notes |
|-----------|---------|-------|
| **Modal Window** | `cx.comp.modal` | Standard modal/dialog. |
| **Small Segment Item** | `cx.comp.segment` | Used inside segmented controls / tab bars. |
| **Dropdown Button** | `cx.comp.dropdown` | See Buttons section. |

### 3.4 Data Display

| Component | Source | Notes |
|-----------|--------|-------|
| **Common Avatar** | `cx.asset.avatar` | User/entity avatar. |
| **Tooltip** | `Design System` library | Hover tooltip. |

---

## 4. Page Layout Pattern

The standard page structure observed in `mnd.web.tmpl.settings`:

```
Root frame (1512 × variable)
├── Sidebar                          ← 256 px wide
└── Page Template                    ← fills remaining width
    ├── Page Title                   ← 60 px tall
    │   ├── Back Button              (hidden by default)
    │   ├── Content Frame
    │   │   ├── Title Frame
    │   │   │   ├── Title Text Asset ← OVERRIDE this for page title text
    │   │   │   └── Title Badge      (hidden by default)
    │   │   └── Subtitle Frame
    │   │       ├── Subtitle Asset   ← OVERRIDE for subtitle text
    │   │       └── Subtitle Action  (hidden by default)
    │   └── Actions (slot)           ← inject Solid Button(s) here
    └── Page Content
        ├── Main
        │   ├── Notification         (hidden by default)
        │   ├── Filters              (hidden by default)
        │   ├── Table Container(s)
        │   │   ├── Section Header
        │   │   ├── Regular Form Input  (hidden — search bar)
        │   │   └── Table Frame
        │   │       ├── [Specific Table] (e.g., Users Table, Audit Table)
        │   │       │   ├── Table Head → Table Row
        │   │       │   └── Table Body (slot) → Table Rows
        │   │       └── Advanced/Simple Paginator (hidden by default)
        │   └── Table Empty          (hidden by default)
        └── Aside                    (hidden by default, 320 px wide)
```

### Section Header
Each `Table Container` begins with a `Section Header` instance that labels the section. Override its text child directly.

### Paginators
- Use **Advanced Paginator** when showing page navigation with item counts.
- Use **Simple Paginator** for minimal prev/next navigation.
- Both are hidden by default — show only when the dataset exceeds one page.

---

## 5. Common Patterns & Usage Rules

### Adding a page-level action button
1. Locate the `Actions` slot in `Page Title`.
2. Inject a `Solid Button` instance inside it.
3. Override the `Label Asset` child of that Solid Button to set the label text.

### Building a data table section
1. Place a `Table Container` instance.
2. Inside `Section Header`, override the heading text child.
3. Inside `Table Frame`, place the appropriate table component (e.g., `Users Table`).
4. Populate the `Table Body` slot with the correct table row components.
5. Show `Advanced Paginator` below the table when pagination is needed.
6. Show `Table Empty` (swap it in) when there are no rows.

### Using form inputs in a table header (search)
The `Regular Form Input` hidden inside `Table Container` is used as a search/filter bar above the table. Show it when search functionality is required.

### Using Form Check (checkbox / radio)
Import from `cx.comp.form-check`. This handles both checkbox and radio button variants via its properties.

---

## 6. Library Reference — Component Keys

Use these keys to import components via `importComponentByKeyAsync` / `importComponentSetByKeyAsync`:

| Component | componentKey | libraryKey prefix |
|-----------|-------------|-------------------|
| Solid Button | `fb59f05dc563e3c3b5a1dd281fe21041a91c2121` | `lk-6ad3d300…` |
| Solid Icon-Button | `c870dae5d758e9691fa59f6728264d0ec01f6734` | `lk-6ad3d300…` |
| Smooth Button | `62e22ef7c7bb5ceb8c42d89e7b6cd2c15086be0b` | `lk-bb3853a1…` |
| Link Button | `52a5a7856dc8b559547934f79279a59dcc85bf17` | `lk-a0b5c120…` |
| Dropdown Button | `b5c9294f0d6576fd0dbc60c4bcb3feae193f3b18` | `lk-0e768d5a…` |
| Regular Form Input | `22e8c038e7254e49e9be3b1fd9907c98f24dae9c` | `lk-39efdbaf…` |
| Floating Form Input | `d3c4758ef79de7d5f9f3acee061cc5ccb71aa3da` | `lk-bc307e97…` |
| Outline Form Input | `07a5aa5a0d5351db1d74d0d2c41e8dc828981006` | `lk-b7f1f8db…` |
| Outline Form Field | `c969d1b99f71c1c88ce2a40b0cfc2453b399b579` | `lk-b7f1f8db…` |
| OTP Form Input | `dc1aacaaef22c0a259f48ee339fa529c569d6bfc` | `lk-88b719e8…` |
| Form Check | `2cb023fc5104e0b27494abf2259d5f05a1e0bb6f` | `lk-bbc0bdbb…` |
| Modal Window | `915394273730cf892b2c474a94098ac51c3037e6` | `lk-1e893882…` |
| Small Segment Item | `164d6f0c86730811c7cef8d62bc3249cf8bf2286` | `lk-3c7a6637…` |
| Common Avatar | `c55594e1786437d4115135c1f72d2a46f06a8c2d` | `lk-453df41f…` |
| Tooltip | `913960095d085d83d22e41c7efea042775459782` | `lk-78db7f04…` |

---

## 7. Things to Investigate / Improve

> These items need verification by a human designer before relying on them.

- [ ] Confirm exact variants available on `Solid Button` (size, state, intent variants).
- [ ] Confirm exact variants available on `Regular Form Input` (size, state, type variants).
- [ ] Document which `Smooth Button` variants exist and when each applies.
- [ ] Document `Form Check` checkbox vs radio variants/properties.
- [ ] Confirm the correct `Link Button` library key (two versions exist; use the most-recently updated: `lk-a0b5c120…`).
- [ ] Identify and document icon-only components and icon library.
- [ ] Document `Common List Item` structure and override points.
- [ ] Document `Notification` variants (info, success, warning, error).
- [ ] Confirm spacing scale tokens (only border-radius and typography found; no explicit spacing scale yet).
- [ ] Confirm dark-mode / theme switching approach (both `cx.tokens.MAIN` and `Design System` libraries publish a `theme`/`Themes` collection).
- [ ] The `mnd.web.tmpl.settings` playground file contains a `🎠 Playground` canvas — explore other frames for additional usage examples.
