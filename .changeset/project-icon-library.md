---
'@chassis-ui/mcp': patch
---

Both skills work with the icon library of the project. `chassis-implement-design` writes the glyphs of a design with it, and no longer with Chassis Icons whatever the project uses.

What an agent now does differently: before the first Figma call it finds the icon library of the project, as it finds the CSS mode, from the dependencies and from the icons the markup already has. A project that uses `@chassis-ui/icons` gets what it got before, a Chassis Icons reference by the name of the glyph, and every name is checked against the package the project has installed. A project that uses another icon library gets the icon of that library that draws the same glyph, written the way the project writes its icons, without the `icon` class (an `.icon` sets `fill`, which fills an icon drawn with strokes); a glyph that library lacks is the downloaded SVG, flagged. With no icon library, or no project, the agent asks which one to use and defaults to the downloaded SVG, where it wrote a Chassis Icons reference before; a downloaded SVG has the color of the export and is flagged. It never adds an icon library to a project that has another.

It also reads the icons of a design made for another icon library: an instance of a font set of the library's page "Icon" (`FA 6 Free Icon`, `Material Icon`, …), whose text is the name of the icon in that font, and `Library Icon`, which holds the component of another icon library.

`chassis-create-design` builds with the icon library of the project too. Rule 11 allowed the single glyphs of Chassis Icons only and reported every other icon as missing. What an agent now does differently: at the first step it notes the icon library of the project (from its code, the screens of the file, or the libraries added to it; it asks when none shows, and defaults to the Chassis glyphs), and uses the component the library has for it: the single glyph, the font set with the name of the icon typed into its text layer (Font Awesome 6, Material Icons, SF Symbols), or `Library Icon` around the component of another icon library. It loads the font of a font set at the discovery pass and reports the icons as Blocked when the file does not have it. A new section of `components.md`, "Icons", says this and that the color of an icon is the fill of its layer "Color"; `recipes.md` has "Set an icon". SVG import stays forbidden.

The summary of `chassis-implement-design` states the icon library next to the CSS mode, and the bucket "Iconified" holds the glyphs written with the icon library of the project.
