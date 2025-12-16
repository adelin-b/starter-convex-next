---
name: git-worktree-manager
description: >-
  This skill should be used when working on parallel features, creating isolated
  development environments, or managing multiple branches simultaneously. It
  handles git worktrees in the better-starter-saas-worktrees directory.
targets:
  - '*'
---
# Git Worktree Manager Skill

Manages git worktrees for parallel feature development.

## When to Use

- Starting a new feature that needs isolation
- Working on multiple features simultaneously
- Testing changes without affecting main branch
- Creating clean environments for experiments

## Worktree Location

All worktrees go in: `../../better-starter-saas-worktrees/`
(Relative to better-starter-saas project root)

Absolute: `/Users/adelinb/Documents/Projects/vroom/better-starter-saas-worktrees/`

## Workflow

### Create New Worktree

```bash
# From better-starter-saas directory
cd /Users/adelinb/Documents/Projects/vroom/better-starter-saas

# Create worktree with new branch
git worktree add ../better-starter-saas-worktrees/<feature-name> -b <branch-name>

# Or from existing branch
git worktree add ../better-starter-saas-worktrees/<feature-name> <existing-branch>
```

### Example: New Feature

```bash
# Create worktree for "auth-refactor" feature
git worktree add ../better-starter-saas-worktrees/auth-refactor -b feature/auth-refactor

# Navigate to worktree
cd ../better-starter-saas-worktrees/auth-refactor

# Install dependencies
bun install

# Start development
bun run dev
```

### List Worktrees

```bash
git worktree list
```

Output example:
```
/Users/adelinb/Documents/Projects/vroom/better-starter-saas              abc1234 [main]
/Users/adelinb/Documents/Projects/vroom/better-starter-saas-worktrees/intl  def5678 [feature/intl]
```

### Remove Worktree

```bash
# Remove worktree (keeps branch)
git worktree remove ../better-starter-saas-worktrees/<feature-name>

# Force remove (if dirty)
git worktree remove --force ../better-starter-saas-worktrees/<feature-name>

# Also delete branch
git branch -d <branch-name>
```

### Cleanup Stale Worktrees

```bash
# Prune worktrees with deleted directories
git worktree prune
```

## Naming Convention

```
better-starter-saas-worktrees/
├── intl/           # Internationalization feature
├── auth-refactor/  # Auth system refactor
├── perf-testing/   # Performance experiments
└── hotfix-xyz/     # Quick hotfixes
```

## Monorepo Considerations

Each worktree is a full copy, so:
1. Run `bun install` in each worktree
2. Each has independent `node_modules`
3. Convex backend shared (same deployment)
4. Can run different ports for parallel dev

## Port Management

When running multiple worktrees:
```bash
# Main: default ports
bun run dev

# Worktree 1: offset ports
PORT=3001 bun run dev:web

# Worktree 2: different offset
PORT=3002 bun run dev:web
```

## Merge Workflow

```bash
# In worktree, commit changes
git add . && git commit -m "feat: complete feature"

# Push branch
git push -u origin feature/my-feature

# Switch to main worktree for merge or create PR
cd /Users/adelinb/Documents/Projects/vroom/better-starter-saas
git checkout main
git merge feature/my-feature
```

## Best Practices

1. Keep worktree names short but descriptive
2. Clean up worktrees after merging
3. Run `git worktree prune` periodically
4. Don't checkout same branch in multiple worktrees
5. Use separate Convex deployments for major changes
6. Document active worktrees in CLAUDE.md if long-lived
