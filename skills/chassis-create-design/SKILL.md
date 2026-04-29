---
name: chassis-create-design
description: Use this skill on top of figma-use and figma-generate-design when the task involves creating a brand new design in Figma or translating an application page, view, or multi-section layout into Figma.This is the preferred workflow skill whenever the user wants to build or update a full page, modal, dialog, drawer, sidebar, panel, or any composed multi-section view in Figma from code or a description. Discovers design system components, variables, and styles from Code Connect files, existing screens, and library search, then imports them and assembles views incrementally section-by-section using design system tokens instead of hardcoded values.
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

## Color Variables

Chassis uses a context based color palette system for common color needs of UI design. The palette is built on top of a set of primitive color variables that represent the brand identity. 

Color variables are named using the pattern `color/context/{context}/{role}-{emphasis}`. For example, `color/context/default/fg-main` or `color/context/primary/fg-subtle`. When building or updating screens, identify opportunities to use these color variables instead of hardcoding specific colors. This will ensure that your design remains flexible and can easily adapt to theme changes or different contexts without needing to manually update each instance of a color.

### Contexts

- `default`: for general UI elements that do not fall into a specific context. This is the most commonly used context for standard UI components and elements. Default colors are inverted between light and dark mode, so they adapt to the theme automatically.
- `alternate`: for elements that require an alternative color scheme, such as distinct sections or components that need to stand out from the default context. Alternate colors may not be inverted between light and dark mode, so they can provide a consistent appearance regardless of the theme.
- `primary`: for primary actions and highlights
- `secondary`: for secondary actions and highlights
- `success`: for success states and messages
- `error`: for error states and messages
- `warning`: for warning states and messages
- `info`: for informational states and messages
- `black`: for black and near-black colors used in the design, persistent across themes
- `white`: for white and near-white colors used in the design, persistent across themes

### Roles with Emphasis Levels

These roles represent common use cases for colors in UI design, and the emphasis levels indicate the intended visual prominence of the color

#### Base Colors

Context base colors and their counterparts.

- `base-color`: the core color for the context, used for backgrounds, fills, and large areas of color
- `contrast-color`: a color that provides sufficient contrast against the base color, used for text and elements that need to stand out against the base color
- `transparent-color`: a fully transparent color that can be used for gradients, effects, overlays, or when a color variable is required but no visible color is desired

#### Foreground (`fg`) Colors

Text colors named by priority or functionality. These colors are used for more than just text, adhering to abstraction principles. Utilized for the color property.

- `fg-main`: the primary color for texts, with the highest contrast against the background
- `fg-subtle`: a secondary color for texts, with less contrast than `fg-main`, used for less prominent elements
- `fg-slight`: a tertiary color for texts, with even less contrast than `fg-subtle`, used for the least prominent or disabled elements
- `fg-inverse`: a color that is the inverse of the main foreground color, companion to `bg-inverse` for use on inverse backgrounds
- `fg-solid`: a color that used for solid elements like button text, companion to `bg-solid` for use on solid backgrounds
- `fg-highlight`: a color used for highlights, accents, or interactive elements that need to draw attention

#### Background (`bg`) Colors

Solid colors for backgrounds, named by priority and functionality. 

- `bg-main`: the primary background color for surfaces and large areas
- `bg-even`: a background color for slightly shaded surfaces, used to create visual separation between sections or elements without strong contrast
- `bg-evident`: a background color for highly evident surfaces, used to create strong visual separation or highlight important sections
- `bg-inverse`: a color that is the inverse of the main background color, companion to `fg-inverse` for use with inverse foregrounds
- `bg-solid`: a color that is used for solid elements like buttons, companion to `fg-solid` for use with solid foregrounds
- `bg-highlight`: a color used for highlights, accents, or interactive elements that need to draw attention, companion to `fg-highlight` for use with highlight foregrounds

### Border Colors

Colors for object borders and separator lines.

- `border-main`: the primary border color, used for prominent borders and separators, rarely used in UI and components
- `border-subtle`: a secondary border color, used for less prominent borders and separators, commonly used in UI and components

### Icon Colors

Colors for symbolic elements, such as icons, list bullets and detail arrows.

- `icon-main`: the primary icon color, used for icons that need to stand out and be easily recognizable
- `icon-subtle`: a secondary icon color, used for icons that are less prominent or need to blend more with the text and background
- `icon-slight`: a tertiary icon color, used for icons that are the least prominent or need to be very subtle in the design, such as disabled elements

### Cue Colors

Colors for activity or selection indicators.

- `cue-main`: the primary cue color, used for active states, selection indicators, or elements that need to draw attention to indicate interactivity or status
- `cue-subtle`: a secondary cue color, used for less prominent or disabled active states, selection indicators, or elements that need to draw less attention

### Dim Colors

Background colors with variable opacity for use in overlays, modals, and other layered elements.

- `dim-main`: a color used for dimming the background, typically for modal backdrops or overlays.
- `dim-subtle`: a lighter color used for dimming the background, typically use with background blur effects to create a softer dimming effect.
- `dim-slight`: a very light color used for dimming the background, for blending with the background and creating a subtle difference without a strong overlay effect.

### Link Colors

Colors for anchor elements, including all possible states.

- `link-main`: the primary link color, used for standard links in their default state
- `link-hover`: the link color used when a user hovers over a link, providing visual feedback for interactivity
- `link-active`: the link color used when a link is active or being clicked, providing visual feedback for the active state
- `link-visited`: the link color used for links that have been visited, providing a visual distinction between visited and unvisited links

## Text Styles

Chassis uses a set of predefined text styles for consistent typography across the design. When building or updating screens, identify opportunities to use these text styles instead of hardcoding font properties. This will ensure that your design remains consistent and can easily adapt to changes in typography without needing to manually update each instance.

Text styles are named using the pattern `font/{family}/{size}/{weight}`. For example, `font/text/medium/normal` or `font/display/large/strong`. When applying text styles, make sure to choose the appropriate style that matches the intended use case and hierarchy of the text in your design.

### Font Families

- `text`: a versatile font family used for body text, labels, and general-purpose typography
- `display`: a font family used for headings, titles, and other prominent text elements that need to stand out
- `html`: a font family used for simulating HTML content, such as Headings, blockquotes, lists, and other structured text elements (rarely used in UI, more for documentation or content design)
- `code`: a monospaced font family used for code snippets, technical text, or any content that benefits from a fixed-width typeface

### Font Sizes

- `2xsmall`: a double extra-small font size used for very fine print, disclaimers, or extremely secondary information (rarely used in UI, more for legal or regulatory text)
- `xsmall`: an extra-small font size used for fine print, disclaimers, or very secondary information
- `small`: a smaller font size used for secondary text, captions, or less prominent information
- `medium`: a medium font size used for standard body text, labels, and general-purpose typography (standard size for most UI text elements)
- `large`: a larger font size used text that needs to stand out
- `xlarge`: an extra-large font size used for text that needs to stand out slightly more than the standard large size, such as subheadings or important labels
- `2xlarge`: a double extra-large font size used for text that needs to be very prominent, such as section heading, or any text that needs to draw significant attention
- `3xlarge`: a triple extra-large font size used for text that needs to be very prominent, such as main headings, hero sections, or any text that needs to draw significant attention
- `4xlarge`: a quadruple extra-large font size used for dashboards, hero sections, or any text that needs to be extremely prominent
- `5xlarge`: a quintuple extra-large font size used for dashboards, hero sections, or any text that needs to be extremely prominent

** Why so much larger sizes than typical? **

Chassis is designed to be adaptable to a wide range of design needs, including dashboards, hero sections, and other use cases that may require very large text sizes. By providing a range of larger font sizes, we can accommodate designs that need to make a strong visual impact or convey a sense of importance and hierarchy. These larger sizes allow designers to create bold and attention-grabbing typography that can effectively communicate the intended message and enhance the overall user experience.

### Font Weights

- `normal`: a normal font weight used for standard text elements, providing a balanced and readable appearance
- `strong`: a strong font weight used for text that needs to stand out slightly more than normal
- `mass`: a heavy font weight used for text that needs to be very prominent, such as headings or important labels
- `elegant`: an elegant font weight used for text that needs to be very prominent and convey a sense of sophistication, such as main headings or hero sections

** Why non-standard weight names? **

Chassis is designed to be themeable and adaptable to different brand identities. By using descriptive weight names like `strong`, `mass`, and `elegant`, we can provide more meaningful options for designers to choose from that go beyond the traditional numeric weight values. While a brand may use 700 for `strong` and 900 for `mass`, another brand may use 500 for `strong` and 700 for `mass`. The descriptive names allow for flexibility in mapping to different font weight values while still conveying the intended visual hierarchy and emphasis without confusing designers with specific numeric values that may not be consistent across different fonts or brands.

## Spacing Variables

Chassis uses 2 set of spacing variables: `space/context/{context}` for standardized spacing values based on common use cases, and `space/unit/{unit}` for a more granular scale of spacing values that can be used for any purpose.

### Context-Based Spacing

- `zero`: a zero spacing value used for no space between elements (e.g., 0px)
- `4xsmall`: a quadruple extra-small spacing value used for extremely tight spacing, such as between closely related elements or in compact components (e.g., 1px)
- `3xsmall`: a triple extra-small spacing value used for extremely tight spacing, such as between closely related elements or in compact components (e.g., 2px)
- `2xsmall`: a double extra-small spacing value used for very tight spacing, such as between closely related elements or in compact components (e.g., 4px)
- `xsmall`: an extra-small spacing value used for tight spacing, such as between related elements or in compact components (e.g., 8px)
- `small`: a small spacing value used for standard spacing between elements, such as between form fields, buttons, or list items (e.g., 12px)
- `medium`: a medium spacing value used for slightly larger spacing between elements, such as between sections, groups of components, or in more spacious layouts (e.g., 16px)
- `large`: a large spacing value used for significant spacing between elements, such as between major sections, or in very spacious layouts (e.g., 20px)
- `xlarge`: an extra-large spacing value used for very significant spacing between elements, such as between major sections in a dashboard or hero layout (e.g., 24px)
- `2xlarge`: a double extra-large spacing value used for extremely significant spacing between elements, such as between major sections in a dashboard or hero layout (e.g., 28px)
- `3xlarge`: a triple extra-large spacing value used for extremely significant spacing between elements, such as between major sections in a dashboard or hero layout (e.g., 32px)
- `4xlarge`: a quadruple extra-large spacing value used for extremely significant spacing between elements, such as between major sections in a dashboard or hero layout (e.g., 36px)
- `5xlarge`: a quintuple extra-large spacing value used for extremely significant spacing between elements, such as between major sections in a dashboard or hero layout (e.g., 40px)
- `6xlarge`: a sextuple extra-large spacing value used for extremely significant spacing between elements, such as between major sections in a dashboard or hero layout (e.g., 48px)

Prefer to use context-based spacing values when the spacing serves a common use case that can be standardized across the design. This will help maintain consistency and make it easier to adjust spacing across the design by simply updating the variable values. Use unit-based spacing for more specific or unique spacing needs that do not fit into the standardized context categories, allowing for greater flexibility in design while still adhering to a consistent scale of spacing values.

### Unit-Based Spacing

Unit based spacing variables start 0 and increase in increments of 2px (increments of 4px and 8px depending on the value of previous spacing in higher ranges), providing a granular scale of spacing values that can be used for any purpose.

Prefer to the unit-based spacing variables when you need a specific spacing value that may not fit into the standardized context categories, or when you want to maintain a consistent scale of spacing values across your design. The unit-based spacing variables allow for greater flexibility in design while still adhering to a consistent scale of spacing values, making it easier to create custom layouts and designs that require specific spacing needs.

## Sizing Variables

Chassis uses 2 set of sizing variables: `size/context/{context}` for standardized sizing values based on common use cases, and `size/unit/{unit}` for a more granular scale of sizing values that can be used for any purpose.

### Context-Based Sizing

- `2xsmall`: a double extra-small size value used for very small components or elements, such as icons, buttons, or form fields (e.g., 16px)
- `xsmall`: an extra-small size value used for very small components or elements, such as icons, buttons, or form fields (e.g., 24px)
- `small`: a small size value used for small components or elements, such as icons, buttons, or form fields (e.g., 32px)
- `medium`: a medium size value used for standard components or elements, such as buttons, or form fields (e.g., 40)
- `large`: a large size value used for larger components or elements, such as icons, buttons, or form fields (e.g., 48px)
- `xlarge`: an extra-large size value used for very large components or elements, such as icons, buttons, or form fields (e.g., 56px)
- `2xlarge`: a double extra-large size value used for extremely large components or elements, such as icons, buttons, or form fields (e.g., 64px)

### Unit-Based Sizing

Unit based sizing variables start 0 and increase in increments of 4px (increments of 4px and 8px depending on the value of previous spacing in higher ranges), providing a granular scale of sizing values that can be used for any purpose.

## Border Radius Variables

Chassis uses a set of border radius variables for consistent corner rounding across the design. Naming follows the pattern `borderRadius/context/{context}`.

- `zero`: a border radius value of 0 used for sharp corners (e.g., 0px)
- `2xsmall`: a double extra-small border radius value used for slightly rounded corners, such as on buttons or cards (e.g., 2px)
- `xsmall`: an extra-small border radius value used for slightly rounded corners, such as on buttons or cards (e.g., 2px)
- `small`: a small border radius value used for moderately rounded corners, such as on buttons, cards, or form fields (e.g., 4px)
- `medium`: a medium border radius value used for more rounded corners, such as on buttons, cards, or form fields (e.g., 8px)
- `large`: a large border radius value used for very rounded corners, such as on buttons, cards, or form fields (e.g., 12px)
- `xlarge`: an extra-large border radius value used for extremely rounded corners, such as on buttons, cards, or form fields (e.g., 16px)
- `2xlarge`: a double extra-large border radius value used for extremely rounded corners, such as on buttons, cards, or form fields (e.g., 20px)
- `3xlarge`: a triple extra-large border radius value used for extremely rounded corners, such as on buttons, cards, or form fields (e.g., 24px)
- `round`: a border radius value used for fully rounded corners, such as on circular buttons, avatars, or pills (e.g., 9999px)

## Border Width Variables

Chassis uses a set of border width variables for consistent border thickness across the design. Naming follows the pattern `borderWidth/context/{context}`.

- `zero`: a border width value of 0 used for no borders (e.g., 0px)
- `small`: a small border width value used for thin borders, such as on cards, form fields, or dividers (e.g., 0.5px)
- `medium`: a medium border width value used for standard borders, such as on cards, form fields, or dividers (e.g., 1px)
- `large`: a large border width value used for thick borders, such as on cards, form fields, or dividers (e.g., 1.5px)
- `xlarge`: an extra-large border width value used for very thick borders, such as on cards, form fields, or dividers (e.g., 2px)
- `2xlarge`: a double extra-large border width value used for extremely thick borders, such as on cards, form fields, or dividers (e.g., 4px)

## Opacity Variables

Chassis uses 2 set of opacity variables: `opacity/context/{context}` for standardized opacity values based on common use cases, and `opacity/level/{level}` for a more granular scale of opacity values that can be used for any purpose.

### Context-Based Opacity

- `fg-subtle`: an opacity value used for subtle foreground elements, such as secondary text.
- `fg-slight`: an opacity value used for slight foreground elements, such as disabled text.
- `border-main`: an opacity value used for borders, such as on form fields and outlined elements.
- `border-subtle`: an opacity value used for slight borders, such as cards and dividers.
- `icon-subtle`: an opacity value used for subtle icons, such as secondary icons.
- `icon-slight`: an opacity value used for slight icons, such as disabled icons.
- `cue-subtle`: an opacity value used for subtle cues, such as disabled active states or selection indicators.
- `dim-main`: an opacity value used for dimming the background, typically for modal backdrops or overlays.
- `dim-subtle`: an opacity value used for dimming the background, typically for modal backdrops or overlays with background blur effects to create a softer dimming effect.
- `dim-slight`: an opacity value used for dimming the background, typically for modal backdrops or overlays with background blur effects to create a subtle dimming effect.

### Level-Based Opacity
- `transparent`: an opacity value of 0 used for fully transparent elements (e.g., 0%)
- `05`: an opacity value of 0.05 used for very subtle elements, such as light backgrounds or faint borders (e.g., 5%)
- `10`: an opacity value of 0.1 used for subtle elements, such as light backgrounds or faint borders (e.g., 10%)
- `20`: an opacity value of 0.2 used for slightly more visible elements, such as backgrounds or borders that need to be
- `90`: an opacity value of 0.9 used for nearly opaque elements, such as dark backgrounds or strong overlays (e.g., 90%)
- `95`: an opacity value of 0.95 used for nearly opaque elements, such as dark backgrounds or strong overlays (e.g., 95%)
- `solid`: an opacity value of 1 used for fully opaque elements (e.g., 100%)

Opacity variables scales between 10 and 90 in increments of 10, with additional values for very subtle (5%), fully transparent (0%), and fully opaque (100%) elements. Prefer to use context-based opacity values when the opacity serves a common use case that can be standardized across the design. This will help maintain consistency and make it easier to adjust opacity across the design by simply updating the variable values. Use level-based opacity for more specific or unique opacity needs that do not fit into the standardized context categories, allowing for greater flexibility in design while still adhering to a consistent scale of opacity values.

## Using Buttons

Chassis have multiple component sets for buttons, each with different use cases and levels of flexibility. When building or updating screens, identify which button component set is most appropriate for the intended use case and design needs.

- Solid Buttton: use for standard buttons with a solid background, such as primary actions. These buttons typically have a `bg-solid` background color and `fg-solid` text color.
- Smooth Button: use for buttons with a subtle background, such as secondary actions. These buttons typically have a `bg-highlight` background color and `fg-highlight` text color.
- Outline Button: use for buttons with prominent border and no background, such as tertiary actions. These buttons typically have a `border-main` border color and `fg-main` text color.
- Link Button: use for buttons that need to look like links, such as inline actions. These buttons typically have a `transparent` background and `link-main` text color.

All button components have content (see context colors) and size variants, so choose the appropriate variant based on the intended use case and design needs. Default use case is using primary variant for primary actions and default variant for secondary actions. You can mix button types to create a clear visual hierarchy of actions in your design. Never mix size variants within the same action group or section, to maintain visual consistency.


## Using Forms

### Form Inputs and Form Fields

Chassis has 3 set of form components for common form fields. When building or updating screens, identify which form component set is most appropriate for the intended use case and design needs.

- Regular Forms: standard form fields, such as text inputs, dropdowns, and checkboxes.
- Floating Forms: material design-inspired form fields with floating labels, such as text inputs and dropdowns.
- Outlined Forms: material design-inspired form fields with prominent borders and no background, such as text inputs and dropdowns.

### Form Checkboxes and Radio Buttons

Use Form Check component for checkboxes and radio buttons. These components have variants for different states (default, hover, active, disabled) and types (checkbox, radio). Choose the appropriate variant based on the intended use case and design needs.


## Using Tables

Chassis has "Table Data Cell" and "Table Head Cell" components for building tables. These components have variants for content types (text, form, button, icon, badge, etc.). Use these components to build table-row component first. Then, use the table-row component to build the full table. This will ensure that your table design remains consistent and adheres to the design system standards.

Table row components must have at least 2 variants


## Writing Rules

- Use the **Asset layer override pattern** for all text content — never assume a top-level text property exists.
- Prefer `componentKey` over component name when importing.
- Do not reveal hidden sub-layers unless the use case explicitly requires them.
- Preserve `x`, `y`, width, and height explicitly when replacing inside non-auto-layout parents.
- Do not convert frames to auto-layout unless the user requests structural cleanup.
- Do not use the deprecated `Dropdown Button @ 0.2` — use `Dropdown Button` (`b5c9294f0d6576fd0dbc60c4bcb3feae193f3b18`) instead.
- Work one section at a time. Never rewrite an entire screen in a single script.


## Deliverable Format

When closing the task, report:

- **Built**: new sections or screens created using library components
- **Swapped**: sections replaced directly with library instances
- **Composed**: sections rebuilt from library primitives
- **Already connected**: sections that were already valid library instances
- **Blocked**: sections that could not be connected — include the exact failure mode

If everything is blocked, state that plainly with the specific failure reason.
