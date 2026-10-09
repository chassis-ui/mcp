# Plugin API recipes for the Chassis library

Each recipe once, in the call shapes of today's tools. The snippets run in `use_figma`; every key, id and property key in capital letters is a placeholder resolved earlier in the same session ([components.md → Finding a component](./components.md#finding-a-component)), never a literal from a note or another file. No state survives between calls: paste ids as string literals, and include the `loadFontsOf` helper in every script that appends an instance or edits text. Every script returns the ids it created or changed.

## Fonts

The family of every text node is a `brand` variable, so it is read from the node, never written. An instance appended to an auto-layout frame, a `characters` change and a text style all need the fonts of the text nodes loaded first:

```js
async function loadFontsOf(node) {
  const texts = node.type === 'TEXT' ? [node] : node.findAllWithCriteria({ types: ['TEXT'] })
  const fonts = new Set()
  for (const text of texts) {
    for (const segment of text.getStyledTextSegments(['fontName'])) fonts.add(JSON.stringify(segment.fontName))
  }
  await Promise.all([...fonts].map((font) => figma.loadFontAsync(JSON.parse(font))))
}
```

Skipping it throws `in appendChild: unloaded font "Open Sans Regular"` (the family depends on the file), and the half-placed instance stays on the page: remove it before the retry.

## Inspect a component

Once per component and session, read-only: the props by type, the Assets, the slots and the plain text layers. The temporary instance is removed.

```js
const set = await figma.importComponentSetByKeyAsync('SET_KEY') // importComponentByKeyAsync('COMPONENT_KEY') for assetType "component"
const source = set.type === 'COMPONENT_SET' ? set.defaultVariant : set
const definitions = Object.entries(set.componentPropertyDefinitions).map(([key, d]) => ({
  key, type: d.type, defaultValue: d.defaultValue, options: d.variantOptions
}))
const tmp = source.createInstance()
const nested = tmp.findAllWithCriteria({ types: ['INSTANCE'] })
const result = {
  name: set.name,
  definitions,
  assets: nested.filter((n) => n.name.endsWith(' Asset')).map((n) => ({
    name: n.name,
    textKey: Object.keys(n.componentProperties).find((k) => n.componentProperties[k].type === 'TEXT') ?? null
  })),
  slots: tmp.findAll((n) => n.type === 'SLOT').map((n) => n.name),
  plainText: tmp.findAllWithCriteria({ types: ['TEXT'] })
    .filter((n) => !n.parent || !n.parent.name.endsWith(' Asset'))
    .map((n) => n.name)
}
tmp.remove()
return result
```

`componentPropertyDefinitions` is read on the set, or on a lone component; on a variant it throws. The keys come back as the library has them, `has-badge#20:26`, `text#142:1`, `context`: use them as read.

## Insert an instance

The order matters: import, variants, fonts, append, booleans, swaps, text, slots, sizing.

```js
const [wrapper, buttonSet, icon] = await Promise.all([
  figma.getNodeByIdAsync('WRAPPER_ID'),
  figma.importComponentSetByKeyAsync('BUTTON_SET_KEY'),
  figma.importComponentByKeyAsync('ICON_COMPONENT_KEY') // for the instance swap below
])
const button = buttonSet.defaultVariant.createInstance()
button.setProperties({ context: 'primary', size: 'large' }) // variants by bare name
await loadFontsOf(button) // before appendChild
wrapper.appendChild(button)

// Subtract: every boolean off except the ones the design keeps
const props = button.componentProperties
const keep = ['has-icon-start']
const off = Object.fromEntries(
  Object.keys(props)
    .filter((k) => props[k].type === 'BOOLEAN' && !keep.some((name) => k.startsWith(name + '#')))
    .map((k) => [k, false])
)
button.setProperties(off)

// An instance swap takes the id of a component imported into the file
const swapKey = Object.keys(props).find((k) => k.startsWith('icon-start-instance#'))
button.setProperties({ [swapKey]: icon.id })

// FILL only where the design fills (a section, a field, a table), after appendChild
// button.layoutSizingHorizontal = 'FILL'
return { createdNodeIds: [button.id] }
```

A button, badge, chip or text hugs its content; a section, a field or a table fills its container. `layoutSizingHorizontal = 'FILL'` is rejected with an error on a node that is not yet the child of an auto-layout frame.

## Set text

On a text Asset, through its TEXT property; on a plain layer, through `characters`. Both after the fonts.

```js
const textKey = (instance) =>
  Object.keys(instance.componentProperties).find((k) => instance.componentProperties[k].type === 'TEXT')

// A nested Asset ("Label Asset", "Title Asset", "Body Asset", "Help Asset", "Text Asset")
const label = button.findAllWithCriteria({ types: ['INSTANCE'] }).find((n) => n.name === 'Label Asset')
await loadFontsOf(label)
label.setProperties({ [textKey(label)]: 'Save' })

// A plain text layer (form labels, input text, check labels, breadcrumb levels)
const labelText = field.findAllWithCriteria({ types: ['TEXT'] }).find((n) => n.name === 'Label Text')
await loadFontsOf(labelText)
labelText.characters = 'Email'
```

`setProperties({ text: 'Save' })` without the `#id` throws `Could not find a component property with name: 'text'`. A text property the parent does not have is not guessed: the inspection says which Asset holds the role.

## Standalone text

Any text that is not inside a component is an instance of `Basic Text  Asset` (found with the query "Basic Text Asset", `assetType` `component`), never `figma.createText()`:

```js
const [parent, textAsset, style] = await Promise.all([
  figma.getNodeByIdAsync('PARENT_ID'),
  figma.importComponentByKeyAsync('BASIC_TEXT_ASSET_KEY'),
  figma.importStyleByKeyAsync('TEXT_STYLE_KEY') // for example font/context/title/medium
])
const text = textAsset.createInstance()
text.setProperties({ [textKey(text)]: 'Your order is on its way' }) // textKey as in "Set text"
await loadFontsOf(text)
parent.appendChild(text)
// The style goes on the inner TEXT node, the property stays on the instance
const inner = text.findAllWithCriteria({ types: ['TEXT'] })[0]
await figma.loadFontAsync(style.fontName)
await inner.setTextStyleIdAsync(style.id)
return { createdNodeIds: [text.id] }
```

The instance comes with `font/text/medium/normal` and its fill bound to `color/context/default/fg-main`; a title, label or body takes a `font/context/*` style ([tokens.md → Text styles](./tokens.md#text-styles)). A text that wraps gets a fixed width with `resize()` and `textAutoResize = 'HEIGHT'` on the inner node.

## Apply a text style

Also for the text inside a component when the design shows another style than the component gives:

```js
const style = await figma.importStyleByKeyAsync('TEXT_STYLE_KEY') // key from search_design_system, entity "style"
await loadFontsOf(textNode) // the node's current fonts
await figma.loadFontAsync(style.fontName) // the style's font
await textNode.setTextStyleIdAsync(style.id)
```

`setTextStyleIdAsync` is the setter for a library style. After it, no `fontName`, `fontSize`, `lineHeight`, `letterSpacing` and no `typography/*` binding on that node: each would detach the style. A node that needs two styles is two nodes. A style key can also be read from an existing node: `(await figma.getStyleByIdAsync(node.textStyleId)).key`.

## Fill a slot

```js
const [navbar, navLinkSet] = await Promise.all([
  figma.getNodeByIdAsync('NAVBAR_ID'),
  figma.importComponentSetByKeyAsync('NAV_LINK_SET_KEY')
])
const slot = navbar.findOne((n) => n.type === 'SLOT') // or by name when a set has two slots: n.name === 'table-body'
for (const placeholder of [...slot.children]) placeholder.remove()
const created = []
for (const label of ['Home', 'Pricing', 'Docs']) {
  const link = navLinkSet.defaultVariant.createInstance()
  await loadFontsOf(link)
  slot.appendChild(link)
  const asset = link.findAllWithCriteria({ types: ['INSTANCE'] }).find((n) => n.name === 'Text Asset')
  asset.setProperties({ [textKey(asset)]: label }) // textKey as in "Set text"
  created.push(link.id)
}
return { createdNodeIds: created }
```

The SLOT property has no value; `setProperties` rejects it. A plain frame can be appended to a slot as well.

## Bind variables and effect styles

Library variables are imported by key, then bound; `setBoundVariableForPaint` returns a new paint that is assigned back.

```js
const [frame, bg, border, pad, gap, radius, width, shadow] = await Promise.all([
  figma.getNodeByIdAsync('FRAME_ID'),
  figma.variables.importVariableByKeyAsync('BG_KEY'), // color/context/default/bg-main
  figma.variables.importVariableByKeyAsync('BORDER_KEY'), // color/context/default/border-subtle
  figma.variables.importVariableByKeyAsync('PAD_KEY'), // space/context/medium
  figma.variables.importVariableByKeyAsync('GAP_KEY'), // space/context/small
  figma.variables.importVariableByKeyAsync('RADIUS_KEY'), // borderRadius/context/medium
  figma.variables.importVariableByKeyAsync('WIDTH_KEY'), // borderWidth/context/medium
  figma.importStyleByKeyAsync('SHADOW_KEY') // shadow/context/small
])
const solid = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }
frame.fills = [figma.variables.setBoundVariableForPaint(solid, 'color', bg)]
frame.strokes = [figma.variables.setBoundVariableForPaint(solid, 'color', border)]
for (const side of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) frame.setBoundVariable(side, pad)
frame.setBoundVariable('itemSpacing', gap)
for (const corner of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) frame.setBoundVariable(corner, radius)
frame.setBoundVariable('strokeWeight', width)
await frame.setEffectStyleIdAsync(shadow.id)
return { mutatedNodeIds: [frame.id] }
```

Also bindable: `opacity`, `width`, `height`, `minWidth`, `maxWidth`, `counterAxisSpacing`. After an effect style, `effects` is not set by hand. A layer that differs by theme binds `visible` to a switch variable: `layer.setBoundVariable('visible', themeSwitch)` with `figma/switch/theme/mode-1` for the first mode and `mode-2` for the second.

## Read the modes

Allowed: reading. Setting a mode is not ([tokens.md → Collections and modes](./tokens.md#collections-and-modes)).

```js
const modes = frame.resolvedVariableModes // { [collectionId]: modeId }
const names = []
for (const [collectionId, modeId] of Object.entries(modes)) {
  const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId)
  names.push({ collection: collection.name, mode: collection.modes.find((m) => m.modeId === modeId)?.name })
}
return names
```

## A local component

For an element the library lacks that repeats (a stat tile, a pricing row): built once from library instances, placed as instances, kept beside the view, and listed in the report. A library instance inside it is still an instance.

```js
const tile = figma.createComponent()
tile.name = 'Stat Tile'
tile.layoutMode = 'VERTICAL'
// ...append Basic Text  Asset instances and other library instances, bind tokens...
tile.x = wrapper.x + wrapper.width + 200
for (const stat of stats) {
  const instance = tile.createInstance()
  await loadFontsOf(instance)
  grid.appendChild(instance)
  // set its text through the Assets, as in "Set text"
}
```

## Images

The Plugin API cannot fetch a URL. Two ways to an image:

- `upload_assets({ fileKey, count, nodeIds: ['FRAME_ID'] })` returns one upload URL per node; POST the raw bytes to it with the right `Content-Type` (`image/png`, `image/jpeg`), and the image becomes the fill of that node. SVGs are imported as vector trees and are not used for icons (rule 11).
- When the client offers `generate_figma_design` and the source is a running web app, the capture holds the images: copy each `imageHash` from a capture node's `IMAGE` fill onto the matching frame (`frame.fills = [{ type: 'IMAGE', imageHash, scaleMode: 'FILL' }]`), then delete the capture.

## Swap and replace

Reconnect works one layer at a time ([workflow.md → Reconnect mode](./workflow.md#reconnect-mode)):

```js
// An instance with the wrong variant, or of a deprecated component: swap, overrides survive
const [instance, set] = await Promise.all([
  figma.getNodeByIdAsync('INSTANCE_ID'),
  figma.importComponentSetByKeyAsync('SET_KEY')
])
instance.swapComponent(set.defaultVariant)
instance.setProperties({ size: 'small' })

// A detached or raw frame: a new instance at the same place, then the old layer goes
const old = await figma.getNodeByIdAsync('OLD_ID')
const parent = old.parent
const { x, y, width, height } = old
const replacement = set.defaultVariant.createInstance()
await loadFontsOf(replacement)
parent.insertChild(parent.children.indexOf(old), replacement)
if (!('layoutMode' in parent) || parent.layoutMode === 'NONE') {
  replacement.x = x
  replacement.y = y
  replacement.resize(width, height)
}
old.remove()
return { createdNodeIds: [replacement.id], removedNodeIds: ['OLD_ID'] }
```

A `detachInstance()` changes the ids of what was inside: after one, nodes are found again by traversal from a stable parent.
