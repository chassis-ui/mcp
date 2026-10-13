---
'@chassis-ui/mcp': patch
---

The server runs on zod 4. The input schemas of the four tools (`chassis_create_design`, `chassis_implement_design`, `chassis_get_reference`, `chassis_check_classes`) no longer carry `"additionalProperties": false`: the MCP SDK writes the JSON Schema of a zod 4 schema with zod's own converter, which leaves the keyword out of an input schema. The properties, their types and descriptions, and `required` are the same.

A call is answered as before: an argument a tool does not have is ignored, as it was, and an invalid argument is still the error `-32602`. The text of that error is the one of zod 4 (`Invalid input: expected array, received string at classes`, where it was `Expected array, received string at classes`).
