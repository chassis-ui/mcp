# Component Slug → Figma File Key Map

Canonical mapping between Chassis component slugs and the **Figma `fileKey`** that hosts each component's source-of-truth file.

> **Important distinction**
>
> - **`fileKey`** — the `xxxxxxxx` segment in `figma.com/design/<fileKey>/<file-name>`. Identifies the **file** that owns the component. Stable, listed below.
> - **`componentKey`** — a per-published-component identifier returned by the Figma API (`GET /v1/files/:key/components`) or visible via `get_metadata`. Required for `import_components` calls. **Not stored statically** — resolve at runtime from the `fileKey` below.
>
> If you need a `componentKey`, take the `fileKey` from this table, call `get_metadata` (or the Figma REST endpoint) on that file, and look up the component by name.

## Resolution procedure

```text
1. User mentions component family (e.g., "navbar", "modal")
2. Look up slug in the table → fileKey
3. Call get_metadata(fileKey) → list of published components with their componentKeys
4. Match by component name + variant set → componentKey
5. Pass componentKey to use_figma / import_components
```

## Slug → fileKey table

### Actions

| Slug              | fileKey                  |
| ----------------- | ------------------------ |
| `button-solid`    | `NAmGtSx4GjBbLYJc9616O7` |
| `button-smooth`   | `erBwnRs1SpZRCTm6oiiOTv` |
| `button-outline`  | `hhpQVuwDVvEheegfBcztWh` |
| `button-link`     | `J7aF2zeYNFBILsufGPDsbc` |
| `button-group`    | `BbiYbLsNN9t2WQZ6qA7ysR` |
| `button-mobile`   | `RVfehvFoxKKSPnN32WGPJd` |
| `close-button`    | `yO0zpHJQGuWVqnHA9YhRNB` |
| `floating-button` | `inAGhi76bgcUXchfDHa4Wg` |
| `toggle-button`   | `LTDfhQG0vX9XGzSrDHMT65` |

### Forms

| Slug            | fileKey                  |
| --------------- | ------------------------ |
| `form-regular`  | `DrLh8nepRyFEIintLil7LO` |
| `form-floating` | `vp376sNUX96hxaQMRfXegy` |
| `form-outline`  | `nv1yV59dXHKXniJNkSGfGw` |
| `form-check`    | `8ncAnmXmhL1aYegPduKB3N` |

### Selection menus

| Slug          | fileKey                  |
| ------------- | ------------------------ |
| `dropdown`    | `C2b4WDjevEFhFVc7WfVIsN` |
| `date-picker` | `aopn74YwQWPCEhYyoRo76n` |

### Navigation

| Slug                | fileKey                  |
| ------------------- | ------------------------ |
| `navbar`            | `GmyFFZRcX5WCc7Z41JIfD1` |
| `breadcrumb`        | `RiP4SGUrvZgwy7rqqF3PDw` |
| `tab`               | `Ld36YyyH60ief8atDSOAaa` |
| `pagination`        | `CFCqpzdKCqVL50WeUTg2aY` |
| `mobile-nav-top`    | `zAz8Nit0WEF7sh6QQSA3U9` |
| `mobile-nav-bottom` | `3DakJklALL9fZd2UVqYYji` |

### Surfaces

| Slug             | fileKey                  |
| ---------------- | ------------------------ |
| `card`           | `qBUuNMa9xwk281hyXYXIiH` |
| `modal`          | `FORPaujQ0eXzpHJNcFXm37` |
| `accordion`      | `OiVphIikHzUeicbtSChwpj` |
| `section`        | `L6YQHTsdhuwCqQ1z0mPqAy` |
| `section-mobile` | `CZ573MdkuN5jpdYapYwTER` |
| `sheet-mobile`   | `L7lDYsLrUxDd7txBcFykL7` |
| `page`           | `uQIH9wkT0tNZpOdja0fWJi` |
| `page-title`     | `Uw8NfWqTT4qo457Itrlm4J` |
| `story`          | `1lJX7ReYOsFfmDo2l8H9zt` |

### Feedback

| Slug           | fileKey                  |
| -------------- | ------------------------ |
| `alert`        | `yimDH05VyfI8IAA2NVhnfR` |
| `mobile-alert` | `vrIWIH5Wkqyrl11m4M2kGT` |
| `notification` | `5IGX2heRAFnMLv8hjkxxwQ` |
| `message`      | `HqWNdAQFcpZempEerwe7ZK` |
| `tooltip`      | `cxeevgv0srE4nFogUWdMl6` |
| `progress`     | `6akLgKMM0OUoeEqQDMfPHs` |
| `badge`        | `bbIiF7Z7E9syMAihomDMfO` |
| `chip`         | `fV5JYWBQEl6dK2D3l0yBA8` |

### Data

| Slug       | fileKey                  |
| ---------- | ------------------------ |
| `table`    | `XMdjjBOCFSDbzPJhbctraL` |
| `list`     | `S6hIiwi8s2SCf47pMNHT3p` |
| `chart`    | `9aeFnehkQh6AUCihXComRb` |
| `carousel` | `VXyhXvdD8LSPoHbuQW5FWF` |
| `map`      | `joJfjGVV5gxcdm12vrjIqZ` |

### Communication / Misc

| Slug            | fileKey                  |
| --------------- | ------------------------ |
| `comment`       | `uEP6GSI4w8jHjxAlMP4wL2` |
| `keyboard`      | `NiKThsOWjaF9DsKRyQOSfE` |
| `system-mobile` | `uT8WqT1VcJXom0LrNrBZup` |

## Source of truth

This table mirrors `chassis-figma/.github/skills/sync-figma-docs/figma-file-mapping.json`. If components are added, removed, or moved, update both files together.

## What to do when a slug is missing

1. Confirm the component family exists in [components.md](./components.md) — if not, it isn't part of the Chassis library yet. Stop and report blocked.
2. If the component exists but has no slug here, check `chassis-figma/.github/skills/sync-figma-docs/figma-file-mapping.json` for newer entries.
3. As a last resort, ask the user for the file URL and extract the `fileKey` from the URL path.
