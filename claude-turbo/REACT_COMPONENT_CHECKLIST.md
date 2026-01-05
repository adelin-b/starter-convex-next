# React Component Checklist

A comprehensive checklist for building production-ready React components with TypeScript, Next.js, and Convex.

## Data & State

- [ ] **Fetches data** (Server Component, useQuery, fetch)
- [ ] **Manages local state** (useState, useReducer)
- [ ] **Manages form state** (react-hook-form)
- [ ] **Syncs with URL** (nuqs, searchParams)
- [ ] **Reads global state** (Context, Zustand)
- [ ] **Writes global state** (Context setter, Zustand actions)
- [ ] **Optimistic updates** (useOptimistic, manual rollback)
- [ ] **Real-time updates** (Convex subscriptions, WebSocket)

## User Input & Validation

- [ ] **Accepts user input** (text, select, checkbox, etc)
- [ ] **Validates input** (Zod schema, custom validators)
- [ ] **Client-side validation** (onChange, onBlur)
- [ ] **Server-side validation** (mutation validation)
- [ ] **Shows validation errors** (inline, toast, summary)
- [ ] **Sanitizes input** (XSS prevention, trim, normalize)
- [ ] **Rate limiting** (debounce, throttle, backend rate limit)
- [ ] **Auto-save** (debounced, on blur, periodic)

## Loading & Async States

- [ ] **Shows loading state** (initial load)
- [ ] **Shows skeleton** (layout placeholder)
- [ ] **Shows spinner** (button, inline action)
- [ ] **Shows progress bar** (multi-step, upload)
- [ ] **Shows pulse/shimmer** (subtle loading)
- [ ] **Suspense boundary** (Server Component loading)
- [ ] **Lazy loads** (code-split, dynamic import)
- [ ] **Prefetches data** (hover, route prefetch)

## Error Handling

- [ ] **Has error boundary** (React error boundary wrapper)
- [ ] **Shows error state** (dedicated error UI)
- [ ] **Logs errors** (console, analytics, Sentry)
- [ ] **Retry mechanism** (manual retry button)
- [ ] **Fallback UI** (graceful degradation)
- [ ] **Error recovery** (reset state, reload data)
- [ ] **Network error handling** (offline, timeout)
- [ ] **Validation errors** (field-level, form-level)

## Empty States

- [ ] **Zero state** (first-time user, no setup)
- [ ] **No results** (search/filter empty)
- [ ] **No data** (empty list/table after load)
- [ ] **Deleted state** (item was removed)
- [ ] **Permission denied** (unauthorized empty state)
- [ ] **Call-to-action** (button to create first item)

## Accessibility (a11y)

- [ ] **Keyboard navigation** (Tab, Enter, Escape, Arrows)
- [ ] **Focus management** (autoFocus, focus trap, focus restore)
- [ ] **ARIA labels** (aria-label, aria-labelledby)
- [ ] **ARIA states** (aria-expanded, aria-selected, aria-invalid)
- [ ] **ARIA live regions** (aria-live for dynamic content)
- [ ] **Semantic HTML** (button, nav, main, article)
- [ ] **Screen reader text** (VisuallyHidden component)
- [ ] **Color contrast** (4.5:1 minimum ratio)
- [ ] **Touch targets** (44x44px minimum on mobile)
- [ ] **Skip links** (skip to main content)

## Responsive Design

- [ ] **Mobile layout** (base styles, touch-friendly)
- [ ] **Tablet layout** (md: breakpoint)
- [ ] **Desktop layout** (lg: breakpoint)
- [ ] **Large desktop** (xl:, 2xl: breakpoints)
- [ ] **Container queries** (@container for component-level)
- [ ] **Orientation handling** (portrait vs landscape)
- [ ] **Viewport awareness** (useMediaQuery, matchMedia)
- [ ] **Responsive typography** (clamp, fluid sizing)

## Visual Variants

- [ ] **Visual variants** (default, outline, ghost, destructive)
- [ ] **Size variants** (xs, sm, md, lg, xl)
- [ ] **State variants** (hover, active, disabled, loading)
- [ ] **Color variants** (primary, secondary, accent)
- [ ] **Uses CVA** (class-variance-authority)
- [ ] **Compound variants** (combinations of variants)

## Theme & Styling

- [ ] **Dark mode support** (works in light + dark)
- [ ] **System preference** (respects prefers-color-scheme)
- [ ] **Theme toggle** (manual override)
- [ ] **CSS variables** (uses semantic tokens)
- [ ] **Tailwind classes** (utility-first styling)
- [ ] **Custom CSS** (scoped styles when needed)
- [ ] **Print styles** (optimized for printing)

## Animation

- [ ] **Enter animation** (fade in, slide in)
- [ ] **Exit animation** (fade out, slide out)
- [ ] **Layout animation** (Framer layoutId)
- [ ] **Hover effects** (scale, underline, color)
- [ ] **Focus effects** (ring, outline)
- [ ] **Transition** (smooth state changes)
- [ ] **AnimatePresence** (mount/unmount animations)
- [ ] **Reduced motion** (respects prefers-reduced-motion)
- [ ] **Gesture support** (drag, swipe, pinch)
- [ ] **Spring physics** (natural motion)

## AI Features

- [ ] **AI autocomplete** (text suggestions)
- [ ] **AI chat** (conversational interface)
- [ ] **AI edit** (rewrite, improve content)
- [ ] **AI generation** (create from prompt)
- [ ] **AI analysis** (summarize, extract)
- [ ] **Streaming response** (token-by-token display)
- [ ] **Fallback mode** (works without AI)
- [ ] **Model selection** (choose AI provider)

## Interactivity

- [ ] **Click handler** (onClick)
- [ ] **Double click** (onDoubleClick)
- [ ] **Right click** (onContextMenu, context menu)
- [ ] **Hover** (onMouseEnter, onMouseLeave)
- [ ] **Focus/Blur** (onFocus, onBlur)
- [ ] **Drag and drop** (dnd-kit, native)
- [ ] **Touch gestures** (swipe, pinch, long-press)
- [ ] **Copy to clipboard** (navigator.clipboard)
- [ ] **Share** (navigator.share Web Share API)
- [ ] **File upload** (input file, drag-drop)

## Navigation

- [ ] **Internal links** (Next.js Link)
- [ ] **External links** (rel="noopener noreferrer")
- [ ] **Back button** (router.back, custom history)
- [ ] **Breadcrumbs** (navigation trail)
- [ ] **Tabs** (Radix Tabs, custom)
- [ ] **Pagination** (page numbers, next/prev)
- [ ] **Infinite scroll** (load more on scroll)
- [ ] **Scroll to top** (smooth scroll button)

## Search & Filter

- [ ] **Search input** (text search)
- [ ] **Debounced search** (wait for typing to stop)
- [ ] **Filter controls** (checkboxes, select, radio)
- [ ] **Sort controls** (asc/desc, multiple fields)
- [ ] **Clear filters** (reset to default)
- [ ] **Filter chips** (show active filters)
- [ ] **URL sync** (filters in query params)
- [ ] **Faceted search** (counts per filter option)

## Performance

- [ ] **Memoized** (React.memo for pure components)
- [ ] **useMemo** (expensive calculations)
- [ ] **useCallback** (stable function references)
- [ ] **Virtual scrolling** (large lists >100 items)
- [ ] **Lazy loading images** (loading="lazy")
- [ ] **Code splitting** (React.lazy, dynamic import)
- [ ] **Prefetching** (hover prefetch, route prefetch)
- [ ] **Bundle analysis** (track component size)
- [ ] **Render optimization** (avoid unnecessary re-renders)

## TypeScript

- [ ] **Props interface** (exported TypeScript interface)
- [ ] **Generic props** (<T extends Record<string, any>>)
- [ ] **Ref forwarding** (forwardRef<HTMLElement>)
- [ ] **Discriminated union** (type safety with variants)
- [ ] **Strict typing** (no any, handle null/undefined)
- [ ] **Type inference** (infer from Zod, CVA)
- [ ] **Type exports** (export types separately)

## Testing & Quality

- [ ] **Test IDs** (data-testid for E2E)
- [ ] **Unit tests** (Vitest, Jest)
- [ ] **E2E tests** (Playwright critical paths)
- [ ] **Storybook story** (3+ examples)
- [ ] **Accessibility tests** (axe, lighthouse)
- [ ] **Visual regression** (Chromatic, Percy)
- [ ] **Mock data** (factory functions)
- [ ] **Test isolation** (works standalone)

## Documentation

- [ ] **JSDoc comments** (description, params, returns)
- [ ] **Usage examples** (code snippets)
- [ ] **Props table** (auto-generated from TS)
- [ ] **Guidelines** (when to use, when not)
- [ ] **A11y notes** (keyboard, screen reader)
- [ ] **Migration guide** (from old version)
- [ ] **Playground** (interactive Storybook)

## Analytics & Tracking

- [ ] **Event tracking** (button clicks, form submits)
- [ ] **Page view tracking** (auto or manual)
- [ ] **Error tracking** (Sentry, LogRocket)
- [ ] **Performance tracking** (Web Vitals)
- [ ] **User flow tracking** (funnels, conversions)
- [ ] **A/B test ready** (variant prop)
- [ ] **Privacy compliant** (GDPR, no PII)

## Security

- [ ] **XSS prevention** (sanitize dangerouslySetInnerHTML)
- [ ] **CSRF protection** (tokens in forms)
- [ ] **Input sanitization** (backend validation)
- [ ] **Content Security Policy** (inline script restrictions)
- [ ] **Rate limiting** (prevent abuse)
- [ ] **Authentication check** (protected routes/actions)
- [ ] **Authorization check** (role-based access)
- [ ] **Secrets protected** (no API keys in client code)

## Internationalization (i18n)

- [ ] **Text externalized** (no hardcoded strings)
- [ ] **Translation function** (t('key'))
- [ ] **Plural handling** (singular/plural forms)
- [ ] **Date formatting** (Intl.DateTimeFormat)
- [ ] **Number formatting** (Intl.NumberFormat)
- [ ] **Currency formatting** (locale-aware)
- [ ] **RTL support** (right-to-left languages)
- [ ] **Locale switching** (language selector)

## Composition Patterns

- [ ] **Compound components** (Form.Field, Card.Header)
- [ ] **Render props** (children as function)
- [ ] **Slot props** (leftSlot, rightSlot)
- [ ] **Polymorphic** (asChild, as prop)
- [ ] **Controlled** (value + onChange)
- [ ] **Uncontrolled** (defaultValue + ref)
- [ ] **Headless** (logic separated from UI)

## Export Structure

- [ ] **Named export** (export const Component)
- [ ] **Default export** (export default Component)
- [ ] **Sub-components** (export { Component.Header })
- [ ] **Hooks** (export { useComponent })
- [ ] **Types** (export type { ComponentProps })
- [ ] **Utils** (export { helper functions })
- [ ] **Constants** (export { DEFAULT_VALUES })

## Integration Points

- [ ] **Convex integration** (useQuery, useMutation)
- [ ] **Clerk integration** (useUser, useAuth)
- [ ] **CopilotKit integration** (useCopilotAction)
- [ ] **Form integration** (react-hook-form Controller)
- [ ] **Router integration** (useRouter, useParams)
- [ ] **Analytics integration** (track events)
- [ ] **Error service** (Sentry capture)

---

## Component Template

```typescript
"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@v1/ui/utils";

// Variants
const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "", outline: "", ghost: "" },
      size: { sm: "", md: "", lg: "" },
      state: { default: "", loading: "", error: "" },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default"
    },
  }
);

/**
 * Component description
 *
 * @example
 * ```tsx
 * <Component variant="outline" size="lg">
 *   Content
 * </Component>
 * ```
 */
export interface ComponentProps
  extends ComponentPropsWithoutRef<"div">,
    VariantProps<typeof componentVariants> {
  // Data
  data?: unknown;

  // Loading
  loading?: boolean;
  loadingVariant?: "skeleton" | "spinner";

  // AI
  aiEnabled?: boolean;

  // Animation
  layoutId?: string;

  // Accessibility
  "aria-label"?: string;
  "data-testid"?: string;

  // Error
  error?: Error | null;
  onRetry?: () => void;
}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  (
    {
      className,
      variant,
      size,
      state,
      loading,
      error,
      children,
      ...props
    },
    ref
  ) => {
    // Loading state
    if (loading) {
      return <ComponentSkeleton variant={variant} size={size} />;
    }

    // Error state
    if (error) {
      return <ComponentError error={error} onRetry={props.onRetry} />;
    }

    // Main render
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, state }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Component.displayName = "Component";
```

## File Organization

```
components/component-name/
├── index.tsx                 # Main component export
├── component-name.tsx        # Implementation
├── component-name.stories.tsx # Storybook stories
├── component-name.test.tsx   # Unit tests
├── schema.ts                 # Zod validation
├── types.ts                  # TypeScript types
├── hooks/
│   ├── use-component.ts      # Main logic hook
│   ├── use-component-query.ts # Data fetching
│   └── use-component-submit.ts # Submit handler
├── variants/
│   ├── loading.tsx           # Loading states
│   ├── error.tsx             # Error states
│   └── empty.tsx             # Empty states
├── ai/
│   ├── autocomplete.tsx      # AI autocomplete (lazy)
│   ├── chat.tsx              # AI chat (lazy)
│   └── edit.tsx              # AI edit (lazy)
├── animations.ts             # Framer Motion variants
├── utils.ts                  # Helper functions
└── constants.ts              # Static values
```

## Quick Reference

### Essential Checklist (Minimum Viable Component)

- [ ] TypeScript props interface
- [ ] Loading state
- [ ] Error state
- [ ] Dark mode support
- [ ] Mobile responsive
- [ ] ARIA labels
- [ ] data-testid
- [ ] JSDoc documentation

### Production Checklist (Production-Ready Component)

All Essential items, plus:

- [ ] Storybook stories
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Analytics tracking
- [ ] i18n support
- [ ] Security validation
- [ ] Accessibility audit passed

### Advanced Checklist (Library-Quality Component)

All Production items, plus:

- [ ] Multiple variants
- [ ] Compound components
- [ ] Headless mode
- [ ] Animation support
- [ ] AI integration
- [ ] Visual regression tests
- [ ] Comprehensive documentation
