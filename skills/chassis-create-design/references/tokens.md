# Chassis Design Tokens — Complete Reference

All visual decisions in a Chassis design must use these variables. Never hardcode raw values for colors, typography, spacing, sizing, radius, borders, or opacity. If no token fits, ask the user before resorting to a literal value.

## Naming Pattern Quick Reference

| Token domain      | Pattern                                                  | Example                                |
| ----------------- | -------------------------------------------------------- | -------------------------------------- |
| Colors            | `color/context/{context}/{role}-{emphasis}`              | `color/context/primary/fg-main`        |
| Typography        | `font/{family}/{size}/{weight}`                          | `font/text/medium/normal`              |
| Spacing (context) | `space/context/{context}`                                | `space/context/medium`                 |
| Spacing (unit)    | `space/unit/{unit}`                                      | `space/unit/16`                        |
| Sizing (context)  | `size/context/{context}`                                 | `size/context/medium`                  |
| Sizing (unit)     | `size/unit/{unit}`                                       | `size/unit/40`                         |
| Border radius     | `borderRadius/context/{context}`                         | `borderRadius/context/medium`          |
| Border width      | `borderWidth/context/{context}`                          | `borderWidth/context/medium`           |
| Opacity (context) | `opacity/context/{context}`                              | `opacity/context/fg-subtle`            |
| Opacity (level)   | `opacity/level/{level}`                                  | `opacity/level/50`                     |

---

## Colors

Color is built on a **context × role × emphasis** grid. Each context provides a complete palette so any UI surface can be themed by changing only the context.

### Contexts

| Context     | Use for                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `default`   | General UI elements — most common. Inverts between light/dark mode.    |
| `alternate` | Distinct sections needing alt color scheme. May not invert across modes. |
| `primary`   | Primary actions and highlights                                         |
| `secondary` | Secondary actions and highlights                                       |
| `success`   | Success states and messages                                            |
| `error`     | Error states and messages                                              |
| `warning`   | Warning states and messages                                            |
| `info`      | Informational states and messages                                      |
| `black`     | Black/near-black colors persistent across themes                       |
| `white`     | White/near-white colors persistent across themes                       |

### Roles & Emphasis

#### Base Colors

| Role               | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| `base-color`       | Core context color for backgrounds, fills, large color areas |
| `contrast-color`   | Companion to base — text/elements on top of base             |
| `transparent-color`| Fully transparent placeholder for gradients/overlays         |

#### Foreground (`fg-*`) — text and "color" property

| Role           | Purpose                                                                |
| -------------- | ---------------------------------------------------------------------- |
| `fg-main`      | Primary text — highest contrast against background                     |
| `fg-subtle`    | Secondary text — less prominent                                        |
| `fg-slight`    | Tertiary text — least prominent / disabled                             |
| `fg-inverse`   | Inverse foreground — pairs with `bg-inverse`                           |
| `fg-solid`     | Solid-element text (e.g., button labels) — pairs with `bg-solid`       |
| `fg-highlight` | Accents / interactive attention — pairs with `bg-highlight`            |

#### Background (`bg-*`) — solid surfaces

| Role           | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `bg-main`      | Primary surface background                                           |
| `bg-even`      | Slightly shaded surface — soft section separation                    |
| `bg-evident`   | Highly evident surface — strong separation / important sections      |
| `bg-inverse`   | Inverse background — pairs with `fg-inverse`                         |
| `bg-solid`     | Solid element background (e.g., buttons) — pairs with `fg-solid`     |
| `bg-highlight` | Accent surface — pairs with `fg-highlight`                           |

#### Border (`border-*`)

| Role            | Purpose                                                              |
| --------------- | -------------------------------------------------------------------- |
| `border-main`   | Prominent borders/separators — rarely used                           |
| `border-subtle` | Subtle borders — common in UI                                        |

#### Icon (`icon-*`)

| Role          | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| `icon-main`   | Prominent icons that need recognition                  |
| `icon-subtle` | Less prominent icons that blend with text/background   |
| `icon-slight` | Least prominent / disabled icons                       |

#### Cue (`cue-*`)

| Role         | Purpose                                                              |
| ------------ | -------------------------------------------------------------------- |
| `cue-main`   | Active states, selection indicators, attention cues                  |
| `cue-subtle` | Less prominent / disabled active states                              |

#### Dim (`dim-*`)

| Role         | Purpose                                                              |
| ------------ | -------------------------------------------------------------------- |
| `dim-main`   | Modal backdrops / overlays                                           |
| `dim-subtle` | Lighter dim used with backdrop blur for softer effect                |
| `dim-slight` | Very light dim — subtle blending                                     |

#### Link (`link-*`)

| Role           | Purpose                              |
| -------------- | ------------------------------------ |
| `link-main`    | Default link color                   |
| `link-hover`   | Hover state                          |
| `link-active`  | Active / clicked state               |
| `link-visited` | Visited link distinction             |

### Choosing Colors

1. Pick the **context** that matches the semantic meaning (default for general, primary for primary actions, etc.)
2. Pick the **role** based on what the element does (text → `fg-*`, surface → `bg-*`, etc.)
3. Pick the **emphasis** based on visual hierarchy (`main` highest, `subtle` mid, `slight` lowest)
4. Compose: `color/context/{context}/{role}-{emphasis}`

---

## Typography

Pattern: `font/{family}/{size}/{weight}` — example: `font/text/medium/normal`

### Families

| Family    | Use for                                                                |
| --------- | ---------------------------------------------------------------------- |
| `text`    | Body text, labels, general-purpose typography                          |
| `display` | Headings, titles, prominent text                                       |
| `html`    | Documentation/content design — simulating HTML headings/lists/quotes   |
| `code`    | Monospaced code snippets, technical text                               |

### Sizes

| Size       | Use for                                                                       |
| ---------- | ----------------------------------------------------------------------------- |
| `2xsmall`  | Very fine print, disclaimers (legal/regulatory)                               |
| `xsmall`   | Fine print, very secondary info                                               |
| `small`    | Captions, secondary text                                                      |
| `medium`   | **Standard body text** — default for most UI                                  |
| `large`    | Text that needs to stand out                                                  |
| `xlarge`   | Subheadings, important labels                                                 |
| `2xlarge`  | Section headings, prominent text                                              |
| `3xlarge`  | Main headings, hero sections                                                  |
| `4xlarge`  | Dashboards, hero — extremely prominent                                        |
| `5xlarge`  | Dashboards, hero — maximum prominence                                         |

> **Why so many large sizes?** Chassis targets dashboards and hero sections that need very large display text. The wide range lets designers create bold, attention-grabbing typography without resorting to custom sizes.

### Weights

| Weight    | Use for                                                                      |
| --------- | ---------------------------------------------------------------------------- |
| `normal`  | Standard text — balanced and readable                                        |
| `strong`  | Slightly emphasized text                                                     |
| `mass`    | Heavy weight for very prominent text (headings, important labels)            |
| `elegant` | Sophisticated emphasis — main headings, hero sections                        |

> **Why non-numeric names?** Chassis is themeable across brands. One brand may map `strong → 700` and `mass → 900`, another `strong → 500` and `mass → 700`. Descriptive names express intent without locking to specific numeric values.

---

## Spacing

Two scales:

- **Context-based** (`space/context/{context}`) — preferred for standardized use cases
- **Unit-based** (`space/unit/{unit}`) — fallback for specific values not in the context scale

### Context Scale

| Context    | Approx. value | Use for                                                  |
| ---------- | ------------- | -------------------------------------------------------- |
| `zero`     | 0px           | No space                                                 |
| `4xsmall`  | 1px           | Hairline / compact components                            |
| `3xsmall`  | 2px           | Very tight spacing                                       |
| `2xsmall`  | 4px           | Tight spacing in compact components                      |
| `xsmall`   | 8px           | Related elements                                         |
| `small`    | 12px          | Form fields, buttons, list items                         |
| `medium`   | 16px          | Sections, component groups                               |
| `large`    | 20px          | Major sections                                           |
| `xlarge`   | 24px          | Major sections in spacious layouts                       |
| `2xlarge`  | 28px          | Dashboard / hero sections                                |
| `3xlarge`  | 32px          | Dashboard / hero sections                                |
| `4xlarge`  | 36px          | Dashboard / hero sections                                |
| `5xlarge`  | 40px          | Dashboard / hero sections                                |
| `6xlarge`  | 48px          | Dashboard / hero sections                                |

### Unit Scale

Starts at 0px and increases in 2px increments (4px and 8px increments at higher ranges). Use when a specific value is needed that doesn't map to a context name.

> **Default to context.** Reach for unit-based only when context-based doesn't fit.

---

## Sizing

Two scales — same pattern as spacing.

### Context Scale

| Context    | Approx. value | Use for                                                  |
| ---------- | ------------- | -------------------------------------------------------- |
| `2xsmall`  | 16px          | Very small icons / form fields                           |
| `xsmall`   | 24px          | Small icons / form fields                                |
| `small`    | 32px          | Small components                                         |
| `medium`   | 40px          | **Standard component size**                              |
| `large`    | 48px          | Larger components                                        |
| `xlarge`   | 56px          | Extra-large components                                   |
| `2xlarge`  | 64px          | Very large components                                    |

### Unit Scale

Starts at 0px and increases in 4px increments (4px and 8px at higher ranges).

---

## Border Radius

Pattern: `borderRadius/context/{context}`

| Context    | Approx. | Use for                                            |
| ---------- | ------- | -------------------------------------------------- |
| `zero`     | 0px     | Sharp corners                                      |
| `2xsmall`  | 2px     | Slightly rounded                                   |
| `xsmall`   | 2px     | Slightly rounded                                   |
| `small`    | 4px     | Moderately rounded — buttons, cards, fields       |
| `medium`   | 8px     | More rounded                                       |
| `large`    | 12px    | Very rounded                                       |
| `xlarge`   | 16px    | Extra rounded                                      |
| `2xlarge`  | 20px    | Very extra rounded                                 |
| `3xlarge`  | 24px    | Maximum rounded                                    |
| `round`    | 9999px  | Fully rounded — pills, avatars, circular buttons   |

---

## Border Width

Pattern: `borderWidth/context/{context}`

| Context    | Approx. | Use for                            |
| ---------- | ------- | ---------------------------------- |
| `zero`     | 0px     | No border                          |
| `small`    | 0.5px   | Thin borders / dividers            |
| `medium`   | 1px     | **Standard borders** — most common |
| `large`    | 1.5px   | Thick borders                      |
| `xlarge`   | 2px     | Very thick borders                 |
| `2xlarge`  | 4px     | Extremely thick borders            |

---

## Opacity

Two scales:

- **Context-based** (`opacity/context/{context}`) — semantic, preferred
- **Level-based** (`opacity/level/{level}`) — granular numeric

### Context Scale

| Context        | Use for                                                       |
| -------------- | ------------------------------------------------------------- |
| `fg-subtle`    | Subtle foreground (e.g., secondary text)                      |
| `fg-slight`    | Slight foreground (e.g., disabled text)                       |
| `border-main`  | Borders on form fields / outlined elements                    |
| `border-subtle`| Subtle borders (cards, dividers)                              |
| `icon-subtle`  | Subtle icons (secondary)                                      |
| `icon-slight`  | Slight icons (disabled)                                       |
| `cue-subtle`   | Subtle cues (disabled states / selection)                     |
| `dim-main`     | Modal backdrops / overlays                                    |
| `dim-subtle`   | Backdrops with blur (softer effect)                           |
| `dim-slight`   | Backdrops with blur (subtle effect)                           |

### Level Scale

| Level         | Value      | Use for                                  |
| ------------- | ---------- | ---------------------------------------- |
| `transparent` | 0%         | Fully transparent                        |
| `05`          | 5%         | Very subtle backgrounds / faint borders  |
| `10`–`90`     | 10% – 90%  | 10% increments                           |
| `95`          | 95%        | Nearly opaque                            |
| `solid`       | 100%       | Fully opaque                             |

> **Default to context.** Reach for level-based only when context-based doesn't fit.

---

## Token Selection Decision Tree

When choosing a token:

1. **Does a context-named token fit the semantic intent?** → use it
2. **Does a unit/level token represent the exact value?** → use it
3. **No token fits?** → ask the user before hardcoding. Often the right answer is to add the value to the chassis-tokens repo.
