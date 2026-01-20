---
tags: [testing]
summary: testing implementation decisions and patterns
relevantTo: [testing]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# testing

#### [Pattern] Template-based script generation instead of actual LLM integration enables feature completion without external dependencies (2026-01-11)
- **Problem solved:** AI Script Generator creates personalized scripts from prospect context (industry, role, company size, pain points) using predefined templates
- **Why this works:** Allows MVP delivery, no vendor lock-in, predictable outputs for testing, fast iteration without LLM API latency or costs
- **Trade-offs:** Simpler now but less personalized; easier to test deterministically but less flexible for novel scenarios; can layer real LLM on top later without breaking template system