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
| `new-flow` | Building a multi-step flow (e.g., onboarding, transfer, KYC) from scratch using the Page-Template-as-master pattern. |
| `extend-flow` | Adding a new step or a new variant to an existing flow. |
| `update-screen` | Updating an existing Mundi screen — content, layout, or reconnection to current library. |
| `update-flow` | Propagating a change (label rename, removed field, new state) across all states of a flow via its source Page Template. |
| `promote-template` | Converting a stable local Page Template master into a published Mundi library component. |

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

Every Mundi web screen is a **page frame** with this outer structure:

```
Page frame (1512 × hugs content, typically 982 for full-viewport screens)
├── Sidebar                    [256 px wide, fixed, library instance]
└── Page Template              [fills remaining width, library instance OR local master]
    ├── Page Title             [60 px tall, library instance, Asset-override]
    └── Page Content
        └── Main               [auto-layout, hugs content height per step]
```

### Component roles in the shell

| Layer | Source | Notes |
| --- | --- | --- |
| **Page frame** | Local (per state) | `1512 × auto` (often 982 for fixed-viewport screens). Direct children: one Sidebar instance + one Page Template instance. |
| **Sidebar** | Mundi library | `256 px` wide. Always a library instance — never edit children. Variant/active-item changes go through its own props. |
| **Page Template** | Mundi library **or** local master | Holds Page Title + Page Content. See "Page Template lifecycle" below — this is the heart of the Mundi flow pattern. |
| **Page Title** | Mundi library | Hug contents. Asset-override pattern (see below). |
| **Main** | Inside Page Template | The actual screen content. Auto-layout, hugs height — that is why a step-1 page is 540 px tall while a step-3 receipt is 836 px tall. |
| **Application Template** | Mundi library | Pre-assembled Sidebar + Page Template shell. Use this **only when scaffolding a brand-new product area** that does not yet have a Page Template. For existing flows, place Sidebar + Page Template directly. |

> **Build order for a new screen:** (1) place Sidebar instance, (2) place Page Template instance to its right, (3) override Page Title, (4) populate Main. Do not start from a blank frame and do not start by dropping forms — anchor on the Page Template first.

### Page Template lifecycle

Mundi Page Templates evolve through three stages — pick the right one for the work:

| Stage | When | Where it lives | How states are produced |
| --- | --- | --- | --- |
| **Local master frame** | New flow being designed for the first time | A working section in the Figma file | Duplicate page frames; each state is a separate copy of the master |
| **Local master + state instances** | Flow stabilized within a file | Master frame + Page Template instances of it across state page frames | Edit the master; states inherit. New states = duplicate a state page frame. |
| **Published library component** | Flow shipped and mature (e.g. `Outbound Transfer Page Template`) | Mundi component library | All state page frames carry instances of the published component; states are produced by overriding nested properties only |

When you find a Page Template that is already a **library component instance**, treat it as immutable from inside the state frame — open the source component to make structural changes, never detach.

## 🔑 Mundi Flow Pattern — Page Template as Master

Mundi flows are **collections of page frames sharing one Page Template**. Every state (loading, empty, filled, error, success, confirmation) is its own page frame containing an instance of the same Page Template. States are produced **only** by:

- toggling visibility of nested layers (show error banner, hide empty state)
- swapping nested component variants (button `loading` → `default`, form field `default` → `error`)
- overriding text via Asset layers
- inserting/removing items in slot-style auto-layout containers (e.g. recipient list)

A single edit to the source Page Template propagates to every state in the flow — change a form label, remove a field, swap an action button, all states update.

### Real-world reference

The outbound transfer flow (`Transfers / Outbound`) is the canonical reference:

- **One Page Template** (`Outbound Transfer Page Template`, published as a library component) drives the whole flow.
- **Steps:** flow has discrete logical steps (`1`, `2`, `3`). Each step has a different Page Template **state** (form → review → confirmation), surfaced by overriding the same component instance.
- **Variants per step:** within each step, alternative states (validation error, suggested recipients shown, balance warning, etc.) get their own page frame as `1.1`, `1.2`, `1.3`, ...
- **Overlay states** (`Delay` modal) are **separate page frames** using a different overlay component (`Alert Screen`) with a darkened backdrop — not a toggle inside the Page Template.

### Canvas layout convention

```
┌──────────┬──────────┬──────────┐
│  Step 1  │  Step 2  │  Step 3  │   ← columns = sequential flow steps
├──────────┼──────────┼──────────┤
│   1.1    │   2.1    │   3.1    │   ← rows below = variants of that step
│   1.2    │          │          │     (validation, alt states, etc.)
│   1.3    │          │          │
└──────────┴──────────┴──────────┘
┌──────────┐
│  Delay   │   ← orthogonal / overlay states float on the side
└──────────┘
```

Lay out new flows on the same grid: columns = steps, rows = variants.

### Naming convention

| Pattern | Meaning | Example |
| --- | --- | --- |
| `{Domain} / {Subdomain} - {Step}` | Canonical state of a step | `Transfers / Outbound - 1` |
| `{Domain} / {Subdomain} - {Step}.{Variant}` | Alternative state within a step | `Transfers / Outbound - 1.2` |
| `{Domain} / {Subdomain} - {OverlayName}` | Overlay/modal/orthogonal state | `Transfers / Outbound - Delay` |

The parent **Section** wraps the entire flow with a domain-language name (e.g. `Bankaya Aktar` — the user-facing flow name in the product's primary locale).

### Building a new flow

1. **Decide on the Page Template source:**
   - First-of-its-kind flow → start with a **local master frame** (build inside a working section).
   - Existing flow being extended → **place an instance** of the published Page Template (or the existing local master).
2. **Create the page frame:** `1512 × 982` (or hug height). Place a `Sidebar` instance at `x=0`, then the Page Template instance at `x=256`.
3. **Build the master state first** (typically Step 1, default state). All conditional layers present, visibility set to the most-common state.
4. **Duplicate the page frame** for each subsequent state and step. Lay them out per the canvas grid above. Name them per the naming convention.
5. **In each duplicate, only toggle / swap / override** — never restructure.
6. **Overlay states get their own page frame** using `Alert Screen` (or `Modal Screen`, `Dialog Screen` as applicable), not a toggle inside the Page Template.
7. **Promote the master to a library component** when the flow stabilizes: convert the master frame to a component, publish it, then re-instance it across all state page frames so future updates flow through the library.

> **Never edit a duplicated state's structure.** If you find yourself adding a layer to a single state, that layer belongs on the source Page Template.

### Updating a flow

- Open the **source Page Template** (local master frame, or the published library component) — not a state page frame.
- Make the change there.
- Verify a sample of state page frames picked up the change.
- If a state diverges, restore it by re-instancing the master and re-applying only its toggles.
- For **library-published** Page Templates: if the change is structural, edit the source component file, republish, then have the team accept library updates in the consuming file.

## Workflow — Mundi Overlay on `chassis-create-design`

Apply these Mundi-specific overrides at each step of the `chassis-create-design` workflow:

### Step 1 — Understand the Deliverable
- Identify the **flow** the screen belongs to and check whether a source Page Template already exists for it (local master or published library component).
- Determine whether this is a **new flow**, a **new step / variant in an existing flow**, an **update**, or a **promote-to-library** operation.
- Identify whether any required state is an **overlay** (modal, alert, dialog) — those are separate page frames using overlay-screen components, not toggles in the Page Template.
- For source = live URL, expect `app.getmundi.app/...`. Treat it like any web source — trigger the parallel `generate_figma_design` capture.

### Step 2 — Collect Components, Variables, Styles
- **Look for an existing source Page Template first:**
  - Check for a published library component matching the flow name (e.g. `Outbound Transfer Page Template`).
  - If none, search the file for a local master frame in a working section.
  - Only fall back to `Application Template` when the flow has no Page Template at all.
- For the Mundi **Sidebar**, never rebuild — use the library instance directly.
- Mundi-preferred Chassis variants (see [components.md](./references/components.md) for full list):
  - Forms: **floating** for primary flow forms; **regular** for filters/settings.
  - Buttons: **solid** for primary actions; **smooth** for secondary; **link** for tertiary / inline.
  - Tables: **bordered** rows for data-heavy views; default for compact lists.
  - Cards: use `card-content` wrapper; reserve cards for grouping unrelated content blocks.
### Step 3 — Create the Wrapper Frame
- **Width:** `1512 px` (Mundi root width — Chassis 1440 + 256 sidebar). Page Template width: `1256 px`.
- **Height:** typically `982 px` for fixed-viewport reference frames; let the Page Template itself hug content.
- **Background:** bind to `color/context/default/bg-main` so theme switching works.
- **Layout:** horizontal auto-layout with two children — Sidebar (256 fixed) at `x=0` and Page Template (FILL) at `x=256`.
- **Naming:** `{Domain} / {Subdomain} - {Step}[.{Variant}]`. Group all frames of one flow inside a Section named for the flow's user-facing label.

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

1. **Page frame = Sidebar + Page Template, side by side.** Never build the sidebar or page chrome from primitives. Use `Application Template` only when scaffolding a brand-new product area.
2. **One Page Template per flow.** All steps and variants share the same Page Template (local master OR published library component). All states are page-frame duplicates with toggles only — no structural divergences.
3. **Edit the source, not the state.** Updates to a flow happen on the source Page Template; state frames pick them up automatically.
4. **Follow the canvas grid:** columns = steps, rows = variants. Name frames `{Domain} / {Subdomain} - {Step}[.{Variant}]`.
5. **Overlay states get their own page frame** using `Alert Screen` / modal-screen components — not a toggle inside the Page Template.
6. **Page Title `Actions` slot is for primary domain actions only.** Filters and view controls belong in `Main`.
7. **Use Mundi domain vocabulary** in all copy. Do not invent synonyms (`Yield`, not `Profit`; `Position`, not `Asset`).
8. **Use floating forms for primary flows; regular for filters/settings.** Do not mix.
9. **Wrapper width is 1512 px**, not 1440 — the sidebar adds 256 px to the canonical Chassis 1440 page. Page Template width is 1256 px.
10. **Do not mix theme modes in one frame.** If both light and dark are needed, make two state frames.
11. **`button-outline` is reserved for destructive actions** in Mundi. Use `button-smooth` for normal secondary.
12. **Sidebar is a single library instance.** Never edit its children directly — change variants/props instead.
13. **Page Template hugs content height.** Different steps will have different heights (e.g. 540 → 836). This is expected — do not force a fixed height to make the canvas tidy.

## Deliverable Format

Inherit `chassis-create-design`'s buckets. Mundi additions:

| Bucket | Mundi-specific meaning |
| --- | --- |
| **Built** | New flow / new step / new state created using the Page-Template pattern. |
| **Master created** | A new local-master Page Template was authored for the flow. |
| **Master updated** | The flow's source Page Template was edited; states inherit the change. |
| **State synced** | A diverged state was re-aligned to the source Page Template. |
| **Promoted** | A local-master Page Template was converted to a published library component, and existing state frames were re-instanced. |
| **Swapped** | Sidebar or Page Template instance swapped to current Mundi library variant. |
| **Blocked** | Could not connect — include the exact failure (missing source Page Template, divergent state, library not linked, structural mismatch with published component). |

## References

- [tokens.md](./references/tokens.md) — Mundi-specific token usage and overrides on top of Chassis
- [components.md](./references/components.md) — Mundi component preferences with full Chassis variant context
- [patterns.md](./references/patterns.md) — Application Template pattern, master-flow pattern, theme switching, content conventions, Mundi anti-patterns
- [workflow.md](./references/workflow.md) — Detailed New Flow / Update Flow / Reconnect playbooks
- [content.md](./references/content.md) — Mundi domain vocabulary, microcopy, empty-state patterns, error messages

**Required upstream skills:** `figma-use`, `figma-generate-design`, `chassis-create-design`.
