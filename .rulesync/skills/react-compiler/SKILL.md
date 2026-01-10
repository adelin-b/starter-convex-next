---
name: react-compiler
description: >-
  Use when writing React components in React 19+. Guides post-compiler patterns
  where memoization is automatic. Covers avoiding manual useMemo/useCallback,
  deriving state inline, and compiler directives.
targets:
  - '*'
---
# React Compiler Coding Guidelines

This skill documents React Compiler patterns for Starter SaaS. With React Compiler enabled, write React as if **every render is free and memoization is automatic**.

## Core Mental Model

> "In post-React Compiler React, performance is an implementation detail. Semantics are the API."

The fundamental shift: move from manual render optimization to compiler-driven automatic optimization.

**Key principles:**
1. **Components are pure functions** - Derive UI purely from props, state, and context
2. **Derived values are computed inline** - Never store calculated data in state
3. **Manual memoization is rarely needed** - The compiler handles it automatically

## Anti-Patterns to Detect

| Anti-Pattern | Problem | Alternative |
|--------------|---------|-------------|
| `useMemo` for simple calculations | Unnecessary complexity; compiler auto-memoizes | Compute inline |
| `useCallback` wrapping every function | Defensive pattern no longer needed | Define functions inline |
| `React.memo` on components | Compiler decides optimal memoization | Remove wrapper |
| Storing derived data in state | Creates sync bugs; extra re-renders | Compute during render |
| `useRef` as memoization cache | Circumvents compiler optimization | Remove manual caching |

## Patterns

### 1. Avoid Manual Memoization

With React Compiler, do not use `useMemo`, `useCallback`, or `React.memo` for performance optimization by default.

```typescript
// Improvement needed - manual memoization
function ItemList({ items, filter }: Props) {
  const filteredItems = useMemo(
    () => items.filter((v) => v.status === filter),
    [items, filter]
  );

  const handleSelect = useCallback(
    (id: Item["_id"]) => {
      console.log("Selected:", id);
    },
    []
  );

  return (
    <div>
      {filteredItems.map((v) => (
        <ItemCard key={v._id} item={v} onSelect={handleSelect} />
      ))}
    </div>
  );
}

// Recommended approach - inline computation
function ItemList({ items, filter }: Props) {
  const filteredItems = items.filter((v) => v.status === filter);

  const handleSelect = (id: Item["_id"]) => {
    console.log("Selected:", id);
  };

  return (
    <div>
      {filteredItems.map((v) => (
        <ItemCard key={v._id} item={v} onSelect={handleSelect} />
      ))}
    </div>
  );
}
```

**Exception**: Manual memoization is acceptable when:
- Profiling confirms a bottleneck after compilation
- Integrating with non-React imperative APIs requiring stable references
- Referential stability is required for correctness (not performance)

### 2. Derive, Don't Store

Never store calculated or derived values in state. Compute them during render.

```typescript
// Improvement needed - derived state stored
function ItemSearch({ items }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);

  useEffect(() => {
    setResults(items.filter((v) => v.model.includes(query)));
  }, [items, query]);

  return <ItemGrid items={results} />;
}

// Recommended approach - computed inline
function ItemSearch({ items }: Props) {
  const [query, setQuery] = useState("");
  const results = items.filter((v) => v.model.includes(query));

  return <ItemGrid items={results} />;
}
```

This pattern:
- Eliminates sync bugs between source and derived state
- Removes unnecessary re-renders from `setState` in effects
- Lets the compiler optimize the computation automatically

### 3. Inline Callbacks Are Fine

Inline arrow functions in JSX no longer need wrapping. The compiler handles closures automatically.

```typescript
// Improvement needed - defensive useCallback
function Dialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    onSuccess();
    setOpen(false);
  }, [onSuccess]);

  return (
    <DialogPrimitive open={open} onOpenChange={handleClose}>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogPrimitive>
  );
}

// Recommended approach - inline handlers
function Dialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive open={open} onOpenChange={() => setOpen(false)}>
      <Button
        onClick={() => {
          onSuccess();
          setOpen(false);
        }}
      >
        Confirm
      </Button>
    </DialogPrimitive>
  );
}
```

### 4. Remove React.memo Wrappers

Don't wrap components in `React.memo` for performance. The compiler determines optimal memoization boundaries.

```typescript
// Improvement needed - manual memo wrapper
const ItemCard = React.memo(function ItemCard({
  item,
  onSelect,
}: ItemCardProps) {
  return (
    <div onClick={() => onSelect(item._id)}>
      <h3>{item.model}</h3>
      <p>{item.price}</p>
    </div>
  );
});

// Recommended approach - plain component
function ItemCard({ item, onSelect }: ItemCardProps) {
  return (
    <div onClick={() => onSelect(item._id)}>
      <h3>{item.model}</h3>
      <p>{item.price}</p>
    </div>
  );
}
```

### 5. Prefer Multiple Small States

Use multiple `useState` calls for independent values rather than one large state object.

```typescript
// Improvement needed - single large state object
function ItemFilters() {
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    minPrice: 0,
    maxPrice: 100000,
  });

  const updateFilter = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)} />
      <Select value={filters.category} onValueChange={(v) => updateFilter("category", v)} />
    </>
  );
}

// Recommended approach - independent states
function ItemFilters() {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  return (
    <>
      <Select value={status} onValueChange={setStatus} />
      <Select value={category} onValueChange={setCategory} />
    </>
  );
}
```

This enables:
- More granular compiler optimization
- Clearer data flow
- Simpler component logic

### 6. Stable Keys for Lists

Use stable, semantic keys (unique IDs) for list items. Never use index-based keys for reorderable lists.

```typescript
// Improvement needed - index keys
function ItemGrid({ items }: Props) {
  return (
    <div>
      {items.map((item, index) => (
        <ItemCard key={index} item={item} />
      ))}
    </div>
  );
}

// Recommended approach - stable ID keys
function ItemGrid({ items }: Props) {
  return (
    <div>
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </div>
  );
}
```

## Hook Guidelines

### useState

Use for true local UI state only. Prefer multiple small states over one large object.

```typescript
// Appropriate useState usage
const [isOpen, setIsOpen] = useState(false);
const [selectedId, setSelectedId] = useState<Item["_id"] | null>(null);
```

### useEffect

Reserve **exclusively** for synchronizing with external systems (network, DOM APIs, third-party libraries).

```typescript
// Appropriate useEffect - external system sync
useEffect(() => {
  const subscription = externalAnalytics.subscribe(onEvent);
  return () => subscription.unsubscribe();
}, []);

// Improvement needed - derived state in effect
useEffect(() => {
  setFilteredItems(items.filter((i) => i.active));
}, [items]);
// Should be: const filteredItems = items.filter((i) => i.active);
```

**See**: [react-effects skill](../react-effects/SKILL.md) for complete useEffect decision tree.

### useRef

Reserve for imperative handles and mutable values that don't affect rendering. **Do not use as a memoization cache.**

```typescript
// Appropriate useRef - imperative DOM handle
const inputRef = useRef<HTMLInputElement>(null);
const focusInput = () => inputRef.current?.focus();

// Improvement needed - manual memoization cache
const cacheRef = useRef<Map<string, Result>>(new Map());
const getResult = (key: string) => {
  if (!cacheRef.current.has(key)) {
    cacheRef.current.set(key, expensiveComputation(key));
  }
  return cacheRef.current.get(key);
};
// Should be: just call expensiveComputation(key) and let compiler optimize
```

## Compiler Directives

React Compiler provides directives to control compilation at the function level.

### 'use memo'

Explicitly opts a function INTO compilation. Required when using `annotation` compilation mode.

```typescript
function MyComponent() {
  "use memo";

  // Component body - will be compiled
  return <div>...</div>;
}
```

### 'use no memo'

Explicitly opts a function OUT of compilation. Use as a **last-resort escape hatch** only.

```typescript
function LegacyIntegration({ externalLib }: Props) {
  "use no memo";
  // Escape hatch: this component relies on specific re-render behavior
  // for integration with externalLib that expects mutable callbacks

  return <ExternalWidget ref={widgetRef} />;
}
```

**Important**: Always document WHY you're opting out. If you need this directive, reconsider whether the component design can be improved.

## Quick Reference

| I want to... | Do this |
|--------------|---------|
| Optimize a calculation | Just compute it inline |
| Prevent child re-renders | Remove `React.memo`, trust the compiler |
| Stabilize a callback | Define it inline, no `useCallback` needed |
| Cache expensive work | Compute inline; compiler auto-memoizes |
| Filter/sort a list | Derive inline: `items.filter(...)` |
| Store form state | Multiple `useState` calls for each field |
| Integrate external API | `useEffect` with cleanup |
| Access DOM element | `useRef` for imperative handle |

## Related Skills

- **[react-effects](../react-effects/SKILL.md)**: Complete decision tree for when useEffect is appropriate
- **[react-patterns](../react-patterns/SKILL.md)**: Form handling, error display, and component patterns

## Project Context

**Compiler configuration**: `babel-plugin-react-compiler` enabled in `apps/web/`

**Compilation mode**: `infer` (default) - compiler detects components by PascalCase + JSX, hooks by `use*` prefix

**Reference implementations**:
- Components: `apps/web/src/components/`
- UI primitives: `packages/ui/src/components/`

**When reviewing code, check for**:
- Unnecessary `useMemo`/`useCallback`/`React.memo` usage
- Derived state stored with `useState` + `useEffect`
- `useRef` used as memoization cache
- Index-based keys in dynamic lists
