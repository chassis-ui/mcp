# Mundi Component Preferences

This file is **not** a component catalog — that lives in `chassis-create-design/references/components.md`. This file documents Mundi's **opinions on top of Chassis**: which variant to default to for each use case, why, and the anti-patterns to avoid.

For component slugs, variants, and Asset-override structures, always cross-reference the Chassis catalog.

---

## Mundi-Owned Components (not in Chassis)

These live in the Mundi library, not Chassis. They are the page-shell layer.

| Component                  | Purpose                                                                         | Notes                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Application Template`     | Pre-assembled Sidebar + Page Template shell at `1512 × 982`                     | Use only for scaffolding a brand-new product area. For existing flows, place Sidebar + Page Template directly.                                              |
| `Sidebar`                  | Left-rail navigation, `256 px` wide                                             | Single instance per page frame. Variants: collapsed/expanded, item-active states. **Never edit children** — drive everything via the component's own props. |
| `Page Template` (per flow) | Page Title + Page Content for one flow (e.g. `Outbound Transfer Page Template`) | Lifecycle: local master frame → local master + state instances → published library component. See [workflow.md](./workflow.md).                             |
| `Page Title`               | 60 px page header with title, subtitle, actions, badge, back-button             | Asset-override pattern. See SKILL.md → "Mundi Page Title — Asset Override Reference".                                                                       |

---

## Chassis Components — Mundi Defaults

For each common use case, this table records Mundi's default Chassis variant. The **Avoid** column shows variants that are explicitly off-pattern in Mundi.

### Forms

| Use case                                     | Mundi default                                  | Avoid in Mundi                                          |
| -------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Primary action form (transfer, deposit, KYC) | `form-floating`                                | `form-regular`                                          |
| Filter / settings form                       | `form-regular`                                 | `form-floating` (label clutter)                         |
| Search input in toolbars                     | `form-outline`                                 | inline `form-regular`                                   |
| Inline edit (table cell, single field)       | `form-outline`, `small` size                   | `form-floating`                                         |
| Toggle (binary setting)                      | `form-switch`                                  | `form-check` (checkbox)                                 |
| Multi-select (list of choices)               | `form-check` (checkbox group)                  | `form-radio` for non-exclusive choices                  |
| Validation feedback                          | inline `valid` / `invalid` states on the field | top-of-form `alert` (use only for global submit errors) |

**Rule:** Do not mix `form-floating` and `form-regular` inside one form. Pick one based on the role of the form, stay consistent.

### Buttons

| Role                                                              | Mundi default                                    | Avoid in Mundi                                    |
| ----------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| Primary domain action (e.g. `Transfer`, `Buy funds`)              | `button-solid`, `primary`, `medium`              | mixing sizes in one group                         |
| Secondary action                                                  | `button-solid`, `default`                        | `button-outline` (reserved)                       |
| Tertiary / inline action (`Cancel`, `Edit`, `View statement`)     | `button-link`                                    | bare text                                         |
| Destructive action (`Delete`, `Close account`, `Cancel transfer`) | `button-outline` with `danger` context           | `button-solid` `danger` (too aggressive in Mundi) |
| Page Title actions slot                                           | `button-solid` `medium` (3 buttons max)          | Filter buttons, sort toggles                      |
| Card actions footer                                               | `button-link` or `button-smooth` `small`         | `button-solid` (visual noise inside a card)       |
| Toolbar / table-row actions                                       | `button-icon-only`, `small`                      | text buttons                                      |
| Step navigation in flows (`Continue`, `Back`)                     | `button-solid` (Continue) + `button-link` (Back) | two solid buttons                                 |

**Rule:** One primary (`solid`) per action group. Never mix `medium` and `small` in the same row.

### Cards

| Use case                          | Mundi default                                            | Avoid in Mundi           |
| --------------------------------- | -------------------------------------------------------- | ------------------------ |
| Grouping unrelated content blocks | `card` with `card-content` wrapper                       | bare frames              |
| Empty states                      | `card` with illustration + title + body + primary action | inline text-only message |
| Position / account summary        | `card` with structured rows (label + value pairs)        | tables for ≤5 rows       |
| Promotional / featured callout    | `card` with `alternate` or `primary` context             | bare colored frames      |

### Tables

| Use case              | Mundi default                             | Avoid in Mundi                        |
| --------------------- | ----------------------------------------- | ------------------------------------- |
| Transaction history   | `table` with bordered rows                | nested cards                          |
| Position list         | `table` (compact)                         | card grid (use only for ≤5 positions) |
| Inline-editable table | `table` with `form-outline` `small` cells | `form-floating` cells                 |

### Navigation

| Use case                  | Mundi default                             | Avoid in Mundi                   |
| ------------------------- | ----------------------------------------- | -------------------------------- |
| Primary navigation        | `Sidebar` (Mundi-owned)                   | top navbar                       |
| In-page section switching | `nav-tabs`                                | `nav-pills`                      |
| Hierarchical drill-down   | `breadcrumb` + `Page Title` `Back Button` | nested-page links in body copy   |
| Result pagination         | `pagination` (Chassis default)            | infinite scroll for transactions |

### Surfaces / Overlays

| Use case                         | Mundi default               | Avoid in Mundi                                    |
| -------------------------------- | --------------------------- | ------------------------------------------------- |
| Confirmation / destructive       | `Modal Screen` (Mundi)      | `offcanvas`                                       |
| Detail panel / form drawer       | `offcanvas` (right, 400 px) | full-page navigation                              |
| Processing-delay (>2s operation) | `Alert Screen` with spinner | inline page-level loading                         |
| Quick yes/no                     | `Dialog Screen`             | `modal`                                           |
| Inline help                      | `popover`                   | `tooltip` (reserve tooltip for icon-only buttons) |

### Feedback

| Use case                                                  | Mundi default                                                | Avoid in Mundi                  |
| --------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------- |
| Transient confirmation (`Transfer sent`)                  | `notification`                                               | `alert`                         |
| Persistent inline notice (`Account verification pending`) | `alert` (semantic context)                                   | `notification` (will disappear) |
| Status indicator on a row (`Pending`, `Completed`)        | `badge` (semantic context)                                   | colored text                    |
| Real-time process indicator                               | `progress` (linear) for known durations, `spinner` otherwise | indeterminate progress bar      |
| First-load skeleton                                       | `skeleton` matching the final layout                         | spinner over empty area         |

### Communication

| Use case                            | Mundi default                                            | Avoid in Mundi                            |
| ----------------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| Counterparty / institution identity | `avatar` (image or initials) + `chip` (institution name) | text-only label                           |
| Position tag, fund type             | `chip` (low-emphasis)                                    | `badge` (reserved for status)             |
| User profile (header, settings)     | `avatar` + name                                          | initials in colored circle (use `avatar`) |

---

## Slot-Style Auto-Layout Containers

Several Mundi flow components expose **slot containers** — auto-layout frames where you add/remove items to drive list states. Treat them as part of the override surface, not as structural edits.

| Container                          | Items typically swapped in | Example states                                      |
| ---------------------------------- | -------------------------- | --------------------------------------------------- |
| Recipient list (Outbound Transfer) | Recipient row instances    | empty / suggested / matching-search / single-result |
| Position list (Investments)        | Position row instances     | empty / loading / 1–N positions                     |
| Activity feed (Dashboard)          | Activity row instances     | empty / today-only / multi-day                      |

**Rule:** Adding/removing instances inside a slot container counts as a state override, not a structural change. Do this in state page frames, not on the source Page Template.

---

## Anti-Patterns Specific to Mundi

| Anti-pattern                                           | Why it's wrong                                            | Correct approach                                             |
| ------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------ |
| Custom-built sidebar in a state frame                  | Sidebar must be a single library instance                 | Place the `Sidebar` instance from the library                |
| Toggling overlay/modal layers inside the Page Template | Overlay = separate page frame                             | Create a new page frame with `Alert Screen` / `Modal Screen` |
| Using `button-solid danger` for destructive            | Reads as too aggressive                                   | `button-outline` with `danger` context                       |
| Two `button-solid` in one action group                 | Two primaries = no primary                                | One solid + one smooth, or one solid + one link              |
| `form-floating` mixed with `form-regular` in one form  | Inconsistent label style                                  | Pick one based on the form's role                            |
| Putting filters in `Page Title` actions slot           | Actions slot = primary domain action only                 | Place filters at the top of `Main`                           |
| 1440-wide page frame                                   | Mundi root = 1512 (1440 content + 256 sidebar)            | Use `1512 × auto` for the page frame                         |
| Fixed Page Template height across states               | Page Template hugs content; states have different heights | Set height to HUG; let it grow                               |
| Inventing copy synonyms (`Profit`, `Asset`)            | Breaks domain consistency                                 | Use the [content vocabulary](./content.md)                   |
| Editing a state page frame's structure                 | Structural changes belong on the source Page Template     | Edit the source; let the change propagate                    |
| Detaching a Page Template instance to edit             | Detachment kills propagation                              | Edit the source component; re-instance the state             |
