---
name: knip-cleanup
description: >-
  This skill should be used after long coding sessions, refactoring, or feature
  removal to identify and clean up dead code, unused dependencies, and orphaned
  exports. Run proactively to maintain codebase hygiene.
targets:
  - '*'
---
# Knip Cleanup Skill

Automates dead code detection and cleanup using Knip.

## When to Use

- After long coding/generation sessions
- After removing features or refactoring
- Before creating PRs
- When codebase feels bloated
- Periodically as maintenance

## Workflow

### Phase 1: Analysis
```bash
# Run knip in dry-run mode first
bun run knip
```

Review output categories:
- **Unused files** - Can be deleted
- **Unused dependencies** - Remove from package.json
- **Unused exports** - Remove or mark as internal
- **Unlisted dependencies** - Add to package.json or remove usage

### Phase 2: Auto-Fix (Safe)
```bash
# Auto-remove unused dependencies only
bun run knip:fix
```

This is safe - only touches package.json dependencies.

### Phase 3: Manual Cleanup
For unused files and exports, manually review and delete:
1. Check if file is dynamically imported
2. Check if export is used via barrel files
3. Verify no runtime usage before deletion

### Phase 4: Verification
```bash
# Verify build still works
bun run build

# Run tests
bun run test
```

## Commands Reference

```bash
# Full analysis
bun run knip

# Fix unused deps
bun run knip:fix

# Show only unused files
bunx knip --include files

# Show only unused exports
bunx knip --include exports

# Ignore specific patterns
bunx knip --ignore "**/*.test.ts"
```

## Monorepo Considerations

In turborepo setup (better-vroommarket):
- Run from root to analyze all packages
- Each package may have its own knip config
- Cross-package dependencies are tracked

## Report Format

When reporting cleanup results:
```
## Knip Cleanup Report

### Removed Files
- src/unused-component.tsx
- src/old-utils.ts

### Removed Dependencies
- lodash (unused)
- moment (replaced by date-fns)

### Removed Exports
- src/utils.ts: `deprecatedFunction`
- src/types.ts: `OldInterface`

### Build Verification
✓ Build passes
✓ Tests pass
```

## Best Practices

- Run after every major refactor
- Review before auto-fixing
- Keep knip config up to date
- Add false positives to ignore list
- Document intentionally unused code with `// knip-ignore`
