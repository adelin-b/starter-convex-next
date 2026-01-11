# Debugging (VS Code)

This repo is a Turborepo monorepo using **Bun workspaces**:

- `apps/web` (Next.js)
- `packages/backend` (Convex functions)

## What you can breakpoint-debug

### Next.js

You can breakpoint-debug both:

- **server-side** code (API routes / server components / middleware, etc.)
- **client-side** code (React in the browser)

References:

- `https://nextjs.org/docs/app/guides/debugging`

### Convex

Convex functions are deployed to a Convex dev deployment while you run `convex dev`, so the primary debugging workflow there is **logging**.

Convex’s docs note that if you want step-through debugging with `debugger;` and breakpoints, you do it by running your Convex code from **tests**.

References:

- `https://docs.convex.dev/functions/debugging#using-a-debugger`

## VS Code configs included

At repo root, we include:

- `.vscode/launch.json`
- `.vscode/tasks.json`

### Next.js: server + client debugging

Run the compound config:

- **Debug: Next (server+client)**

Notes:

- Web app runs on **`http://localhost:3000`** in this repo (`apps/web/package.json` uses `--port ${PORT:-3000}`).
- The config uses `apps/web`’s **`dev:debug`** script (which uses `--inspect-brk` so VS Code can attach before any startup code runs, and **includes** the same `npx @react-grab/claude-code@latest` pre-step as `dev`).

### Convex: “dev” (logs)

Run:

- **Convex: start dev (logs only)**

This runs `bun run dev:debug` in `packages/backend` (currently an alias to `dev`, which executes `convex dev --tail-logs` plus env upload watching).

### Convex: breakpoint debugging via tests

Run the compound config:

- **Debug: Convex via tests (breakpoints)**

This runs `bun run test:debug` (Vitest with Node inspector) and attaches VS Code to it.

Tip: for easiest debugging, run a single test file or use `-t` to focus on one test so you don’t jump between worker processes.
