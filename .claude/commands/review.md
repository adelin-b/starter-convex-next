---
description: StarterSaaS PR review with specialized agents
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
StarterSaaS comprehensive code review using specialized agents.
Combines StarterSaaS-specific pattern checks with general code quality agents into a unified workflow.
</command_identity>

**Review Aspects:** "$ARGUMENTS"

<execution_instructions>
**CRITICAL**: You MUST use the Task tool to invoke each agent. The `subagent_type` parameter determines which agent runs.

## Step 1: Determine Scope

```bash
git diff --name-only main...HEAD
```

Parse arguments (default: `all`):
| Aspect       | What it covers                          |
|--------------|-----------------------------------------|
| `types`      | Type safety, assertNever, `as const`    |
| `errors`     | Error handling, AppErrors, silent fails |
| `convex`     | Convex backend patterns                 |
| `react`      | React component patterns                |
| `bdd`        | Playwright BDD/Gherkin                  |
| `tests`      | Test coverage quality                   |
| `comments`   | Comment accuracy                        |
| `simplify`   | Code simplification                     |
| `coherence`  | Codebase consistency                    |
| `skills`     | Document learnings                      |
| `all`        | All applicable (default)                |

## Step 2: Invoke Agents via Task Tool

**IMPORTANT**: Use the exact `subagent_type` values below. These are the only valid agent identifiers.

### Group A: StarterSaaS Pattern Agents (run first)

| Aspect    | subagent_type                | When to use                            |
|-----------|------------------------------|----------------------------------------|
| `types`   | `type-safety-checker`        | TS/TSX with unions, switches, literals |
| `errors`  | `app-errors-enforcer`        | Backend files with throw/catch         |
| `convex`  | `convex-patterns-checker`    | `packages/backend/convex/` changed     |
| `react`   | `react-component-patterns`   | React components (`.tsx`)              |
| `bdd`     | `playwright-bdd-checker`     | `.feature` files                       |

### Group B: PR Review Toolkit Agents (run alongside)

| Aspect     | subagent_type                           | When to use                        |
|------------|-----------------------------------------|------------------------------------|
| `code`     | `pr-review-toolkit:code-reviewer`       | Always (general quality)           |
| `errors`   | `pr-review-toolkit:silent-failure-hunter` | Any error handling code          |
| `types`    | `pr-review-toolkit:type-design-analyzer`| New types introduced               |
| `tests`    | `pr-review-toolkit:pr-test-analyzer`    | Test files or new tests needed     |
| `comments` | `pr-review-toolkit:comment-analyzer`    | Comments/docstrings added          |
| `simplify` | `pr-review-toolkit:code-simplifier`     | After other reviews pass           |

### Group C: Final Polish Agents (run last)

| Aspect      | subagent_type        | When to use           |
|-------------|----------------------|-----------------------|
| `coherence` | `coherence-checker`  | Any code files        |
| `skills`    | `skills-suggester`   | Always (runs last)    |

## Step 3: Execution Mode

**Sequential (default)**: Run agents one at a time, address issues between.

**Parallel (if "parallel" in arguments)**: Launch ALL agents simultaneously using multiple Task tool calls in a single message.

### Example: Parallel Execution

When user says `/review all parallel`, invoke all agents in ONE message:

```
Task(subagent_type="type-safety-checker", prompt="Review for type safety...", description="Type safety check")
Task(subagent_type="app-errors-enforcer", prompt="Review for AppErrors...", description="Error handling check")
Task(subagent_type="convex-patterns-checker", prompt="Review Convex patterns...", description="Convex patterns check")
Task(subagent_type="react-component-patterns", prompt="Review React patterns...", description="React patterns check")
Task(subagent_type="pr-review-toolkit:code-reviewer", prompt="Review code quality...", description="Code quality check")
Task(subagent_type="pr-review-toolkit:silent-failure-hunter", prompt="Find silent failures...", description="Silent failure check")
Task(subagent_type="pr-review-toolkit:type-design-analyzer", prompt="Analyze type design...", description="Type design check")
Task(subagent_type="coherence-checker", prompt="Check codebase coherence...", description="Coherence check")
Task(subagent_type="skills-suggester", prompt="Suggest skill updates...", description="Skills suggestions")
```

</execution_instructions>

<agent_prompt_templates>

### For StarterSaaS Agents

Each StarterSaaS agent receives context about this being a PR review. Pass the changed files:

```
Review the following files from this PR for [ASPECT]:

Changed files:
[LIST OF FILES]

Focus on [SPECIFIC PATTERNS FOR THIS AGENT].
Report issues with confidence >= 80.
```

### For PR Review Toolkit Agents

These agents already know their job. Just specify scope:

```
Review the PR changes. Files changed:
[LIST OF FILES]

This is a StarterSaaS project (Next.js + Convex monorepo).
See CLAUDE.md for project patterns.
```

</agent_prompt_templates>

<output_format>

After ALL agents complete, consolidate into a single summary:

```markdown
# PR Review Summary

## Agents Run
- ✅ type-safety-checker
- ✅ app-errors-enforcer
- ✅ pr-review-toolkit:code-reviewer
- ✅ pr-review-toolkit:silent-failure-hunter
- ✅ coherence-checker
- ⏭️ playwright-bdd-checker (no .feature files changed)

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
- [ ] Add pattern X to CLAUDE.md

## Recommended Actions
1. Fix critical type/error issues
2. Address important patterns
3. Consider suggestions
4. Run `bun run check` to verify
```

</output_format>

<aspect_to_agents_mapping>

Quick reference for which agents to invoke per aspect:

| Aspect      | Agents (subagent_type values)                                        |
|-------------|----------------------------------------------------------------------|
| `types`     | `type-safety-checker`, `pr-review-toolkit:type-design-analyzer`      |
| `errors`    | `app-errors-enforcer`, `pr-review-toolkit:silent-failure-hunter`     |
| `convex`    | `convex-patterns-checker`                                            |
| `react`     | `react-component-patterns`                                           |
| `bdd`       | `playwright-bdd-checker`                                             |
| `tests`     | `pr-review-toolkit:pr-test-analyzer`                                 |
| `comments`  | `pr-review-toolkit:comment-analyzer`                                 |
| `simplify`  | `pr-review-toolkit:code-simplifier`                                  |
| `coherence` | `coherence-checker`                                                  |
| `skills`    | `skills-suggester`                                                   |
| `code`      | `pr-review-toolkit:code-reviewer`                                    |
| `all`       | All of the above                                                     |

</aspect_to_agents_mapping>

<usage_examples>

```bash
# Full review with all agents
/review

# Full review, all agents in parallel
/review all parallel

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

# Specific combinations
/review types errors convex
/review react bdd tests
```

</usage_examples>

<tips>
- **Run early**: Before creating PR, not after
- **Use parallel**: Faster for comprehensive reviews
- **Fix critical first**: High-priority issues before lower
- **Re-run after fixes**: Verify issues resolved
- **skills-suggester last**: Captures learnings from the review
</tips>
