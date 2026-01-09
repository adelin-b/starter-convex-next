---
name: react-effects
description: >-
  Use when writing or reviewing React components that use useEffect. Guides
  avoiding unnecessary effects by choosing the right alternative. Based on React
  docs: https://react.dev/learn/you-might-not-need-an-effect
targets:
  - '*'
---
# Writing React Effects Skill

Guides writing React components that avoid unnecessary `useEffect` calls.

## Core Principle

> Effects are an escape hatch for synchronizing with **external systems** (network, DOM, third-party widgets). If there's no external system, you don't need an Effect.

Source: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

## Decision Flowchart

When you see or write `useEffect`, ask:

```
Is this synchronizing with an EXTERNAL system?
├─ YES → useEffect is appropriate
│   Examples: WebSocket, browser API subscription, third-party library
│
└─ NO → Don't use useEffect. Use alternatives:
    │
    ├─ Transforming data for render?
    │   → Calculate during render (inline or useMemo)
    │
    ├─ Handling user event?
    │   → Move logic to event handler
    │
    ├─ Expensive calculation?
    │   → useMemo (not useEffect + setState)
    │
    ├─ Resetting state when prop changes?
    │   → Pass different `key` to component
    │
    ├─ Adjusting state when prop changes?
    │   → Calculate during render or rethink data model
    │
    ├─ Subscribing to external store?
    │   → useSyncExternalStore
    │
    └─ Fetching data?
        → Framework data fetching, React Query, or custom hook with cleanup
```

## Anti-Patterns to Detect

| Anti-Pattern | Problem | Alternative |
|--------------|---------|-------------|
| `useEffect` + `setState` from props/state | Causes extra re-render | Compute during render |
| `useEffect` to filter/sort data | Unnecessary effect cycle | Derive inline or `useMemo` |
| `useEffect` for click/submit handlers | Loses event context | Event handler |
| `useEffect` to notify parent | Breaks unidirectional flow | Call in event handler |
| `useEffect` with empty deps for init | Runs twice in dev; conflates app init with mount | Module-level code or `didInit` flag |
| `useEffect` for browser subscriptions | Error-prone cleanup | `useSyncExternalStore` |

## Examples

### Anti-Pattern 1: Filtering in Effect

```typescript
// ❌ BAD - unnecessary effect cycle
function SearchResults({ items, query }) {
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    setFiltered(items.filter(item => item.name.includes(query)));
  }, [items, query]);

  return <List items={filtered} />;
}

// ✅ GOOD - compute during render
function SearchResults({ items, query }) {
  const filtered = items.filter(item => item.name.includes(query));
  return <List items={filtered} />;
}

// ✅ GOOD - useMemo for expensive computations
function SearchResults({ items, query }) {
  const filtered = useMemo(
    () => items.filter(item => item.name.includes(query)),
    [items, query]
  );
  return <List items={filtered} />;
}
```

### Anti-Pattern 2: Event Handling in Effect

```typescript
// ❌ BAD - loses event context, adds complexity
function Form() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      sendAnalytics("form_submit");
      setSubmitted(false);
    }
  }, [submitted]);

  return <button onClick={() => setSubmitted(true)}>Submit</button>;
}

// ✅ GOOD - event handler
function Form() {
  const handleSubmit = () => {
    sendAnalytics("form_submit");
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Anti-Pattern 3: Resetting State on Prop Change

```typescript
// ❌ BAD - effect to reset state
function ProfileEditor({ userId }) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment(""); // Reset when user changes
  }, [userId]);

  return <input value={comment} onChange={e => setComment(e.target.value)} />;
}

// ✅ GOOD - key prop forces remount
function ProfilePage({ userId }) {
  return <ProfileEditor key={userId} userId={userId} />;
}

function ProfileEditor({ userId }) {
  const [comment, setComment] = useState("");
  return <input value={comment} onChange={e => setComment(e.target.value)} />;
}
```

### Anti-Pattern 4: Notifying Parent

```typescript
// ❌ BAD - effect to notify parent
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange]);

  return <button onClick={() => setIsOn(!isOn)}>Toggle</button>;
}

// ✅ GOOD - notify in event handler
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  const handleClick = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange(newValue);
  };

  return <button onClick={handleClick}>Toggle</button>;
}
```

### Anti-Pattern 5: App Initialization

```typescript
// ❌ BAD - runs twice in StrictMode, conflates mount with init
function App() {
  useEffect(() => {
    initializeAnalytics();
    loadUser();
  }, []);
}

// ✅ GOOD - module-level for true one-time init
let didInit = false;

function App() {
  useEffect(() => {
    if (didInit) return;
    didInit = true;
    initializeAnalytics();
  }, []);
}

// ✅ EVEN BETTER - module-level code (outside component)
if (typeof window !== "undefined") {
  initializeAnalytics();
}
```

## When useEffect IS Appropriate

- **External system sync**: WebSocket connections, third-party widgets
- **Subscriptions with cleanup**: Browser APIs (resize, online/offline)
- **Data fetching**: With proper cleanup for race conditions
- **DOM measurements**: Reading layout after render (`getBoundingClientRect`)
- **Non-React code integration**: jQuery plugins, vanilla JS libraries

```typescript
// ✅ GOOD - syncing with external system
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
}

// ✅ GOOD - browser API subscription with useSyncExternalStore
function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("online", callback);
      window.addEventListener("offline", callback);
      return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
      };
    },
    () => navigator.onLine,
    () => true // SSR fallback
  );
}
```

## React Compiler (React 19+)

React Compiler automatically memoizes components, hooks, and expensive calculations. This changes best practices significantly.

### What's No Longer Needed

```typescript
// ❌ OLD WAY - manual memoization
import { useMemo, useCallback, memo } from "react";

const ExpensiveComponent = memo(function ExpensiveComponent({ data, onClick }) {
  const processedData = useMemo(() => expensiveProcessing(data), [data]);
  const handleClick = useCallback((item) => onClick(item.id), [onClick]);
  return <List items={processedData} onClick={handleClick} />;
});

// ✅ NEW WAY - let compiler optimize
function ExpensiveComponent({ data, onClick }) {
  const processedData = expensiveProcessing(data);
  const handleClick = (item) => onClick(item.id);
  return <List items={processedData} onClick={handleClick} />;
}
```

### Compiler Handles Automatically

| Manual Hook | Compiler Alternative |
|-------------|---------------------|
| `useMemo(() => expensive(x), [x])` | Just write `expensive(x)` |
| `useCallback(fn, [deps])` | Just write `fn` |
| `React.memo(Component)` | Just write `Component` |

### When Manual Memoization Still Works

If you have existing `useMemo`/`useCallback` with **complete** dependencies, the compiler respects them:

```typescript
// ✅ Valid - compiler preserves this
const filtered = useMemo(
  () => data.filter(filter),
  [data, filter] // All dependencies included
);

// ❌ Invalid - missing dependency breaks compiler optimization
const filtered = useMemo(
  () => data.filter(filter),
  [data] // Missing 'filter' - compiler can't optimize
);
```

### Core Principle Unchanged

The compiler eliminates `useMemo`/`useCallback` but **useEffect rules remain the same**:
- Don't use `useEffect` for derived state
- Don't use `useEffect` for event handling
- Only use `useEffect` for external system synchronization

Source: [React Compiler Introduction](https://react.dev/learn/react-compiler/introduction)

## useEffectEvent (Experimental)

For Effects that need to read latest props/state without re-running, use `useEffectEvent`:

```typescript
import { useEffect, useEffectEvent } from "react";

function Page({ url, shoppingCart }) {
  // ❌ BAD - Effect re-runs when shoppingCart changes
  useEffect(() => {
    logVisit(url, shoppingCart.length);
  }, [url, shoppingCart]);

  // ✅ GOOD - useEffectEvent reads latest value without dependency
  const onVisit = useEffectEvent((visitedUrl) => {
    logVisit(visitedUrl, shoppingCart.length); // Always reads latest shoppingCart
  });

  useEffect(() => {
    onVisit(url);
  }, [url]); // Only re-runs when url changes
}
```

### When to Use

| Scenario | Solution |
|----------|----------|
| Effect needs latest value but shouldn't re-run for it | `useEffectEvent` |
| Logging analytics with current state | `useEffectEvent` |
| Callback that Effect calls with latest props | `useEffectEvent` |

### Installation (Experimental)

```bash
# Required for useEffectEvent
npm install react@experimental react-dom@experimental
npm install eslint-plugin-react-hooks@experimental
```

Source: [useEffectEvent Reference](https://react.dev/reference/react/experimental_useEffectEvent)

## Quick Reference

| I want to... | Use... |
|--------------|--------|
| Transform props/state for render | Compute during render (compiler handles caching) |
| Cache expensive calculation | Just compute it (compiler handles memoization) |
| Reset state when prop changes | `key` prop on component |
| Handle user interaction | Event handler |
| Subscribe to external store | `useSyncExternalStore` |
| Sync with external system | `useEffect` with cleanup |
| Fetch data | Framework solution / React Query / hook with cleanup |
| Read latest value in Effect without re-running | `useEffectEvent` (experimental) |

## ESLint Plugin

Enforce these patterns automatically with [eslint-plugin-react-you-might-not-need-an-effect](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect):

```bash
bun add -D eslint-plugin-react-you-might-not-need-an-effect
```

```javascript
// eslint.config.js
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";

export default [
  {
    plugins: {
      "react-you-might-not-need-an-effect": reactYouMightNotNeedAnEffect,
    },
    rules: {
      "react-you-might-not-need-an-effect/you-might-not-need-an-effect": "warn",
    },
  },
];
```

This catches common anti-patterns like `useEffect` + `setState` from props/state.
