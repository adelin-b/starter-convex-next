/**
 * Storybook Story Helpers
 *
 * Reusable utilities to reduce duplication across story files
 */

import type { Meta } from "@storybook/react";
import { useState } from "react";

// ============================================================================
// Meta Builders - Reduce Meta Configuration Duplication
// ============================================================================

/**
 * Creates a standard meta configuration for UI components
 *
 * @example
 * const meta = createUIMeta(Button, {
 *   argTypes: { variant: { control: "select", options: ["default", "outline"] } }
 * });
 */
export function createUIMeta<T extends React.ComponentType>(
  component: T,
  options: Partial<Meta<T>> = {},
): Meta<T> {
  return {
    component,
    tags: ["autodocs"],
    parameters: {
      layout: "centered",
      ...options.parameters,
    },
    ...options,
  } satisfies Meta<T>;
}

/**
 * Creates meta for data table related components
 */
export function createDataTableMeta<T extends React.ComponentType>(
  component: T,
  title: string,
  options: Partial<Meta<T>> = {},
): Meta<T> {
  return createUIMeta(component, {
    title: `composite/Datatable/${title}`,
    parameters: {
      layout: "padded",
      ...options.parameters,
    },
    ...options,
  });
}

/**
 * Creates meta for form components
 */
export function createFormMeta<T extends React.ComponentType>(
  component: T,
  options: Partial<Meta<T>> = {},
): Meta<T> {
  return createUIMeta(component, {
    parameters: {
      layout: "centered",
      docs: {
        description: {
          component: "Form component with validation and state management.",
        },
      },
      ...options.parameters,
    },
    ...options,
  });
}

// ============================================================================
// ArgTypes Builders - Reduce ArgType Duplication
// ============================================================================

/**
 * Common argTypes for components with variants
 */
export const variantArgTypes = <T extends string>(variants: readonly T[]) => ({
  variant: {
    control: "select",
    options: variants,
    description: "The visual variant of the component",
  },
});

/**
 * Common argTypes for components with sizes
 */
export const sizeArgTypes = <T extends string>(sizes: readonly T[]) => ({
  size: {
    control: "select",
    options: sizes,
    description: "The size of the component",
  },
});

/**
 * Common argTypes for disabled state
 */
export const disabledArgTypes = {
  disabled: {
    control: "boolean",
    description: "Whether the component is disabled",
  },
};

/**
 * Common argTypes for className (hide from controls)
 */
export const classNameArgTypes = {
  className: {
    table: { disable: true },
  },
};

/**
 * Common argTypes for children as text
 */
export const childrenTextArgTypes = {
  children: {
    control: "text",
    description: "The content to display",
  },
};

/**
 * Hide asChild from controls (commonly used with Radix primitives)
 */
export const asChildArgTypes = {
  asChild: {
    table: { disable: true },
  },
};

/**
 * Combines multiple argTypes objects
 */
export function combineArgTypes<T extends Record<string, unknown>[]>(...argTypes: T) {
  return Object.assign({}, ...argTypes);
}

// ============================================================================
// Mock Data Generators - Reduce Test Data Duplication
// ============================================================================

/**
 * Generate mock user data for stories
 */
export function createMockUsers(count = 10) {
  return Array.from({ length: count }, (_, i) => {
    let role: string;
    if (i % 3 === 0) {
      role = "admin";
    } else if (i % 2 === 0) {
      role = "editor";
    } else {
      role = "viewer";
    }

    return {
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role,
      status: i % 2 === 0 ? "active" : "inactive",
      age: 20 + i,
      createdAt: new Date(2024, 0, i + 1).toISOString(),
    };
  });
}

/**
 * Generate mock table columns
 */
export function createMockColumns<T extends Record<string, unknown>>(
  fields: Array<keyof T & string>,
) {
  return fields.map((field, index) => ({
    id: field,
    accessorKey: field,
    header: field.charAt(0).toUpperCase() + field.slice(1),
    visible: true,
    order: index,
    pinned: false as const,
  }));
}

/**
 * Generate mock notifications
 */
export function createMockNotifications(count = 3) {
  const titles = [
    "Your call has been confirmed.",
    "You have a new message!",
    "Your subscription is expiring soon!",
    "New feature available!",
    "System maintenance scheduled",
  ];

  return Array.from({ length: Math.min(count, titles.length) }, (_, i) => ({
    id: `notification-${i + 1}`,
    title: titles[i],
    description: `${i + 1} hour${i !== 0 ? "s" : ""} ago`,
    read: i % 2 === 0,
  }));
}

/**
 * Generate mock form data
 */
export function createMockFormData() {
  return {
    name: "John Doe",
    email: "john.doe@example.com",
    message: "This is a test message",
    agreeToTerms: false,
  };
}

// ============================================================================
// Interactive Story Helpers - Reduce useState/Handler Duplication
// ============================================================================

/**
 * Hook for managing column state in data table stories
 */
export function useColumnState<T>(initialColumns: T[]) {
  const [columns, setColumns] = useState(initialColumns);

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumns((prev) =>
      prev.map((col: T) =>
        (col as { id: string }).id === columnId ? ({ ...col, visible } as T) : col,
      ),
    );
  };

  const handleColumnOrderChange = (columnId: string, newOrder: number) => {
    setColumns((prev) =>
      prev.map((col: T) =>
        (col as { id: string }).id === columnId ? ({ ...col, order: newOrder } as T) : col,
      ),
    );
  };

  const handleColumnPinChange = (columnId: string, pinned: "left" | "right" | false) => {
    setColumns((prev) =>
      prev.map((col: T) =>
        (col as { id: string }).id === columnId ? ({ ...col, pinned } as T) : col,
      ),
    );
  };

  return {
    columns,
    setColumns,
    handlers: {
      onColumnVisibilityChange: handleColumnVisibilityChange,
      onColumnOrderChange: handleColumnOrderChange,
      onColumnPinChange: handleColumnPinChange,
    },
  };
}

/**
 * Hook for managing form state in stories
 */
export function useFormState<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", values);
  };

  return {
    values,
    errors,
    setErrors,
    handleChange,
    handleSubmit,
  };
}

/**
 * Hook for managing selection state (checkboxes, rows, etc.)
 */
export function useSelectionState<T extends string | number = string>(initialSelection: T[] = []) {
  const [selected, setSelected] = useState<T[]>(initialSelection);

  const handleToggle = (item: T) => {
    setSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleSelectAll = (items: T[]) => {
    setSelected(items);
  };

  const handleClearAll = () => {
    setSelected([]);
  };

  return {
    selected,
    isSelected: (item: T) => selected.includes(item),
    handleToggle,
    handleSelectAll,
    handleClearAll,
  };
}

/**
 * Hook for managing dialog/modal state
 */
export function useDialogState(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  return {
    open,
    onOpenChange: setOpen,
    onClose: () => setOpen(false),
    onOpen: () => setOpen(true),
  };
}

// ============================================================================
// Story Templates - Reduce Render Function Duplication
// ============================================================================

/**
 * Creates a story with interactive column management
 */
export function createColumnManagementStory<T>(
  Component: React.ComponentType<{
    columns: T[];
    onColumnVisibilityChange?: (id: string, visible: boolean) => void;
    onColumnOrderChange?: (id: string, order: number) => void;
    onColumnPinChange?: (id: string, pinned: "left" | "right" | false) => void;
  }>,
  initialColumns: T[],
) {
  return () => {
    const { columns, handlers } = useColumnState(initialColumns);

    return (
      <div className="space-y-4">
        <Component columns={columns} {...handlers} />
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Column State:</h3>
          <pre className="text-xs">{JSON.stringify(columns, null, 2)}</pre>
        </div>
      </div>
    );
  };
}

/**
 * Creates a story with form state management
 */
export function createFormStory<T extends Record<string, unknown>>(
  Component: React.ComponentType<{
    values: T;
    errors?: Partial<Record<keyof T, string>>;
    onChange?: (name: keyof T, value: unknown) => void;
    onSubmit?: (e: React.FormEvent) => void;
  }>,
  initialValues: T,
) {
  return () => {
    const { values, errors, handleChange, handleSubmit } = useFormState(initialValues);

    return (
      <Component errors={errors} onChange={handleChange} onSubmit={handleSubmit} values={values} />
    );
  };
}

// ============================================================================
// Component Wrappers - Common Story Decorators
// ============================================================================

/**
 * Wrapper for stories that need padding
 */
export function PaddedDecorator({ children }: { children: React.ReactNode }) {
  return <div className="p-8">{children}</div>;
}

/**
 * Wrapper for stories that need a max width container
 */
export function ContainerDecorator({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl p-8">{children}</div>;
}

/**
 * Wrapper for stories that need a dark background
 */
export function DarkBackgroundDecorator({ children }: { children: React.ReactNode }) {
  return <div className="dark bg-background p-8">{children}</div>;
}

/**
 * Wrapper for data table stories with realistic container
 */
export function DataTableDecorator({ children }: { children: React.ReactNode }) {
  return <div className="h-[600px] w-full max-w-7xl p-6">{children}</div>;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a delay for async story interactions
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates an API call for interactive stories
 */
export async function simulateApiCall<T>(data: T, delayMs = 1000): Promise<T> {
  await delay(delayMs);
  return data;
}

/**
 * Creates a standard play function for testing interactions
 */
export function createPlayFunction(
  interactions: (context: { canvasElement: HTMLElement }) => Promise<void>,
) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await interactions({ canvasElement });
  };
}
