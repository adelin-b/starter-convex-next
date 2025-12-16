---
name: feature-sliced-design
description: >-
  Use when organizing features or cross-feature imports. Covers @x public API
  folders, feature isolation, and unidirectional architecture.
targets:
  - '*'
---
# Feature-Sliced Design (@x Pattern)

VroomMarket uses Feature-Sliced Design for feature isolation with **@x public API folders** for explicit cross-feature communication.

## Core Principles

1. **Features are isolated modules** - Each feature owns its domain logic
2. **No direct cross-feature imports** - Features communicate via @x public APIs
3. **Unidirectional data flow** - `shared modules → features → app`
4. **ESLint enforcement** - Violations are caught at lint time

## Architecture Layers

```
apps/web/src/
├── app/                    # Next.js routes (top layer)
├── features/               # Feature modules (middle layer)
│   ├── agencies/
│   │   ├── components/     # Internal components
│   │   ├── hooks/          # Internal hooks
│   │   ├── @x/             # PUBLIC API FOLDER
│   │   │   ├── admin.ts    # Exports for admin app pages
│   │   │   └── vehicles.ts # Exports for vehicles feature
│   │   ├── i18n.ts         # Internal i18n messages
│   │   └── types.ts        # Internal types
│   ├── users/
│   │   ├── components/
│   │   └── @x/
│   │       └── agencies.ts # Exports for agencies feature
│   └── vehicles/
│       ├── components/
│       └── @x/
│           └── admin.ts
├── components/             # Shared UI components (bottom layer)
├── hooks/                  # Shared hooks
├── lib/                    # Shared utilities
└── utils/                  # Shared helpers
```

## @x Public API Pattern

**What is @x?**
@x folders are "export zones" that explicitly declare what a feature shares with other features.

**Naming convention**: `@x/{consumer}.ts`
Name the file after the **consuming** feature or app layer, not the exporting feature.

**Example structure**:

```typescript
// features/users/@x/agencies.ts
/**
 * Public API for the agencies feature
 *
 * This file exports users feature components that agencies needs.
 * Using @x pattern from Feature-Sliced Design for explicit dependencies.
 *
 * @see https://feature-sliced.design/docs/reference/public-api
 */

export { UserCell } from "../components/user-cell";
export { UserAvatar } from "../components/user-avatar";
export type { User } from "../types";
```

```typescript
// features/agencies/@x/admin.ts
/**
 * Public API for admin pages consuming agencies feature
 */

export { AddMemberDialog } from "../components/add-member-dialog";
export { roleMessages, statusMessages } from "../i18n";
export type { AgencyMember, AuthUser } from "../types";
```

## Import Rules

### Allowed Imports

```typescript
// features/agencies/hooks/use-member-columns.tsx

// Import from other features via their @x public API
import { UserCell } from "@/features/users/@x/agencies";

// Import from own feature internals
import { RoleToggleCell } from "../components/role-toggle-cell";
import { roleMessages } from "../i18n";
import type { AgencyMember } from "../types";

// Import from shared modules
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
```

### Forbidden Imports (caught by ESLint)

```typescript
// features/agencies/components/member-list.tsx

// Direct cross-feature import (bypasses public API)
import { UserCell } from "@/features/users/components/user-cell";
// ERROR: Cross-feature import detected. Use @/features/users/@x/agencies

// Features importing from app layer
import { getServerSession } from "@/app/api/auth/[...nextauth]/route";
// ERROR: Features cannot import from app. Data flows shared -> features -> app.

// Shared modules importing from features
// In components/ui/data-table.tsx
import { VehicleStatus } from "@/features/vehicles/types";
// ERROR: Shared modules cannot import from features. Move to shared if needed.
```

## When to Use @x vs Shared Folders

| Use @x Public API | Use Shared Folders (components/, lib/) |
|-------------------|----------------------------------------|
| Feature-specific component used by 1-2 other features | Generic component used by 3+ features |
| Domain coupling is acceptable | Zero domain coupling required |
| Example: `UserCell` for member tables | Example: `Button`, `DataTable`, `cn()` |
| Example: `VehicleStatusBadge` | Example: `formatDate()`, `debounce()` |

**Decision criteria**: If removing a feature would break shared code, it belongs in the feature's @x folder, not shared.

## Creating a Public API

**Step 1**: Identify what needs to be shared
Review your feature's components/hooks/types and identify what other features or app pages need.

**Step 2**: Create @x file named after consumer

```bash
mkdir -p features/my-feature/@x
touch features/my-feature/@x/consumer-name.ts
```

**Step 3**: Export with documentation

```typescript
// features/my-feature/@x/admin.ts
/**
 * Public API for admin pages
 * @see https://feature-sliced.design/docs/reference/public-api
 */

export { MyComponent } from "../components/my-component";
export type { MyType } from "../types";
```

**Step 4**: Update consumer to use @x import

```typescript
// app/(dashboard)/admin/page.tsx
import { MyComponent } from "@/features/my-feature/@x/admin";
```

## ESLint Configuration

Feature boundaries are enforced by `packages/eslint-config/feature-boundaries.js`:

```javascript
// Auto-detects features and generates import restrictions
export function createFeatureBoundariesConfig({
  featuresDir,          // Absolute path for auto-detection
  srcPath = "./src",    // Relative path from eslint config
  enableUnidirectional = true
})
```

**Biome override**: `@x` folders are exempt from `noBarrelFile` rule in `biome.json`.

## Migration Checklist

When refactoring to this pattern:

- [ ] Create feature folders in `features/`
- [ ] Move feature-specific components/hooks/types to feature folders
- [ ] Identify cross-feature dependencies
- [ ] Create `@x/{consumer}.ts` files for each dependency direction
- [ ] Update imports to use @x paths
- [ ] Run `eslint --max-warnings 0` to verify compliance
- [ ] Update `packages/eslint-config` if adding new shared folders

## Benefits

1. **Explicit dependencies** - Clear which features depend on each other
2. **Easier refactoring** - Change internals without breaking consumers
3. **Prevents spaghetti** - Can't accidentally create circular dependencies
4. **Self-documenting** - @x files show feature's public surface
5. **Enforced at build time** - ESLint catches violations before merge

## References

- [Feature-Sliced Design](https://feature-sliced.design/docs/reference/public-api)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
- VroomMarket implementation: `packages/eslint-config/feature-boundaries.js`
