---
name: react-patterns
description: >-
  Use when writing React components. Covers forms with react-hook-form/zod,
  error display, i18n with Lingui.
targets:
  - '*'
---
# React Component Patterns

This skill documents React patterns for VroomMarket components: forms, error handling, i18n, and component extraction.

## Patterns

### 1. Form Handling with react-hook-form + Zod

All forms should use react-hook-form with zodResolver.

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});
type FormData = z.infer<typeof FormSchema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: { email: "", name: "" },
  });

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = form;
}

// Improvement needed - manual validation
function BadForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.includes("@")) setError("Invalid email");
  };
}
```

### 2. Select/Controlled Inputs with Controller

Use Controller for select, checkbox, and other controlled inputs.

```typescript
import { Controller } from "react-hook-form";

<Controller
  control={control}
  name="fuelType"
  render={({ field }) => (
    <Select onValueChange={field.onChange} value={field.value}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {fuelTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {i18n._(fuelTypeMessages[type])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
/>

// Improvement needed - uncontrolled or manual state
<Select value={status} onValueChange={(v) => setStatus(v)}>
```

### 3. Error Handling with useConvexFormErrors

Convex mutation errors should use `useConvexFormErrors` hook.

```typescript
import { getConvexErrorMessage, useConvexFormErrors } from "@starter-saas/ui/use-convex-form-errors";

function MyForm() {
  const form = useForm<FormData>({...});
  const { handleConvexError } = useConvexFormErrors(form);

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation(data);
      reset();
      onSuccess();
    } catch (err) {
      if (handleConvexError(err)) {
        return; // handleConvexError returns true if it handled field errors
      }
      onError(getConvexErrorMessage(err, "Failed to save"));
    }
  };
}

// Improvement needed - manual error extraction
function BadForm() {
  const onSubmit = async (data) => {
    try {
      await mutation(data);
    } catch (err) {
      setError(err.message); // Loses field-level errors
    }
  };
}
```

### 4. Component Extraction

Extract reusable components when **2+ places** use the same UI pattern.

```typescript
// Recommended approach - extracted component
function VehicleCard({
  vehicle,
  onStatusChange,
  onDelete,
}: {
  vehicle: Vehicle;
  onStatusChange: (id: Vehicle["_id"], status: VehicleStatus) => void;
  onDelete: (id: Vehicle["_id"]) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      {/* Component JSX */}
    </div>
  );
}

// Main page uses extracted component
export default function VehiclesPage() {
  return (
    <div>
      {vehicles.map((v) => (
        <VehicleCard key={v._id} vehicle={v} onStatusChange={...} onDelete={...} />
      ))}
    </div>
  );
}

// Improvement needed - inline JSX in map (50+ lines)
export default function BadPage() {
  return (
    <div>
      {vehicles.map((v) => (
        <div key={v._id} className="flex items-center">
          {/* 50+ lines of inline JSX */}
        </div>
      ))}
    </div>
  );
}
```

**Extraction checklist**:
- [ ] Component appears in 2+ files
- [ ] Shared constants moved to component file (roleLabels, roleColors, etc.)
- [ ] Props designed for flexibility (optional variants like `showDescriptions`, `linkless`)
- [ ] JSDoc with `@example` showing usage
- [ ] Placed in logical location:
  - Domain-specific: `apps/web/src/components/admin/` (RoleSelector)
  - Generic/reusable: `packages/ui/src/components/` (DataTable)

### 5. Internationalization with Lingui

Use `Trans` macro for JSX, `t` macro for strings, `msg` for lazy/deferred translations.

```typescript
import { Trans, useLingui } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";

// JSX translations with Trans macro
function Component() {
  return (
    <h1>
      <Trans>Welcome to VroomMarket</Trans>
    </h1>
  );
}

// String translations with t macro (useLingui hook)
function DynamicComponent() {
  const { t, i18n } = useLingui();

  const title = t`Vehicles`;
  const greeting = t`Hello, ${userName}!`;

  // For locale-aware formatting
  const formattedPrice = new Intl.NumberFormat(i18n.locale, {
    style: "currency",
    currency: "USD",
  }).format(price);

  const formattedMileage = new Intl.NumberFormat(i18n.locale, {
    style: "unit",
    unit: "mile",
    unitDisplay: "short",
  }).format(mileage);

  return <span>{formattedMileage}</span>;
}

// Pluralization with plural macro
import { plural } from "@lingui/core/macro";

function VehicleCount({ count }) {
  const { _ } = useLingui();

  return (
    <span>
      {_(plural(count, {
        zero: "No vehicles",
        one: "# vehicle",
        other: "# vehicles",
      }))}
    </span>
  );
}

// Improvement needed - hardcoded strings
return <span>{mileage} miles</span>; // Not i18n-friendly
```

### 5.1 i18n Message Organization with msg macro

Organize i18n messages by **semantic category**, not by component. Create `i18n.ts` files in feature folders.

```typescript
// features/vehicles/i18n.ts
import { msg } from "@lingui/core/macro";

/** Status label messages for i18n */
export const statusMessages = {
  available: msg`Available`,
  sold: msg`Sold`,
  reserved: msg`Reserved`,
} as const;

/** Role label messages for i18n */
export const roleMessages = {
  commercial: msg`Commercial`,
  "agency-manager": msg`Agency Manager`,
} as const;

/** Form field labels */
export const formMessages = {
  licensePlate: msg`License Plate`,
  price: msg`Price`,
  mileage: msg`Mileage`,
  fuelType: msg`Fuel Type`,
} as const;
```

**Usage in components**:

```typescript
import { useLingui } from "@lingui/react/macro";
import { statusMessages, formMessages } from "../i18n";

function VehicleCard({ vehicle }) {
  const { i18n } = useLingui();

  return (
    <Badge>{i18n._(statusMessages[vehicle.status])}</Badge>
  );
}
```

**Common categories**:
- `statusMessages` - Status labels (active/inactive, available/sold)
- `roleMessages` - Role labels (admin, commercial, agency-manager)
- `formMessages` - Form field labels and placeholders
- `errorMessages` - Error messages specific to this feature
- `validationMessages` - Validation error messages

**Naming conventions**:
- Export names: `{category}Messages` (e.g., `statusMessages`, `roleMessages`)
- Always include JSDoc comments describing the category
- Use `as const` for type safety

### 5.2 Localized Validation Schemas

#### Option A: Global Zod Locale Configuration (Recommended)

Configure Zod's built-in locale system once in IntlProvider:

```typescript
// components/providers/intl-provider.tsx
import { z } from "zod";
import { en, fr } from "zod/locales";

const zodLocales: Record<Locale, () => Parameters<typeof z.config>[0]> = { en, fr };

useLayoutEffect(() => {
  i18n.load({ [locale]: messages });
  i18n.activate(locale);
  z.config(zodLocales[locale]()); // Sync Zod locale with Lingui
}, [locale, messages]);
```

Then use static schemas (no `useMemo` needed):

```typescript
// lib/validation-schemas.ts
import { z } from "zod";

export const emailSchema = z.email();           // Zod v4 shorthand
export const passwordSchema = z.string().min(8);
export const nameSchema = z.string().min(2);

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Component - direct static import
const form = useForm<FormData>({
  resolver: zodResolver(signUpSchema),
});
```

**Note**: `z.email()` is a Zod v4 shorthand for `z.string().email()`. Use `z.string().email()` in Convex schemas (zodTable) for type compatibility.

#### Option B: Schema Factory Functions (For custom messages)

For domain-specific or highly customized error messages that differ from Zod's built-in locale:

```typescript
export function createSignUpSchema(t: ReturnType<typeof useLingui>["t"]) {
  return z.object({
    name: z.string().min(2, t`Name must be at least 2 characters`),
    email: z.string().email(t`Invalid email address`),
    password: z.string().min(8, t`Password must be at least 8 characters`),
  });
}

// Component
const { t } = useLingui();
const signUpSchema = useMemo(() => createSignUpSchema(t), [t]);
```

**When to use which**:
- Use **Option A** (global config) for standard validation messages - simpler, no `useMemo` overhead
- Use **Option B** (factories) when you need custom, context-specific error messages

### 6. Loading and Error States

Use consistent loading/error state patterns.

```typescript
function DataComponent() {
  const { data, isPending, isError, error } = useQueryWithStatus(api.items.list, {});

  if (isPending) {
    return (
      <output className="flex justify-center py-8">
        <Loader2 aria-label="Loading items" className="h-8 w-8 animate-spin" />
      </output>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error?.message ?? "Failed to load"}</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return <DataList items={data} />;
}

// Improvement needed - missing states
function BadComponent() {
  const { data } = useQuery(api.items.list);
  return <DataList items={data ?? []} />; // No loading, no error
}
```

### 7. React 19 Features

Use React 19 patterns where applicable.

```typescript
// React 19 - ref as prop (no forwardRef needed)
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// React 19 - use() hook for promises
import { use } from "react";
function Data({ promise }) {
  const data = use(promise); // Suspends until resolved
  return <div>{data}</div>;
}

// React 19 - Actions for forms
<form action={async (formData) => {
  await saveData(formData);
}}>
```

### 8. Class Names with cn()

Use `cn()` utility for class composition instead of manual string concatenation.

```typescript
import { cn } from "@starter-saas/ui/lib/utils";

function Button({ variant, className }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200",
        className
      )}
    />
  );
}

// Also good - cn with conditional objects
<div className={cn("base-class", {
  "active-class": isActive,
  "disabled-class": isDisabled,
})} />

// Improvement needed - manual template literal concatenation
<div className={`base ${isActive ? 'active' : ''} ${className || ''}`} />
```

**Why cn()?**
- Handles undefined/null/false values automatically
- Properly merges Tailwind classes (via tailwind-merge)
- Cleaner conditional logic
- Consistent pattern across codebase

### 9. DataTable i18n Labels System

DataTable uses a centralized labels system for all user-facing text:

```typescript
import { type DataTableLabels } from "@starter-saas/ui/data-table/labels";
import { useLingui } from "@lingui/react/macro";

// In component
const { t } = useLingui();
const labels: Partial<DataTableLabels> = {
  searchPlaceholder: t`Search vehicles by make, model, license plate...`,
  loading: t`Loading vehicles`,
};

<DataTable data={vehicles} columns={columns} labels={labels} />
```

**Anti-pattern**:
```typescript
// Don't hardcode strings in DataTable components
<Input placeholder="Search all columns..." />
<Button>Clear all</Button>
```

## Project Context

**Reference implementation**: `apps/web/src/app/vehicles/page.tsx`

**Key imports**:
- `@starter-saas/ui/use-convex-form-errors` - Error handling
- `@lingui/react/macro` - i18n (Trans, useLingui, t)
- `@lingui/core/macro` - i18n (msg, plural)
- `react-hook-form` - Form state
- `@hookform/resolvers/zod` - Validation

**UI components from**: `@starter-saas/ui/*`

**Extracted admin components**:
- `apps/web/src/components/admin/user-cell.tsx` - UserCell for DataTable columns
- `apps/web/src/components/admin/role-selector.tsx` - RoleSelector for role checkboxes

**Related skills**:
- [react-effects](../react-effects/SKILL.md) - useEffect decision tree, when NOT to use effects
