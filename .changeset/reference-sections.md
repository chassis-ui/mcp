---
'@chassis-ui/mcp': minor
---

`chassis_get_reference` takes a `section`: a heading of the reference file, or the anchor of a link `file.md#anchor`. It returns that section with its subsections, under the introduction of the file, instead of the whole file. A section the file does not have, or a heading it has twice, is answered with an error that lists what to ask for.

The index that `chassis_create_design` and `chassis_implement_design` return lists the sections of each reference file with their sizes, so an agent can fetch the part a task needs.
