---
'@chassis-ui/mcp': patch
---

The server gives instructions when a client connects: what Chassis UI is, and which tool a Chassis task starts with. A client that loads tools on demand shows an agent their names only, while the instructions of the Figma MCP server send every design task to the Figma skills, so an agent with the connector alone built Chassis screens without `chassis_create_design`. The tools, prompts and resources are unchanged.

What an agent now does differently: before its first `use_figma` call on a screen built with the Chassis UI library, or in a Figma file that uses it, it calls `chassis_create_design` and follows what it returns; before it writes markup from a Chassis design, it calls `chassis_implement_design`, and checks its classes with `chassis_check_classes`; it calls `chassis_add_brand` to add a brand; and it fetches the references the skills send it to with `chassis_get_reference`.
