---
name: design-for-mundi-web
description: 'Build or update Figma screens for the Mundi web app — a financial management & investment platform built on the Chassis design system. Use when the user mentions Mundi, getmundi, Mundi web, or asks for screens/flows/pages targeting the Mundi product. Specializes `chassis-create-design` with the Mundi page shell (Sidebar + Page Template + Page Title), the Mundi flow-via-page-template pattern, and Mundi-specific component preferences and content conventions. Do NOT use for: Chassis library work without a Mundi target, native mobile (Mundi iOS/Android use a different shell), or pure brand/marketing pages.'
disable-model-invocation: false
---

# Build / Update Screens for the Mundi Web App

This skill is the **Mundi-project specialization** of `chassis-create-design`. It does not redefine how to build with Chassis — it overlays Mundi's product shell, page-template flow pattern, component preferences, and content conventions on top.

## ⛔ Required Skills (load in this order)

This skill sits on top of three layers of skills. **Load each one before doing any work.**

| Order | Skill | Why |
| ----- | ----- | --- |
| 1 | `figma-use` | Plugin API rules — color ranges, font preloading, paint reassignment, FILL ordering. Skipping causes silent failures. |
| 2 | `figma-generate-design` | Canonical 6-step screen workflow — Understand → Collect → Wrapper → Sections → Validate → Update. |
| 3 | `chassis-create-design` | Chassis-specific rules — Asset Override Pattern, token namespaces, component catalog, theme/mode system, Chassis anti-patterns. |
| 4 | `design-for-mundi-web` (this file) | Mundi product shell, flow patterns, component preferences, content conventions. |

**Logging:** Pass `skillNames: "figma-use,figma-generate-design,chassis-create-design,design-for-mundi-web"` on every `use_figma` call made under this skill.

If you have not yet read `chassis-create-design/SKILL.md`, **stop and read it now** — every Chassis rule (Asset overrides, no top-level text props, context tokens, no raw colors) applies in Mundi work without exception.

## What is Mundi

**Product summary:** Mundi is a **financial management & investment platform** that helps businesses (and some individuals) **earn returns on their idle cash automatically**.

| Capability | Description |
| --- | --- |
| **Single dashboard** | Connect/open an investment account; see all balances and returns in one place. |
| **Auto-invest idle cash** | Idle balance is moved into deposits, funds, or repo to generate daily returns. |
| **Best-rate routing** | Compares multiple financial institutions and picks better-yield opportunities. |
| **Liquidity-first** | Funds remain withdrawable anytime — nothing is locked long-term. |
| **Real-time transparency** | User sees exactly where money is invested and how much it earns, live. |

### How it works (user mental model)

1. User defines risk profile and cash needs.
2. User opens an investment account via a licensed broker.
3. The app allocates funds and re-optimizes returns daily.

### Core domain vocabulary

Use these terms in copy, microcopy, empty states, and labels — never invent synonyms.

| Term | Meaning |
| --- | --- |
| **Balance** | Total cash currently held in the account (idle + invested). |
| **Idle cash** | Uninvested portion of the balance, available for auto-invest. |
| **Yield / Return** | Earnings produced by invested funds, usually shown as daily and cumulative. |
| **Position** | A single investment holding (a fund, deposit, or repo allocation). |
| **Allocation** | The current distribution of funds across positions. |
| **Transfer** | Money moving in or out of the Mundi account (deposit / withdrawal / inter-account). |
| **Deposit / Withdrawal** | Top-up or pull-out of funds against a linked bank account. |
| **Statement** | Consolidated record of transactions and yields for a period. |
| **Risk profile** | User-selected risk tier (e.g., conservative / balanced / aggressive). |

### Primary action verbs (use in buttons / page actions)

`New transfer`, `Deposit`, `Withdraw`, `Buy funds`, `Sell funds`, `Invest`, `Redeem`, `Connect bank`, `Open account`, `View statement`, `Download report`.

## When to Use

| Mode | Use when |
| --- | --- |
| `new-screen` | Building a single new Mundi screen from scratch / from code / from description. |
| `new-flow` | Building a multi-state flow (e.g., onboarding, transfer, KYC) using the page-template-as-master pattern. |
| `update-screen` | Updating an existing Mundi screen — content, layout, or reconnection to current library. |
| `update-flow` | Propagating a change (label rename, removed field, new state) across all states of a flow via its master page template. |

## When NOT to Use

- Chassis library / generic Chassis screen → use `chassis-create-design` directly.
- Mundi **native mobile** (iOS / Android) — different shell and different component library.
- Generating production code from a Mundi design → use `chassis-implement-design`.
- Pure marketing / landing pages on getmundi.app — those use a different template stack.

## Prerequisites

- All `chassis-create-design` prerequisites (Figma MCP tools, Chassis library available).
- The **Mundi Figma file** open and connected, OR Mundi components published to the target file as a library.
- Source for the work: code, screenshot, written description, live URL on app.getmundi.app, or an existing Mundi screen to reconnect.

## 🔑 Mundi Screen Architecture

Every Mundi web screen shares this outer structure:

```
Root frame (1512 × variable height)
├── Sidebar                    [256 px wide, fixed]
└── Page Template              [fills remaining width]
    ├── Page Title             [60 px tall, fixed]
    └── Page Content
        └── Main               [scrollable area for the actual screen content]
```

### Component roles in the shell

| Layer | Source | Notes |
| --- | --- | --- |
| Root frame | Local (per screen) | `1512 × auto`. Holds the Sidebar and the Page Template side by side. |
| **Application Template** | Mundi library | Pre-assembled shell containing Sidebar + Page Template. **Detach this** to start a screen — it gives you the correct widths, paddings, and theme bindings for free. |
| **Sidebar** | Mundi library | 256 px wide. Reuse from the Application Template — do not rebuild. Variant changes (collapsed, hover, item active) are configured via the Sidebar's own props, not by editing children. |
| **Page Template** | Local (per flow) | Master frame you create per flow. Holds Page Title + Page Content. The same Page Template is reused across every state of one flow. |
| **Page Title** | Mundi library | 60 px tall. Asset-override pattern (see below). |
| **Main** | Local | The actual screen content lives here. Use Chassis components per `chassis-create-design`. |

> **Always assemble the shell before placing content.** Do not start by dropping a form into a blank frame — first detach the Application Template, then build the Page Template, then fill `Main`.

## 🔑 Mundi Flow Pattern — Page Template as Master

Mundi uses one **master Page Template per flow**. Every state of the flow (loading, empty, filled, error, success, confirmation) is a duplicate of the same page frame, with the same master Page Template instance, where states are produced by:

- toggling visibility of nested layers (show error banner, hide empty state)
- swapping nested component variants (button `loading` → `default`, form field `default` → `error`)
- overriding text via Asset layers

This means **a single edit to the master Page Template propagates to every state of the flow** — change a form label, remove a field, swap an action button, and all states update automatically.

### Building a new flow

1. **Detach Application Template** from the Mundi library into your working page → this is your **page frame**.
2. **Create a new section** in the Figma page for the flow's master Page Template. Build the layout (Page Title, Main, all forms, all banners, all empty states) **with all conditional layers present and their visibility set to the most-common state** (typically the "default" or "filled" state).
3. **Replace the Page Template inside the page frame** with an instance of your new master Page Template.
4. **Duplicate the page frame** once per flow state. In each duplicate, only toggle visibility / swap variants / override text — never restructure.
5. If the flow needs a structurally different layout (e.g. a confirmation receipt vs. a transfer form), create a **second master Page Template** and swap it in for those states.

> **Never edit a duplicated state's structure.** If you find yourself adding a layer to a single state, that layer belongs on the master.

### Updating a flow

- Open the master Page Template (not a state page frame).
- Make the change there.
- Verify a sample of state page frames picked up the change.
- If a state diverges, restore it by re-instancing the master, then re-apply only its toggles.

## Workflow — Mundi Overlay on `chassis-create-design`

Apply these Mundi-specific overrides at each step of the `chassis-create-design` workflow:

### Step 1 — Understand the Deliverable
- Identify the **flow** the screen belongs to and check whether a master Page Template already exists for it.
- Determine whether this is a **new flow**, a **new state in an existing flow**, or an **update**.
- For source = live URL, expect `app.getmundi.app/...`. Treat it like any web source — trigger the parallel `generate_figma_design` capture.

### Step 2 — Collect Components, Variables, Styles
- Always check for an existing Mundi `Application Template` and `Page Title` in the file before searching.
- For the Mundi **Sidebar**, never rebuild — it lives inside Application Template.
- Mundi-preferred Chassis variants (see [components.md](./references/components.md) for full list):
  - Forms: **floating** for primary flow forms; **regular** for filters/settings.
  - Buttons: **solid** for primary actions; **smooth** for secondary; **link** for tertiary / inline.
  - Tables: **bordered** rows for data-heavy views; default for compact lists.
  - Cards: use `card-content` wrapper; reserve cards for grouping unrelated content blocks.

### Step 3 — Create the Wrapper Frame
- **Width:** `1512 px` (Mundi root width — wider than Chassis default 1440 to account for the 256 px sidebar).
- **Background:** bind to `color/context/default/bg-main` so theme switching works.
- **Layout:** horizontal auto-layout with two children — Sidebar (256 fixed) and Page Template (FILL).

### Step 4 — Build Each Section
- Apply all `chassis-create-design` Step 4 rules (Asset overrides, no raw values, one section per call, no hidden-layer reveals).
- Mundi additions:
  - Page Title actions slot is reserved for **primary domain actions** (`New transfer`, `Deposit`, `Buy funds`). Do **not** put filters, view toggles, or sort controls there — those live inside Main.
  - Use the **Subtitle Asset** for context like account name, period, or status — not for instructions.
  - Reveal `Back Button` only when the page has a clear parent in the navigation hierarchy.

### Step 5 — Validate Each Section + Transfer Images
- Screenshot every state page frame, not just the master.
- For Mundi, also screenshot at `Theme = light` and `Theme = dark` if both are in scope — Mundi ships both.

### Step 6 — Updating an Existing View
- For flow updates: edit the **master** Page Template, not the state page frames.
- For shell updates (sidebar, app chrome): edit the Application Template instance once and let detachment cascade.
- Use `instance.swapComponent(newVariant)` to preserve overrides.

Detailed Mundi procedures (new flow, update flow, reconnect) live in [workflow.md](./references/workflow.md).

## Mundi Page Title — Asset Override Reference

The `Page Title` component follows the standard Chassis Asset Override Pattern.

| Sub-layer | Purpose | Default state |
| --- | --- | --- |
| `Title Text Asset` | Page heading. Override the nested `TEXT` property. | Visible |
| `Subtitle Asset` | Subtitle / contextual info (account name, period, status). | Hidden by default |
| `Actions` slot | Container for one or more primary action buttons. | Empty |
| `Back Button` | Back navigation. | Hidden |
| `Title Badge` | Status badge next to the title (`Live`, `Beta`, `Draft`). | Hidden |
| `Subtitle Action` | Interactive control inline with the subtitle (e.g., switch account). | Hidden |

Reveal hidden sub-layers **only when explicitly required** by the design.

## Mundi-Preferred Chassis Components

Quick reference — full catalog with variants and Mundi rationale lives in [components.md](./references/components.md).

| Use case | Mundi default | Avoid |
| --- | --- | --- |
| Primary action form | `form-floating` | `form-regular` for primary flows |
| Filters / settings | `form-regular` | `form-floating` (label clutter) |
| Primary action button | `button-solid` (`md`) | mixing sizes in one group |
| Secondary action | `button-smooth` | `button-outline` (reserved for destructive) |
| Tertiary / inline action | `button-link` | bare text |
| Data table | `table` with bordered rows | nested cards as fake tables |
| Status indicator | `badge` (semantic context) | colored text |
| Notification (transient) | `toast` | `alert` (reserved for inline persistent) |
| Confirmation / destructive | `modal` (sm/md) | `offcanvas` |
| Detail panel / form drawer | `offcanvas` (right, 400 px) | full-page navigation |
| Empty state | `card` with illustration + primary action | inline text-only message |

## Mundi Theme & Mode

Mundi inherits Chassis's Brand × Theme × App collections. Mundi-specific defaults:

- **Brand:** `Mundi`
- **Theme:** `Light` (default), `Dark` (supported on every screen).
- **App:** `Mundi Web`.

Apply theme overrides at the **Application Template** wrapper, not at section level — this lets the entire shell switch atomically. See [patterns.md → Mundi theme switching](./references/patterns.md#mundi-theme-switching).

## Mundi-Specific Critical Rules

These extend the `chassis-create-design` critical rules — none of those are overridden.

1. **Always start from `Application Template`.** Never build the sidebar or page chrome from primitives.
2. **One master Page Template per flow.** All states are duplicates with toggles, never structural divergences.
3. **Edit the master, not the state.** Updates to a flow happen on the master Page Template; state frames pick them up automatically.
4. **Page Title `Actions` slot is for primary domain actions only.** Filters and view controls belong in `Main`.
5. **Use Mundi domain vocabulary** in all copy. Do not invent synonyms (`Yield`, not `Profit`; `Position`, not `Asset`).
6. **Use floating forms for primary flows; regular for filters/settings.** Do not mix.
7. **Wrapper width is 1512 px**, not 1440 — the sidebar adds 256 px to the canonical Chassis 1440 page.
8. **Do not mix theme modes in one frame.** If both light and dark are needed, make two state frames.
9. **`button-outline` is reserved for destructive actions** in Mundi. Use `button-smooth` for normal secondary.
10. **Sidebar is a single library instance.** Never edit its children directly — change variants/props instead.

## Deliverable Format

Inherit `chassis-create-design`'s buckets. Mundi additions:

| Bucket | Mundi-specific meaning |
| --- | --- |
| **Built** | New flow / new state created using the master-page-template pattern. |
| **Master created** | A new master Page Template was authored for the flow. |
| **Master updated** | The flow's master Page Template was edited; states inherit the change. |
| **State synced** | A diverged state was re-aligned to the master. |
| **Swapped** | Sidebar or Application Template instance swapped to current Mundi library variant. |
| **Blocked** | Could not connect — include the exact failure (missing master, divergent state, library not linked). |

## References

- [tokens.md](./references/tokens.md) — Mundi-specific token usage and overrides on top of Chassis
- [components.md](./references/components.md) — Mundi component preferences with full Chassis variant context
- [patterns.md](./references/patterns.md) — Application Template pattern, master-flow pattern, theme switching, content conventions, Mundi anti-patterns
- [workflow.md](./references/workflow.md) — Detailed New Flow / Update Flow / Reconnect playbooks
- [content.md](./references/content.md) — Mundi domain vocabulary, microcopy, empty-state patterns, error messages

**Required upstream skills:** `figma-use`, `figma-generate-design`, `chassis-create-design`.
