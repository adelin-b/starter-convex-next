---
tags: [gotcha, mistake, edge-case, bug, warning]
summary: Mistakes and edge cases to avoid
relevantTo: [error, bug, fix, issue, problem]
importance: 0.9
relatedFiles: []
usageStats:
  loaded: 2
  referenced: 1
  successfulFeatures: 1
---
# Gotchas

Mistakes and edge cases to avoid. These are lessons learned from past issues.

---



#### [Gotcha] Type casting pattern 'as unknown as undefined' in schema definition (scriptGenerator.ts lines 495-496) bypasses type safety (2026-01-11)
- **Situation:** Zod schema for prospectContext field needed to satisfy TypeScript but actual runtime behavior differs from declared type
- **Root cause:** Quick workaround when proper typing of schema field proved complex or when field definition conflicts between client/server expectations
- **How to avoid:** Avoids immediate refactoring but accumulates technical debt; silences legitimate type errors that could catch bugs; future maintainers won't understand why cast exists

#### [Gotcha] Import ordering enforcement (type imports before regular imports) is framework-specific linting rule, not TypeScript default (2026-01-11)
- **Situation:** Biome linter failed on import order: 'import type {...} from "../types"' placed after 'import {...} from "./generated-script-display"'
- **Root cause:** Biome enforces consistent import organization for readability; type imports grouped separately makes it clear what's type-only vs runtime
- **How to avoid:** Adds friction during development (linter failures) but improves code consistency across team; different linters (eslint, biome) have different rules