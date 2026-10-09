# The Chassis UI library in Figma

What the library is, how a component is found and read at run time, the conventions that hold across it, and what each of its pages holds. Read in October 2026; when this file and the library disagree, the library is right, and the props of a component are always read from the component, never from here.

## The three libraries

| Library             | Holds                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cx.components.UI`  | Every component, asset and icon: 68 pages, one per component, each with a "Docs" section (Variants, Props, Specs, Tokens) and then the component sets |
| `cx.tokens.MAIN`    | The variables (collections `brand`, `theme`, `app`, `system`), the text styles `font/*` and the effect styles `shadow/*` ([tokens.md](./tokens.md))   |
| `cx.components.DOC` | The components of the docs frames; not used in a screen                                                                                               |

A new file of the team has the three added; `get_libraries` lists them under `libraries_added_to_file`, each with `name`, `libraryKey` and `source`. Other libraries may be added to a file (an icon library, for one); nothing of Chassis uses them. Neither the library file nor a product file has local variables or styles: `getLocalVariableCollectionsAsync()` and `getLocalTextStylesAsync()` return nothing, and `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()` may too. The search is the way to a variable or style.

`cx.components.UI` is published twice, by the team and as a community file of the same name. A search scoped to the community copy returns nothing today, so a file uses the team library.

## Finding a component

Three tool calls, never a key from memory:

1. `get_libraries({ fileKey })` returns the libraries added to the file. Take the `libraryKey` of each.
2. `search_design_system({ fileKey, includeLibraryKeys, queries })`, with one object per thing needed: `{ entity: "component", query: "Solid Button" }`, `{ entity: "variable", query: "color/context/default/bg-main" }`, `{ entity: "style", query: "font/context/title/medium" }`. One intent per query. `results[]` comes back in the same order; a component entry has `name`, `assetType` (`component` or `component_set`), `componentKey` or `componentSetKey`, and `libraryKey`; variables and styles have `name` and `key`. A result is about 500 characters, and a component query returns two to five of them, a variable or style query fourteen (about 7 KB): send every component of the task in one call and the variables and styles in another, at most six of those to a call, because a client refuses a tool result that grows past about 50 KB. Ask for what the sections need and nothing speculative.
3. In `use_figma`: `importComponentByKeyAsync(componentKey)` for a `component`, `importComponentSetByKeyAsync(componentSetKey)` for a `component_set`; a library variable with `figma.variables.importVariableByKeyAsync(key)`; a style with `figma.importStyleByKeyAsync(key)`.

Query by the name the library gives the component. The old docs slugs (`button-solid`, `form-regular`) still find the set, but not first, and `cx.asset.text` returns an app icon: for standalone text query "Basic Text Asset". A variant of a set is named by all its props (`context=default, size=medium, state=idle`), so a variant is never picked by comparing a child's name with one pair; take `set.defaultVariant` and set the variants with `setProperties`.

`get_metadata` returns the node tree of a page or frame (ids, types, names, positions, sizes, hidden layers) and never a key; keys come from the search alone.

A name ending in ` @ 0.1 - DEPRECATED` is a deprecated publication (today only two old `Basic Slot`s): use the same name without the suffix. A name starting with `_` is a private part of another component and is not placed on its own.

## Reading a component

The props, their types and defaults, and the layer tree are read from the library at run time, once per component and session ([recipes.md → Inspect a component](./recipes.md#inspect-a-component)):

- `componentPropertyDefinitions` on the imported set (or on a lone component; never on a variant, which throws) gives each prop with `type`, `defaultValue` and, for a VARIANT, `variantOptions`.
- `componentProperties` on a temporary instance gives the same keys with their current values. BOOLEAN, TEXT and INSTANCE_SWAP keys end in `#id` (`has-badge#20:26`, `text#142:1`) and are passed to `setProperties` whole; VARIANT keys are bare (`context`, `size`). A nested instance has its own `componentProperties`.
- `exposedInstances` is empty on the sets: a nested Asset is found by name with `findAllWithCriteria({ types: ['INSTANCE'] })`, a slot with `findOne(n => n.type === 'SLOT')`, a plain text layer with `findAllWithCriteria({ types: ['TEXT'] })`.

The "Docs" section of a component's page shows the same to a person. An agent reads the instance.

## Conventions across the library

### Text

Text takes one of three forms, and a component may mix them:

1. **A text Asset**: a nested instance of `Basic Text  Asset` (two spaces in the component's name) or `Fill Text  Asset`, named `<Role> Asset` with one space, with a TEXT property whose key starts with `text#`. Roles: "Label Asset" in buttons, badges, chips, tab and segment items; "Title Asset", "Body Asset" and "Category Asset" in cards, "Title Asset" and "Body Asset" in alerts, accordion items, tooltips and modal headers, "Subtitle Asset" in modal headers and the page title, "Help Asset" in `Form Help`, "Text Asset" in `Nav Link`, `Table Head Cell` and the assists; "Title Text Asset" only in `Page Title`; the two footer actions of a card are "Action 1" and "Action 2". Setting `characters` on the inner TEXT node ("Label Text", "Text") changes the property too, but `setProperties` on the Asset is the rule. The same two text components serve every component of the library, which is why a component has no text property of its own.
2. **A plain TEXT layer** with no property: "Input Text" of the input assets, "Label Text" of `Form Label`, "Check Text" of the check assets, "Level 1" to "Level 4" and "Current" of the breadcrumbs, the labels of charts, pagination numbers, the datepicker, chat message text. Load its fonts, then set `characters`.
3. **A top-level TEXT property** of the component itself: `separator-text` of the breadcrumbs, `text` of `Expired Text Asset`, `title`, `details`, `subtitle` and `input` of the list items (through `_ List Asset`).

A role with none of the three means the component does not have it: choose another component or compose.

### Slots

Nineteen sets take their content in a native Figma slot: a child node of type `SLOT` with a property of type `SLOT` that has no value. `appendChild` to the slot node, remove its default children; `setProperties` does not accept it. A plain frame can go into a slot too.

| Set                                   | Slot                       |
| ------------------------------------- | -------------------------- |
| `Navbar`                              | `nav-links`                |
| `Nav Tabs`, `Nav Segments`            | `items`                    |
| `Button Group`                        | `Slot`                     |
| `Accordion`                           | `Items`                    |
| `Dropdown Menu`                       | `items`                    |
| `Dropdown Button`                     | `dropdown`                 |
| `Modal Window`                        | `modal-content`            |
| `Alert Window`, `Mobile Alert Window` | `slot`, `Slot`             |
| `Section Block`                       | `content`                  |
| `Page Title`                          | `actions`                  |
| `Table Row`                           | `columns`                  |
| `Data Table`                          | `table-head`, `table-body` |
| `Card Carousel`, `Small Carousel`     | `items`                    |
| `Tooltip`, `Rich Notification`        | `Slot`                     |
| `Basic Slot`                          | `Content`                  |

### Booleans

Boolean names are not uniform: `has-*` and `is-*` on buttons, cards, chips, navs and modals; bare `icon`, `help`, `label`, `assist`, `dropdown`, `mandatory`, `scrollbar` on the forms; `2nd-action`, `3rd-action`, `dismissible`, `expanded`, `show-menu` elsewhere. Find them by `type === 'BOOLEAN'`. Most default to `true`; the ones that default to `false` are `dropdown` and `scrollbar` on the forms, `has-slot`, `has-floating-close`, `has-bg`, `back-button`, `progress`, and `mandatory` on the check assets. A boolean that gates an icon has an INSTANCE_SWAP next to it (`has-icon-start` and `icon-start-instance`); set the swap for every boolean kept `true`. A nested Asset can carry booleans of its own that the parent's `componentProperties` does not list (`back-button` and `title-chip` on the `_ Large Title Asset` inside `Page Title`): read and subtract them on the nested instance.

### Variants

Variant props are lower-case `context`, `size`, `state`, `type`. A few sets use `semantic` instead of `context` (`Strip Badge`, `Common Avatar`, `Icon-Only Common Toggle`, `Mobile Icon-Button`), and the assets (`Rating`, `Switch`, `Scrollbar`, `Skeleton`, `Spinner`, the keyboards) capitalize theirs. `context` has eleven values: `default`, `alternate`, `primary`, `secondary`, `neutral`, `danger`, `success`, `warning`, `info`, `black`, `white`. `size` is `medium`, `large`, `small` on most sets, only `large` and `small` on `Alert Window`, `Modal Window`, `Navbar` and the carousels. `state` is `idle`, `disabled`, `hover`, `press` on buttons, `idle`, `disabled`, `focus`, `error`, `success` on inputs (`Form Check` adds `primary`), and includes `active` on nav items. `Form Check` writes `checked` as `True` and `False`.

### Instance swaps

`icon-start-instance`, `icon-end-instance`, `icon-instance`, `bg-instance`, `table-iInstance` (`Table Container`) and `icon-nstance` (`Outline Form Input`, `Nav Link`, `Table Data Cell`): the last two are misspelt in the library and are used as read. An INSTANCE_SWAP takes the `id` of a component imported into the file.

### Hidden layers

A hidden layer that a prop shows is set through the prop: `has-back-button` (modal headers), `back-button` (title assets). The `Smooth Chip` of the page title is the reverse, visible by default behind `title-chip` on the nested title Asset. Three hidden layers have no prop and stay hidden: "Asset 2" in `Table Head Cell`, "Separator" in `List footer`, "Common Background" in the cards.

The reverse case is a visible part the design does not show. A boolean turns it off where the component has one (subtract first). Where it has none, as with "Search Frame" and "Navbar Right" of `Navbar` or the pen icon after the subtitle of `Page Title`, set `visible = false` on that layer of the instance: the instance stays connected to the library and the override survives an update. Hide the smallest layer that holds the part, do it for every such part of the view and not for some, never detach for it, and name each hidden layer in the report.

## The pages and their components

Each line is a page of `cx.components.UI` with its public components and, in parentheses, the slot the set takes content in. Props are read from the component.

### Action pages

- **Button - Solid**, **Button - Smooth**, **Button - Outline**, **Button - Link** — `Solid Button` and `Solid Icon-Button`, `Smooth Button` and `Smooth Icon-Button`, `Outline Button` and `Outline Icon-Button`, `Link Button` and `Link Icon-Button`
- **Button Group** — `Button Group` (`Slot`), `Button Group Item`, `Icon-Button Group Item`, `Cart Button Group`
- **Floating Button** — `Floating Button`, `Floating Icon-Button`
- **Close Button** — `Close Button`
- **Toggle Button** — `Basic Common Toggle`, `Icon-Only Common Toggle`

### Form pages

- **Form - Regular** — `Regular Form Field`, `Regular Form Input`, `Form Label`, `Form Help`, `Regular Input Text Asset`, `Regular Input Textarea Asset`
- **Form - Floating** — `Floating Form Field`, `Floating Form Input`
- **Form - Outline** — `Outline Form Field`, `Outline Form Input`
- **Form Check** — `Form Check`, `Check Input`, `Card Check`
- **Dropdown** — `Dropdown Menu` (`items`), `Dropdown Item`, `Dropdown Button` (`dropdown`)
- **Datepicker** — `Date Picker`

### Navigation pages

- **Navbar** — `Navbar` (`nav-links`), `Nav Link`
- **Nav - Tab** — `Nav Tabs` (`items`), `Regular Nav Tab Item`, `Fancy Nav Tab Item`
- **Nav - Segment** — `Nav Segments` (`items`), `Nav Segment Item`
- **Breadcrumb** — `Large Breadcrumb`, `Small Breadcrumb`
- **Pagination** — `Simple Pagination`, `Advanced Pagination`, `Dot Pagination`, `Button Pagination`
- **Page Title** — `Page Title` (`actions`)

### Surface pages

- **Card** — `Full-bleed Card`, `Contained Card`
- **Section** — `Section Block` (`content`), `Section Header`, `Section Footer`, `Mobile Footer`
- **Accordion** — `Accordion` (`Items`), `Accordion Item`
- **Modal** — `Modal Window` (`modal-content`), `Modal Screen`
- **List** — `Common List Item`, `iOS List Item`, `List Header`, `List footer`, `List Event`, `List Swipe`
- **Carousel** — `Card Carousel` (`items`), `Small Carousel` (`items`), `Hero Carousel`

### Feedback pages

- **Alert** — `Alert Window` (`slot`), `Alert Screen`
- **Notification** — `Notification`, `Rich Notification` (`Slot`)
- **Tooltip** — `Tooltip` (`Slot`)
- **Progress** — `Large Chip Progress Flow`, `Small Chip Progress Flow`, `Large Thumb Progress Flow`, `Small Thumb Progress Flow`, `Thumb Progress Step`, `Chip Progress Step`, `Loading Indicator`, `Progress Bar - 10 Segments`, `Progress Bar - 12 Segments`, `Animated Progress Indicator`, `Mobile Progress Indicator`
- **Message** — `Chat Message`, `Message Form`, `Message Suggestions`, `Chat Status`

### Data pages

- **Table** — `Data Table` (`table-head`, `table-body`), `Table Row` (`columns`), `Table Head Cell`, `Table Data Cell`, `Table Input Cell`, `Table Container`, `Table Empty`
- **Badge** — `Solid Badge`, `Smooth Badge`, `Outline Badge`, `Strip Badge`, `Cap Badge`, `Ribbon Badge`, three store badges
- **Chip** — `Solid Chip`, `Smooth Chip`, `Outline Chip`
- **Chart** — `Bar Chart`, `Area Chart`, `Horizontal Bar Chart`, `Gauge Chart`, `Donut Chart` and their graphs; no line or pie chart
- **Comment** — `Comment Item`, `Comment Form`
- **Story** — `Story Button`, `Story Card`, `Story Carousel`
- **Map** — 29 map components

### Mobile pages

- **Mobile Alert** — `Mobile Alert Window` (`Slot`), `Mobile Alert Screen`
- **Mobile Button** — `Mobile Button`, `Mobile Icon-Button`, `Swipe Mobile Button`
- **Mobile Top Navigation** — `Mobile Top Navigation`, `Mobile Nav Control Bar`, `Mobile Nav Search Bar`, `Mobile Nav Segment Bar`, `Mobile Nav Tab Bar`, `Mobile Nav Chip Bar`, `Mobile Nav Trip Bar`, `Mobile Nav Calendar Bar`
- **Mobile Bottom Navigation** — `Mobile Bottom Navigation`
- **Mobile Section** — `Mobile Section Header`, `Mobile Section Footer`, `Mobile Section Block`
- **Mobile Sheet**, **Mobile Keyboard**, **Mobile System** — sheets, keyboards and system bars

### Asset pages

- **Text** — `Basic Text  Asset`, `Fill Text  Asset`, `Variable Text  Asset`, `Stack TTB Text Asset`, `Stack BTT Text Asset`, `Stack LTR Text Asset`, `Stack RTL Text Asset`, `Definition Horizontal Text Asset`, `Definition Vertical Text Asset`, `Expired Text Asset`, `Rotated Text Asset`, `Wrap Text Asset`
- **Slot** — `Basic Slot` (`Content`)
- **Icon** — 548 components: the single icons `<name>-solid`, `<name>-outline`, `<name>-brand` (`chevron-down-solid`, `xmark-large-solid`, `search-solid`), and the sets `Placeholder Icon`, `Library Icon`, `FA 6 Pro Icon`, `FA 6 Brands Icon`, `FA 6 Duotone Icon`, `FA 6 Free Icon`, `Material Icon`, `SF Pro Icon`. An icon is set through an `*-instance` prop or placed as an instance; the library has no other icon source
- **Image** — `Basic Placeholder`, `Aspect Ratio Image Placeholder`, `Basic Media Asset`
- **Avatar** — `Common Avatar`
- **Assist** — `Small Left Assist`, `Medium Left Assist`, `Large Left Assist` and the three `Right Assist`s
- **Background** — `Basic Separator Background`, `Common Background`, `Glass Background`, `Indicator Background`, `Tooltip Balloon Background`, `Message Balloon Background`
- **Logo** — `chassis-logo`; **App Icon** — `chassis-app-icon-square` and the other app icons
- **Rating** — `Stars Rating`, `Hearts Rating`; **Scrollbar** — `Horizontal Scrollbar`, `Vertical Scrollbar`
- **Skeleton** — `Text Skeleton Asset`, `Shape Skeleton Asset`; **Spinner** — five spinner sets
- **Switch** — `Basic Switch`, `Material Switch`, `Cupertino Switch`

## Composition

How the families that are built from several components fit together, one section per family, read for the families the view has. Props are named here only where the structure needs them.

### Buttons

The style is the component: `Solid Button` for the primary action, `Smooth Button` for a secondary one, `Outline Button` for a tertiary one, `Link Button` for an inline action; the `Icon-Button` of each style has no label. Mixing styles in one action row gives hierarchy (an outline Cancel next to a solid primary Save); mixing sizes does not and is not done. The label is "Label Frame" › "Label Asset" › "Label Text". A fresh button shows a start icon, a badge, a caret and an end icon, since `has-icon-start`, `has-badge`, `is-dropdown` and `has-icon-end` default to `true`; a plain button sets the four to `false`, and a button that keeps an icon sets its `icon-*-instance`. The contexts follow intent: `primary` for the main action, `default` for a neutral one, `danger` for a destructive one, `success` to confirm.

### Forms

Pick one style per form, `Regular`, `Floating` or `Outline`, and use its field for a labeled control: `Regular Form Field` holds "Field Label" (`Form Label`), "Field Input" (`Regular Form Input`) and "Field Help" (`Form Help`), gated by the booleans `label`, `help` and `dropdown`. The input's value is the plain layer "Input Text" inside "Content Frame" › "Input Asset" (`Regular Input Text Asset`), which has the variant `placeholder` (`true` or `false`); the label is the plain layer "Label Text" of `Form Label`; the help or validation message is the "Help Asset" of `Form Help`, shown with the input's `state` (`error`, `success`). The bare `Regular Form Input` goes where the label and help are handled elsewhere: a search input in a navbar, a toolbar, an inline filter; a table cell takes `Table Input Cell`. `Form Check` wraps `Check Input` for a checkbox, radio or indeterminate (`type`), with the plain layer "Check Text" and the boolean `help`; `Card Check` is a selectable card. Switches are the assets `Basic Switch`, `Material Switch` and `Cupertino Switch`. The forms name their booleans bare (`icon`, `help`, `label`, `mandatory`) and two of them default to `false` (`dropdown`, `scrollbar`).

### Tables

A table is library components in slots, nothing is turned into a component: `Data Table` holds a `Table Row` of `type=head` in its `table-head` slot and `Table Row`s of `type` `odd`, `even`, `hover`, `active` or `edit` in `table-body`; each row holds its cells in its `columns` slot: `Table Head Cell` (variants `checkbox` and `filtering`, booleans `has-sorting` and `has-input`, the text in "Text Asset") or `Table Data Cell` (`type` `basic`, `form`, `button`, `icon`, `badge`, `option`, `custom`). `Table Container` wraps a table with a search, a pager and a header; `Table Empty` is the empty state.

### Navigation

`Navbar` (`size` `large` or `small`, boolean `expanded`) carries the brand as `chassis-logo` in "Logo Frame", with no swap, slot or text for a product name (a name as text is Blocked), and holds `Nav Link`s in its `nav-links` slot; a nav link has "Text Asset" and the booleans `has-text`, `has-icon`, `has-badge`, `is-dropdown`; a search field in the navbar is a bare `Regular Form Input`. `Nav Tabs` (`variant` `top`, `bottom`, `fancy`) holds `Regular Nav Tab Item`s or `Fancy Nav Tab Item`s in `items`, each with "Label Asset", `is-active` and the icon and badge booleans. `Nav Segments` holds `Nav Segment Item`s in `items`. The breadcrumbs carry their levels as plain text layers and the separator as a top-level TEXT property. `Page Title` takes its action buttons in `actions`.

### Cards

`Full-bleed Card` and `Contained Card` gate their parts with `has-header`, `has-footer`, `has-category`, `has-body`, `has-image`, place the image with `orientation` (`top`, `bottom`, `left`, `right`) and hold their text in "Category Asset", "Title Asset" and "Body Asset", styled with `font/context/label/medium`, `font/context/title/medium` and `font/context/body/medium`. The image is "Media Placeholder", a `Basic Media Asset` holding a `Basic Placeholder`; the footer actions are "Action 1" and "Action 2". Cards have `size` and no `context`.

### Dialogs and messages

`Modal Window` (`size` `small` or `large`, `is-full-screen`, `has-header`, `has-footer`, `has-floating-close`) takes its body in the `modal-content` slot; its header has "Title Asset", "Subtitle Asset" and a back button behind `has-back-button`; `Modal Screen` puts it on a backdrop. `Alert Window` is a confirm dialog, not an inline message: "Title Asset", "Body Asset", up to three buttons (`2nd-action`, `3rd-action`), `has-icon`, `context` `default` or `danger`, an optional slot behind `has-slot`; `Alert Screen` puts it on a backdrop. The inline message is `Notification` (an icon, a text, up to two actions, `dismissible`, `context` × `style` `solid` or `basic`), or `Rich Notification` with a title and a slot. `Tooltip` has `has-title` and a slot. The library has no toast.

### Sections and layout

`Section Block` (`style` `basic`, `bordered`, `elevated`; `has-header`, `has-footer`, `has-seperator` as the library spells it) takes its content in `content`, with `Section Header` and `Section Footer`. `Accordion` holds `Accordion Item`s (`is-expanded`, "Title Asset") in `Items`. `Dropdown Menu` (`type` `basic` or `searchable`) holds `Dropdown Item`s (`type` `action`, `header`, `separator`) in `items`, and `Dropdown Button` holds a menu in `dropdown`. `Button Group` holds `Button Group Item`s in `Slot`. `Basic Slot` is a bare slot container with a `direction`. A layout frame of the agent's own (the wrapper, a section container, a row) is an auto-layout frame with its padding, gap, fill and radius bound to context tokens.
