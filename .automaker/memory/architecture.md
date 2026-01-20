---
tags: [architecture]
summary: architecture implementation decisions and patterns
relevantTo: [architecture]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# architecture

#### [Pattern] Centralized type definitions in shared types.ts file with explicit exports in feature index (2026-01-11)
- **Problem solved:** GeneratedScript and EditableScriptPhase types were scattered across multiple components (script-generator.tsx, generated-script-display.tsx)
- **Why this works:** Prevents duplicate type definitions, enables single source of truth for type contracts, allows consumers to import from single entry point (@/features/scripts), reduces coupling between components
- **Trade-offs:** Adds indirection layer (index.ts re-exports) but improves discoverability and maintainability; requires discipline to re-export all public types