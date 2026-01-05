/// <reference types="vite/client" />

// Glob pattern matches all .ts/.js files except those with multiple dots
// This excludes: *.test.ts, *.config.ts, test.setup.ts
export const modules = import.meta.glob("./**/!(*.*.*)*.*s");
