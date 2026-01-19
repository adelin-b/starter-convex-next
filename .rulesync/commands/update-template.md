---
targets:
  - '*'
description: Pull and backport changes from a template repository
claudecode:
  allowed-tools:
    - Bash
    - Glob
    - Grep
    - Read
    - Edit
    - Write
    - Task
  argument-hint: '[remote:template|upstream] [--since=DATE] [--dry-run]'
---
<command_identity>
Template synchronization command for pulling and backporting changes from an upstream template repository.
Analyzes commits, identifies generic/reusable patterns, and helps apply them to this project.
</command_identity>

**Arguments:** "$ARGUMENTS"

<execution_instructions>

## Step 1: Parse Arguments and Detect Remote

Default remote is `upstream` if it exists, otherwise `template`.

```bash
# Check available remotes
git remote -v

# Parse arguments
# --since=DATE: Filter commits since date (default: last sync commit)
# --dry-run: Only analyze, don't apply changes
# remote: Name of the template remote
```

## Step 2: Find Last Sync Point

Look for the most recent commit that synced with the template:

```bash
# Find sync commits
git log --oneline --grep="sync\|backport\|template" | head -5

# Get the date of the last sync
git log -1 --format="%ci" <sync_commit_hash>
```

If no sync commit found, ask the user for a reference point.

## Step 3: Fetch and Analyze Changes

```bash
# Fetch latest from template remote
git fetch <remote>

# Count commits since last sync
git log --oneline <remote>/main --since="<date>" | wc -l

# List commits with file changes (focus on generic/tooling changes)
git log --oneline <remote>/main --since="<date>" -- \
  "*.json" "*.config.*" "scripts/*" \
  "packages/shared/*" "packages/ui/src/components/*.tsx" \
  "packages/ui/src/hooks/*" "apps/web/src/lib/*" \
  "packages/backend/convex/lib/*" "packages/backend/convex/utils/*"
```

## Step 4: Categorize Changes

Group changes into categories:

### High Priority (Generic/Reusable)
- **Config files**: package.json, turbo.json, biome.json, knip.json
- **Shared utilities**: packages/shared/src/*
- **Backend lib**: packages/backend/convex/lib/*, packages/backend/convex/utils/*
- **Scripts**: scripts/*
- **UI components**: Generic components without domain-specific logic
- **Web lib**: apps/web/src/lib/* (hooks, utilities)

### Medium Priority (Review needed)
- **Sentry/monitoring config**
- **Testing infrastructure**
- **Build/deploy scripts**
- **Auth patterns**

### Skip (Domain-specific)
- Feature-specific code (vehicles, documents, agencies, etc.)
- Domain-specific types/schemas
- Business logic

## Step 5: Generate Diff Report

For each high-priority category, show:

```bash
# Example for shared utilities
git diff HEAD..<remote>/main -- packages/shared/src/

# Example for scripts
git diff HEAD..<remote>/main -- scripts/
```

Create a summary table:

| File | Status | Priority | Action |
|------|--------|----------|--------|
| packages/shared/src/new-util.ts | Added | High | Backport |
| scripts/new-script.ts | Added | High | Backport |
| packages/backend/convex/lib/errors.ts | Modified | High | Review |

## Step 6: Interactive Backporting (if not --dry-run)

For each change:

1. **Show the diff** with context
2. **Ask user** if they want to apply it
3. **Apply changes** using cherry-pick or manual copy
4. **Generalize** domain-specific names if needed:
   - `agency` → `organization`
   - `vehicle` → `item` or remove
   - `@vm/` → `@starter-saas/`

## Step 7: Post-Backport Tasks

After applying changes:

```bash
# Install dependencies
bun install

# Run checks
bun run check

# Fix any issues
bun run fix
```

## Step 8: Create Summary

Output a summary of:
- Number of commits analyzed
- Files backported
- Files skipped (with reasons)
- Recommended manual review items

## Example Output Format

```
📊 Template Update Analysis
═══════════════════════════

🔍 Remote: upstream (vroommarket)
📅 Since: 2026-01-10 (last sync)
📝 Commits analyzed: 148

┌─────────────────────────────────────────────────────────────┐
│ HIGH PRIORITY - Ready to backport                           │
├─────────────────────────────────────────────────────────────┤
│ ✓ packages/shared/src/new-formatter.ts (Added)              │
│ ✓ scripts/check-new-thing.ts (Added)                        │
│ ✓ apps/web/sentry.client.config.ts (Modified)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NEEDS REVIEW - May require generalization                   │
├─────────────────────────────────────────────────────────────┤
│ ⚠ packages/backend/convex/lib/authorization.ts              │
│   Contains agency-specific code, needs generalization       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SKIPPED - Domain-specific                                   │
├─────────────────────────────────────────────────────────────┤
│ ✗ packages/backend/convex/vehicles.ts (domain-specific)     │
│ ✗ apps/web/src/features/documents/* (domain-specific)       │
└─────────────────────────────────────────────────────────────┘

Would you like to apply the HIGH PRIORITY changes?
```

</execution_instructions>

<context_requirements>
- Git repository with a template remote configured
- Template remote should be named `upstream` or `template`
- Previous sync commits should be tagged or have identifiable messages
</context_requirements>
