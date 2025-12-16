---
name: typescript-patterns
description: >-
  Use for type safety patterns. Covers assertNever, as const, type derivation,
  type guards.
targets:
  - '*'
---
# TypeScript Type Safety Patterns

This skill documents TypeScript patterns that ensure compile-time type safety in Starter SaaS.

## Patterns

### 1. Exhaustive Switch with assertNever

Switch statements on union types MUST use `assertNever` in the default case. Adding a new union member without handling it then fails compilation.

```typescript
// Improvement needed
switch (status) {
  case "pending": return "Waiting";
  case "done": return "Complete";
  default: return "Unknown"; // New status silently becomes "Unknown"
}

// Recommended approach
import { assertNever } from "@starter-saas/shared/assert-never";

switch (status) {
  case "pending": return "Waiting";
  case "done": return "Complete";
  default:
    assertNever(status); // Compile error: Argument of type 'X' not assignable to 'never'
}
```

**Exception**: Switch on `string` or `number` (non-union) may use default without assertNever.

### 2. Literal Arrays with `as const`

Arrays defining union types MUST use `as const`. Without it, TypeScript widens to `string[]` and loses literal inference.

```typescript
// Improvement needed - type becomes string[]
export const fuelTypes = ["gasoline", "diesel", "electric"];
type FuelType = typeof fuelTypes[number]; // string - loses type safety

// Recommended approach
export const fuelTypes = ["gasoline", "diesel", "electric"] as const;
type FuelType = typeof fuelTypes[number]; // "gasoline" | "diesel" | "electric"
```

**Exception**: Arrays that are actually meant to be mutable.

### 3. Type Derivation from Constants

Derive types from constants using `typeof X[keyof typeof X]` or `typeof X[number]`. Manual unions can drift from their source constants.

```typescript
// Improvement needed - can drift from ErrorCodes
export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  INVALID: "INVALID",
} as const;
export type ErrorCode = "NOT_FOUND" | "INVALID" | "TIMEOUT"; // Manual, drifted!

// Recommended approach
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

### 4. Type Guards

Runtime type checking should use proper type guard functions for TypeScript narrowing.

```typescript
// Improvement needed - no type narrowing
if (error && typeof error === "object" && "code" in error) {
  console.log(error.code); // TypeScript doesn't know shape
}

// Recommended approach
function isAppError(error: unknown): error is AppError {
  return error instanceof ConvexError && "code" in error.data;
}

if (isAppError(error)) {
  console.log(error.data.code); // TypeScript knows exact type
}
```

### 5. Next.js Typed Routes with Generics

Use generic type parameters with `Route<T>` to preserve template literal type inference. This eliminates unsafe `as Route` casting.

```typescript
import type { Route } from "next";

// Correct - Generic preserves type inference
type Props<T extends string> = {
  linkHref: Route<T>;
};

export function UserCell<T extends string>({ linkHref }: Props<T>) {
  return <Link href={linkHref}>...</Link>;
}

// Usage - type inferred from template literal
<UserCell linkHref={`/admin/members/${id}`} />

// Wrong - loses type safety, requires unsafe casting
type Props = {
  linkHref: Route;
};

export function UserCell({ linkHref }: Props) {
  return <Link href={linkHref as Route}>...</Link>;
}
```

**When to use**: Components that accept dynamic route paths as props (user cells, breadcrumbs, navigation items).

### 6. Shared Constants with Type Guards

For constants shared across packages (locales, config values):

```typescript
// Centralized in packages/shared/
export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "en";

// Type guard for runtime validation
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

// Fallback helper using type guard
export function getBestLocale(preferredLocales: string[]): SupportedLocale {
  for (const locale of preferredLocales) {
    const lang = locale.split("-")[0];
    if (isSupportedLocale(lang)) {
      return lang;
    }
  }
  return DEFAULT_LOCALE;
}
```

**When to use**: Configuration values used by multiple packages (locales, API endpoints, feature flags).

## Project Context

**assertNever location**: `@starter-saas/shared/assert-never`

**Common union types**:
- `VehicleStatus`: "available" | "sold" | "reserved"
- `FuelType`: "gasoline" | "diesel" | "electric" | "hybrid"
- `TransmissionType`: "automatic" | "manual"
- `AgencyRole`: "agency-manager" | "commercial"
- `ErrorCode`: Various error codes in AppErrors

**Priority files**:
- `packages/backend/convex/*.ts` - Business logic
- `packages/shared/src/*.ts` - Shared utilities
- `packages/ui/src/**/*.tsx` - Components with state
