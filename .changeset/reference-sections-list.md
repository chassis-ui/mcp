---
'@chassis-ui/mcp': minor
---

`chassis_get_reference` takes `sections`, a list of headings or anchors of one reference file, next to `section`. It returns those sections in the order of the file under one introduction, each once, with a heading that two of them are under written once. `section` and `sections` add up; a value that names no section of the file fails the call with an error that names it and lists the sections.

Both skills say to fetch the sections a step needs of one file in one call, and `chassis-implement-design` fetches the sections of the component families a design uses together. An agent that fetched four sections of a file in four calls got the introduction of the file four times; it now gets it once.
