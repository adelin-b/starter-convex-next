# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Overview

This is a **SaaS Starter Template** built with:

- **Frontend**: Next.js 16, React 19, TailwindCSS, shadcn/ui
- **Backend**: Convex (real-time database)
- **Auth**: Better-Auth
- **Testing**: Vitest, Playwright

## Project Structure

```
├── apps/
│   ├── web/              # Next.js frontend
│   ├── e2e/              # Playwright E2E tests
│   └── storybook/        # Component documentation
├── packages/
│   ├── backend/          # Convex backend
│   ├── ui/               # Shared UI components
│   ├── shared/           # Shared utilities
│   └── emails/           # React Email templates
└── setup.ts              # Setup wizard
```

## Development Commands

```bash
bun install              # Install dependencies
bun setup.ts             # Run guided setup wizard
bun run dev              # Start all apps
bun run dev:web          # Web only
bun run dev:server       # Convex backend only

# Testing
bun run test             # Unit tests
bun run test:e2e         # E2E tests

# Code quality
bun run check            # Lint + type check
bunx ultracite fix       # Auto-fix lint issues

# Code quality scripts (individual)
bun run check # Check the whole app
bun run check:convex-unused  # Find unused Convex endpoints
bun run check:urls           # Find hardcoded URLs
bun run check:deprecated     # Find deprecated code usage
bun run cleanup:worktrees    # Clean stale git worktrees
```

## Key Patterns

### TypeScript

- Use `as const` for literal arrays
- Use `assertNever` for exhaustive switches
- Use Zod for runtime validation

### Convex Backend

- Schema in `packages/backend/convex/schema.ts`
- Use `zodTable` from zodvex for type-safe tables
- Use `AppErrors` for consistent error handling

### React/Next.js

- Use `react-hook-form` + `zod` for forms
- Feature-based folder structure in `src/features/`

## Multi-tenancy

The template includes:

- **Organizations**: Multi-tenant workspaces
- **Members**: User-organization relationships with roles
- **Invitations**: Email-based invite system

## Updating from Template

Projects based on this template can see what changed:

```bash
# See changes since your fork/clone
bun run template:changelog --since <your-fork-commit>

# Output as JSON for automation
bun run template:changelog --since v1.0.0 --format json

# Include diffs (verbose)
bun run template:changelog --since HEAD~10 --include-diff
```

The output is LLM-friendly - you can paste it to Claude to help apply updates.

# Skills

Skills are defined in .claude/skills/ the command `/review` will review the changes using them in sub agents. Every feature should be reviewed like this.
