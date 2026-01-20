---
tags: [api]
summary: api implementation decisions and patterns
relevantTo: [api]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# api

#### [Pattern] EditableScriptPhase type constrains mutation payload to only fields that should be user-modifiable, not all GeneratedScript fields (2026-01-11)
- **Problem solved:** handleScriptUpdate callback accepts phase parameter of type EditableScriptPhase (Omit<GeneratedScript, 'id'|'generationTime'>) instead of generic keyof
- **Why this works:** Prevents accidental mutation of id or generationTime by frontend; explicit contract prevents future bugs; easier to audit security-sensitive fields
- **Trade-offs:** More verbose but self-documenting; requires maintaining EditableScriptPhase type in sync with what backend allows