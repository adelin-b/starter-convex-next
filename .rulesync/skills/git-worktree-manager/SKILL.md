---
name: git-worktree-manager
description: >-
  This skill should be used when working on parallel features, creating isolated
  development environments, or managing multiple branches simultaneously. Uses
  git-worktree-runner (gtr) for simplified worktree management with
  Cursor/Claude integration.
targets:
  - '*'
---
# Git Worktree Manager Skill

Manages git worktrees using `git gtr` for parallel feature development with isolated Convex backends.

## When to Use

- Starting a new feature that needs isolation
- Working on multiple features simultaneously
- Testing changes without affecting main branch
- Creating clean environments for experiments

## Prerequisites

```bash
# Install git-worktree-runner (one-time)
git clone https://github.com/coderabbitai/git-worktree-runner.git /tmp/git-worktree-runner
ln -sf /tmp/git-worktree-runner/bin/git-gtr ~/bin/git-gtr
```

## Quick Reference

| Task | Command |
|------|---------|
| Create worktree | `git gtr new feature-name` |
| Open in Cursor | `git gtr editor feature-name` |
| Open with Claude | `git gtr ai feature-name` |
| Navigate to worktree | `cd "$(git gtr go feature-name)"` |
| List worktrees | `git gtr list` |
| Remove worktree | `git gtr rm feature-name` |

## Workflow

### Create New Worktree

```bash
cd /Users/adelinb/Documents/Projects/vroom/better-vroommarket

# Create worktree (auto-runs post-create hook for port allocation)
git gtr new my-feature

# Open in Cursor
git gtr editor my-feature

# Or navigate and work
cd "$(git gtr go my-feature)"
```

The post-create hook automatically:
- Allocates unique ports (Web, Storybook, Convex)
- Creates `.env.local` files for isolated Convex backend
- Patches package.json for local Convex
- Runs `bun install`

### Start Isolated Development

```bash
# Terminal 1: Start isolated Convex backend
cd "$(git gtr go my-feature)"
bash .gtr/start-isolated.sh

# Terminal 2: Start dev server
cd "$(git gtr go my-feature)"
bun run dev
```

### Port Allocation

Each worktree gets unique ports:
- Worktree 1: Web=10001, Storybook=10006, Convex=10210/10211
- Worktree 2: Web=11001, Storybook=11006, Convex=11210/11211

### List Worktrees

```bash
git gtr list
```

### Remove Worktree

```bash
# Remove worktree (keeps branch)
git gtr rm my-feature

# Also delete branch after merge
git branch -d feature/my-feature
```

## Configuration

Settings in `.gtrconfig`:
- `gtr.worktrees.dir = .worktree` - Worktrees inside repo
- `gtr.editor.default = cursor` - Default editor
- `gtr.ai.default = claude` - Default AI tool
- Copy patterns for env files, .claude, .vscode
- Post-create hook for isolated Convex setup

## Merge Workflow

```bash
# In worktree, commit changes
cd "$(git gtr go my-feature)"
git add . && git commit -m "feat: complete feature"
git push -u origin feature/my-feature

# Create PR or switch to main for merge
cd /Users/adelinb/Documents/Projects/vroom/better-vroommarket
git checkout main
git merge feature/my-feature

# Clean up
git gtr rm my-feature
git branch -d feature/my-feature
```

## Best Practices

1. Keep worktree names short but descriptive
2. Clean up worktrees after merging
3. Don't checkout same branch in multiple worktrees
4. Each worktree has isolated Convex data in `.convex-local/`
5. Use `git gtr list` to see active worktrees
