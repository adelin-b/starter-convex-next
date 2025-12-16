---
description: Starter SaaS PR review with specialized agents
allowed-tools:
  - Bash
  - Glob
  - Grep
  - Read
  - Task
argument-hint: >-
  [aspects:
  types|errors|convex|react|bdd|tests|comments|simplify|coherence|skills|all]
  [parallel]
---
<command_identity>
Starter SaaS comprehensive code review using specialized agents.
Combines Starter SaaS-specific pattern checks with general code quality agents into a unified workflow.
</command_identity>

<context_and_motivation>
Different code aspects require different expertise. Type safety issues differ from Convex patterns which differ from React best practices. Specialized agents catch issues that general reviewers miss. Running all applicable agents ensures comprehensive coverage before PR merge.
</context_and_motivation>

**Review Aspects:** "$ARGUMENTS"

<review_workflow>

## Step 1: Determine Review Scope

```bash
git diff --name-only
git diff --cached --name-only
git diff main...HEAD --name-only
```

Parse arguments (default: all):
- **types** - Type safety (assertNever, `as const`, type design)
- **errors** - Error handling (AppErrors factories, silent failures)
- **convex** - Convex backend patterns (zodTable, indexes, auth)
- **react** - React component patterns (forms, i18n, loading states)
- **bdd** - Playwright BDD/Gherkin best practices
- **tests** - Test coverage quality and completeness
- **comments** - Code comment accuracy and maintainability
- **simplify** - Code simplification for clarity
- **coherence** - Codebase consistency, duplicate detection
- **skills** - Suggest additions to Claude skills/docs
- **all** - Run all applicable reviews (default)

## Step 2: Identify Changed Files

Categorize by type:
- `packages/backend/convex/*.ts` → types, errors, convex, coherence
- `packages/shared/src/*.ts` → types, errors, coherence
- `packages/ui/src/**/*.tsx` → types, react, coherence
- `apps/web/src/**/*.tsx` → types, react, coherence
- `apps/e2e/**/*.feature` → bdd
- `**/*.test.ts`, `**/*.spec.ts` → tests

## Step 3: Unified Agent Selection

Based on changed files and requested aspects, select from this consolidated list:

| Aspect        | Primary Agent                           | When Triggered                          |
|---------------|-----------------------------------------|-----------------------------------------|
| **types**     | type-safety-checker                     | TS/TSX files with unions/switches       |
| **types**     | pr-review-toolkit:type-design-analyzer  | New types introduced                    |
| **errors**    | app-errors-enforcer                     | Backend files with throw/catch          |
| **errors**    | pr-review-toolkit:silent-failure-hunter | Any error handling code                 |
| **convex**    | convex-patterns-checker                 | `packages/backend/convex/` changed      |
| **react**     | react-component-patterns                | React components (`.tsx`)               |
| **bdd**       | playwright-bdd-checker                  | `.feature` files                        |
| **tests**     | pr-review-toolkit:pr-test-analyzer      | Test files changed or new tests needed  |
| **comments**  | pr-review-toolkit:comment-analyzer      | Comments/docstrings added               |
| **simplify**  | pr-review-toolkit:code-simplifier       | Large changes, after other reviews pass |
| **coherence** | coherence-checker                       | Any code files                          |
| **code**      | pr-review-toolkit:code-reviewer         | Always (general quality)                |
| **skills**    | skills-suggester                        | Always (runs last)                      |

</review_workflow>

<agent_grouping>

## Group A: Project Pattern Enforcement (Starter SaaS-specific)
Run these first - they catch patterns generic reviewers miss:

1. **type-safety-checker** - assertNever, `as const`, type derivation
2. **app-errors-enforcer** - AppErrors factories, auth checks
3. **convex-patterns-checker** - zodTable, indexes, Convex patterns
4. **react-component-patterns** - react-hook-form, FormatJS, loading states
5. **playwright-bdd-checker** - Gherkin structure, Given-When-Then

## Group B: General Quality (from pr-review-toolkit)
Run alongside or after project patterns:

6. **pr-review-toolkit:code-reviewer** - CLAUDE.md compliance, bugs
7. **pr-review-toolkit:silent-failure-hunter** - Silent failures, catch blocks
8. **pr-review-toolkit:type-design-analyzer** - Type encapsulation, invariants
9. **pr-review-toolkit:pr-test-analyzer** - Test coverage gaps
10. **pr-review-toolkit:comment-analyzer** - Comment accuracy

## Group C: Polish & Knowledge
Run last:

11. **pr-review-toolkit:code-simplifier** - Simplify after issues fixed
12. **coherence-checker** - Duplicate detection, pattern consistency
13. **skills-suggester** - Document learnings for future sessions

</agent_grouping>

<execution_strategy>

**Sequential (default)**: Run agents in logical order, address issues between.

**Parallel (request with "parallel")**: Launch all applicable agents simultaneously.

```
# Example: Full review with all agents in parallel
/review all parallel
```

</execution_strategy>

<agent_overlap_guide>

When both Starter SaaS and toolkit agents cover similar ground:

| Starter SaaS Agent   | Toolkit Agent         | How They Differ                                                                     |
|---------------------|-----------------------|-------------------------------------------------------------------------------------|
| type-safety-checker | type-design-analyzer  | Starter SaaS checks assertNever/`as const`; toolkit checks encapsulation/invariants  |
| app-errors-enforcer | silent-failure-hunter | Starter SaaS enforces AppErrors factory; toolkit catches silent failures generically |

Both run - they're complementary.

</agent_overlap_guide>

<output_format>
```markdown
# PR Review Summary

## Critical Issues (must fix)
### Type Safety
- [ ] Missing assertNever: `file:line` (type-safety-checker)
- [ ] Poor encapsulation: `file:line` (type-design-analyzer)

### Error Handling
- [ ] Raw throw instead of AppErrors: `file:line` (app-errors-enforcer)
- [ ] Silent failure in catch: `file:line` (silent-failure-hunter)

### Convex Patterns
- [ ] Missing index: `file:line` (convex-patterns-checker)

## Important Issues (should fix)
### React Patterns
- [ ] Use react-hook-form: `file:line` (react-component-patterns)

### Code Quality
- [ ] CLAUDE.md violation: `file:line` (code-reviewer)

### Test Coverage
- [ ] Missing edge case test: `file:line` (pr-test-analyzer)

## Suggestions
### Coherence
- [ ] Duplicate utility exists: `file:line` (coherence-checker)

### Simplification
- [ ] Could be simplified: `file:line` (code-simplifier)

## Documentation Suggestions (skills-suggester)
### High Priority
- [ ] Add pattern X to CLAUDE.md

## Recommended Actions
1. Fix critical type/error issues
2. Address important patterns
3. Consider suggestions
4. Run `bun run check` to verify
```
</output_format>

<usage_examples>
```bash
# Full review - all agents
/review

# Type safety only (both agents)
/review types

# Error handling only (both agents)
/review errors

# Convex patterns only
/review convex

# Tests and comments
/review tests comments

# Quick code quality check
/review code errors

# Full review, all in parallel
/review all parallel

# Specific combinations
/review types errors convex
/review react bdd tests
```
</usage_examples>

<quick_pattern_reference>

### Type Safety

```typescript
// assertNever - required for exhaustive switches (type-safety-checker)
import { assertNever } from "@starter-saas/shared/assert-never";
switch (status) {
  case "available": return true;
  default: assertNever(status);
}

// as const - required for literal arrays (type-safety-checker)
const statuses = ["a", "b"] as const;
```

### Error Handling

```typescript
// AppErrors - recommended for Convex errors (app-errors-enforcer)
throw AppErrors.notAuthenticated("action");

// Handle errors visibly (silent-failure-hunter)
try {
  await riskyOp();
} catch (error) {
  logger.error("Operation failed", { error }); // Log it
  throw AppErrors.operationFailed("riskyOp");  // Re-throw or handle
}
```

### Convex

```typescript
// zodTable + index (convex-patterns-checker)
export const Vehicles = zodTable("vehicles", { ... })
  .withIndex("by_status", q => q.eq("status", value));

// Auth check
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw AppErrors.notAuthenticated("action");
```

### Coherence

```typescript
// Reuse existing utilities (coherence-checker)
import { cn } from "@starter-saas/ui/lib/utils";      // Not manual classes
import { formatPrice } from "@starter-saas/shared";   // Not new formatter
```

### React Patterns

```typescript
// cn() for class names (react-component-patterns)
import { cn } from "@starter-saas/ui/lib/utils";
<div className={cn("base", isActive && "active", className)} />

// Not manual concat
<div className={`base ${isActive ? 'active' : ''}`} />  // BAD
```

</quick_pattern_reference>

<agent_descriptions>

### Starter SaaS-Specific

| Agent                        | Focus                                                           |
|------------------------------|-----------------------------------------------------------------|
| **type-safety-checker**      | assertNever exhaustiveness, `as const`, type derivation, guards |
| **app-errors-enforcer**      | AppErrors factories, auth checks, error type guards             |
| **convex-patterns-checker**  | zodTable, indexes, auth patterns, query vs mutation             |
| **react-component-patterns** | react-hook-form + zod, FormatJS i18n, loading states            |
| **playwright-bdd-checker**   | Gherkin structure, Given-When-Then, tags                        |
| **coherence-checker**        | Duplicates, pattern consistency, library reuse                  |
| **skills-suggester**         | Document patterns, snippets, debugging tips                     |

### General Quality (pr-review-toolkit)

| Agent                     | Focus                                          |
|---------------------------|------------------------------------------------|
| **code-reviewer**         | CLAUDE.md compliance, bugs, code quality       |
| **silent-failure-hunter** | Silent failures, catch blocks, error logging   |
| **type-design-analyzer**  | Type encapsulation, invariants, design quality |
| **pr-test-analyzer**      | Test coverage, edge cases, test quality        |
| **comment-analyzer**      | Comment accuracy, documentation rot            |
| **code-simplifier**       | Code clarity, maintainability                  |

</agent_descriptions>

<tips>
- **Run early**: Before creating PR, not after
- **Fix critical first**: High-priority issues before lower
- **Re-run after fixes**: Verify issues resolved
- **Use specific aspects**: Target what you're concerned about
- **skills-suggester last**: Captures learnings from the review process
</tips>
