---
'@chassis-ui/mcp': minor
---

The skill tools return the instructions and an index of the references, not every reference.

- **Breaking:** `chassis_create_design` and `chassis_implement_design` return the `SKILL.md` without its frontmatter, followed by an index of the skill's reference files: for each its file name, its size, the line the skill gives it, its title and its name for `chassis_get_reference`. A call is 29 KB and 9 KB instead of 106 KB and 94 KB; an agent fetches a reference when the instructions send it there. The input `full: true` returns what the tools returned before, the instructions and every reference inline
- The prompts `chassis-create-design` and `chassis-implement-design` keep returning the whole skill: a prompt is the user's own choice
- `chassis_get_reference` says in its description what it returns; its names are unchanged
- The resource registry carries the one-line summary each `SKILL.md` gives its references, and the build fails for a reference the `SKILL.md` does not list that way
