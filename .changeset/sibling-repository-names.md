---
'@chassis-ui/mcp': patch
---

The skills name the other Chassis repositories by their GitHub names, as `chassis-ui/css`, instead of by local folder names.

What an agent now does differently: `chassis-implement-design` looks for the icon names in a checkout of `chassis-ui/icons` wherever that checkout is, where it looked for one next to the project.
