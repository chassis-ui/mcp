---
'@chassis-ui/mcp': patch
---

The skills, the prompt and the issue links send token edits and token values to `@chassis-ui/website-tokens` and the `chassis-ui/website-tokens` repository, since `@chassis-ui/tokens` is the token builder from now on and holds no token values.

What an agent now does differently: `chassis-implement-design` says a project compiles one brand of `@chassis-ui/website-tokens`, and both skills and the `/chassis-ui` prompt point a token edit at `website-tokens` where they pointed at `chassis-tokens`.
