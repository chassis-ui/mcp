# Mundi Token Conventions

This file is **not** a token catalog — that lives in `chassis-create-design/references/tokens.md`. This file documents:

1. Mundi's defaults on top of Chassis tokens
2. Which tokens to reach for in common Mundi contexts
3. Forbidden tokens / namespaces

For the canonical Chassis token system (namespaces, contexts, emphases, modes), always cross-reference the Chassis tokens file.

---

## Brand / Theme / App Settings

Mundi consumes Chassis's three variable collections with these settings:

| Collection | Default mode | Other supported modes |
| --- | --- | --- |
| **Brand** | `Mundi` | (single brand) |
| **Theme** | `Light` | `Dark` |
| **App** | `Mundi Web` | (Mobile uses a separate skill) |

Apply theme overrides at the page-frame wrapper level only. See [patterns.md → Mundi Theme Switching](./patterns.md#mundi-theme-switching).

---

## Color — Mundi Defaults per Context

Mundi uses Chassis context tokens — never raw color values, never hex literals.

| Surface | Token | Notes |
| --- | --- | --- |
| Page background | `color/page/bg-body` | Behind the entire page frame; inverts in dark mode |
| Page Template background | **No fill** — inherits the page background through the layer stack | Do not bind a fill token; leave it transparent |
| Card surface | `color/context/default/bg-main` | Slight lift from the page surface |
| Sub-card / inset surface | `color/context/default/bg-evident` | One level deeper |
| Sidebar background | `color/context/default/bg-main` (with elevation token) | Sidebar uses the same surface as the page; separation is via stroke/shadow |
| Selected / hover row | `color/context/default/bg-highlight` | Hover, focus, selected list items |
| Primary text | `color/context/default/fg-main` | Body copy and labels |
| Secondary text | `color/context/default/fg-subtle` | Helper text, timestamps, secondary labels |
| Tertiary / disabled | `color/context/default/fg-slight` | Placeholder, disabled |
| Strong heading | `color/context/default/fg-main` (paired with stronger weight) | Don't reach for fg-solid for headings |

### Semantic Context Mapping (Mundi)

| Mundi concept | Context | Use cases |
| --- | --- | --- |
| Brand / hero call-to-action | `primary` | `button-solid` primary action, brand accents |
| Selected state, focus | `primary` | Selected row, focused field |
| Yield / positive return | `success` | Yield values, positive deltas, completed transfers |
| Loss / negative return | `danger` | Negative deltas, failed transfers, destructive confirmation |
| Pending / incomplete | `warning` | Pending verification, processing delay, balance warning |
| Informational / educational | `info` | First-time-user tips, explanatory callouts |
| Neutral / non-semantic accent | `neutral` | Counter pills, generic chips |
| Featured / promotional | `alternate` | Promotional cards, feature spotlight (does not invert in dark mode) |
| Persistent in any theme | `black` / `white` | Logos, brand artwork that must not invert |

### Semantic Conventions

- **Yield is always `success`.** Never green-by-coincidence — bind `color/context/success/fg-main`.
- **Loss is always `danger`.** Never red-by-coincidence.
- **Pending / processing is always `warning`.** Don't use `info` for pending — info is for educational content.
- **Currency amounts** in body text use `color/context/default/fg-main`. Only the **delta** (e.g. `+₺245,12`) uses `success` / `danger`.

---

## Typography — Mundi Roles

| Role | Token | Notes |
| --- | --- | --- |
| Page Title heading | `font/text/xlarge/strong` | Mundi page titles use h2-equivalent (smaller than h1 in Chassis defaults) |
| Page Title subtitle | `font/text/medium/normal` | Subtitle is supporting metadata, not body |
| Section heading | `font/text/large/strong` | Inside Main, group headers |
| Body copy | `font/text/medium/normal` | Default body |
| Helper / caption | `font/text/small/normal` | Form helper, timestamps |
| Button label | `font/button/medium` | Bound by the button component, do not override |
| Floating-label form | `font/form-input/floating-label` (label) + `font/form-input/floating-text` (value) | Bound by the form component |
| Stat value (large monetary figure) | `font/text/2xlarge/strong` | Dashboard balances, position values |
| Stat label (above the value) | `font/text/small/normal` paired with `fg-subtle` | Caption-style label |

**Rule:** Don't bind `font-family` directly. The Chassis text styles already include family + weight + size + line-height + letter-spacing. Bind the role token, get all properties for free.

---

## Spacing — Mundi Defaults

Prefer Chassis **context** spacing tokens. When no fitting context token exists, `space/unit/{unit}` is acceptable — but never use pixel literals.

| Surface | Token | Notes |
| --- | --- | --- |
| Page Template padding | `space/page/large-padding-x`, `space/page/large-padding-y` | Outer padding inside the Page Template |
| Section gap inside Main | `space/context/medium` | Vertical gap between sections in Main |
| Card content padding | `space/context/medium` (handled by `card-content`) | Bound by component |
| Button group gap | `space/context/small` | Between buttons in an action group |
| Form field gap | `space/context/medium` | Between fields in a form |
| Inline icon-to-text gap | `space/context/xsmall` | Inside a button, badge, chip |
| Page Title to Main gap | `space/page/large-gap` | Bound by the Page Template |

---

## Sizing — Fixed Mundi Dimensions

These are the **only hardcoded sizes** allowed in Mundi web shells. They are constants of the product, not tokens.

| Element | Width × Height | Notes |
| --- | --- | --- |
| Page frame | `1512 × auto` (typ. 982) | Root width is fixed |
| Sidebar | `256 × 982` | Width is fixed; height matches page frame |
| Page Template | `1256 × auto` (hugs height) | Width = 1512 − 256 |
| Page Title | `1256 × 60` | Height is fixed by the component |
| Offcanvas (right drawer) | `400 × full-height` | Mundi standard |
| Modal Screen content | typically `480 × auto` to `640 × auto` | Center-aligned by Modal Screen |
| Alert Screen content | typically `480 × auto` | Center-aligned by Alert Screen |
| Dialog Screen content | typically `400 × auto` | Smaller than modal |

For all other sizing — buttons, fields, cards — prefer Chassis context sizing tokens (`size/context/...`). `size/unit/{unit}` is acceptable when no fitting context token exists.

---

## Border Radius

Mundi uses Chassis radius context tokens. Defaults:

| Surface | Token |
| --- | --- |
| Card | `borderRadius/context/medium` |
| Page Template root | `borderRadius/context/large` (when shown as a panel) |
| Button, badge, chip | bound by component |
| Modal/Alert/Dialog content | `borderRadius/context/xlarge` |
| Avatar | `borderRadius/context/circle` |

---

## Forbidden Token Usage

| ❌ Don't use | ✅ Use instead |
| --- | --- |
| `color/palette/...` (primitive color scale) | `color/context/{context}/...` |
| Hex literals (`#3527DD`, `#23C16B`) | Bind the matching `color/context/...` token via `setBoundVariableForPaint` |
| `space/unit/{unit}` (when a context token fits) | `space/context/{size}` — unit tokens OK when no context token applies |
| `size/unit/{unit}` (when a context token fits) | `size/context/...` — unit tokens OK when no context token applies |
| `font-family` directly | Bind a `font/...` text style (family is already inside) |
| Theme override at section/card level | Theme override at the page frame only |
| `level/...` opacity in shell elements | `opacity/context/...` |

---

## Quick Bindings Cheat-Sheet

When building a Mundi screen, bind these in this order:

1. **Page frame fill** → `color/page/bg-body`
2. **Page Template padding** → `space/page/large-padding-{x|y}`
3. **Page Title** (skip — bound by component)
4. **Main section gaps** → `space/context/medium`
5. **Card surfaces** → `color/context/default/bg-main`
6. **Selected/hover rows** → `color/context/default/bg-highlight`
7. **Body text** → `color/context/default/fg-main`
8. **Helper text** → `color/context/default/fg-subtle`
9. **Yield text** → `color/context/success/fg-main`
10. **Loss text** → `color/context/danger/fg-main`
11. **Pending status** → `color/context/warning/fg-main`
