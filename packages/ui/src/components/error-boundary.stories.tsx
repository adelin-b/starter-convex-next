import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "./button";
import { ComponentErrorFallback, ErrorBoundary, PageErrorFallback } from "./error-boundary";

/**
 * ErrorBoundary component for catching React errors in component tree.
 */
const meta: Meta<typeof ErrorBoundary> = {
  title: "domain/ErrorBoundary",
  component: ErrorBoundary,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("This is a simulated error for testing");
  }
  return <div>Component rendered successfully</div>;
}

/**
 * Default error boundary with standard fallback UI.
 */
export const Default: Story = {
  render: () => {
    const [shouldThrow, setShouldThrow] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setShouldThrow(true)}>Trigger Error</Button>
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </div>
    );
  },
};

/**
 * Error boundary with component-level fallback.
 */
export const ComponentLevel: Story = {
  render: () => {
    const [shouldThrow, setShouldThrow] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setShouldThrow(true)}>Trigger Error</Button>
        <ErrorBoundary fallback={ComponentErrorFallback}>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </div>
    );
  },
};

/**
 * Error boundary with page-level fallback.
 */
export const PageLevel: Story = {
  render: () => {
    const [shouldThrow, setShouldThrow] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setShouldThrow(true)}>Trigger Error</Button>
        <ErrorBoundary fallback={PageErrorFallback}>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </div>
    );
  },
};

/**
 * Error boundary with custom fallback.
 */
export const CustomFallback: Story = {
  render: () => {
    const [shouldThrow, setShouldThrow] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setShouldThrow(true)}>Trigger Error</Button>
        <ErrorBoundary
          fallback={({ error, reset }) => (
            <div className="space-y-4 rounded-lg border-2 border-destructive/50 border-dashed p-8 text-center">
              <h3 className="font-bold text-destructive text-xl">Custom Error UI</h3>
              <p className="text-muted-foreground text-sm">{error.message}</p>
              <Button onClick={reset} variant="outline">
                Reset Component
              </Button>
            </div>
          )}
        >
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </div>
    );
  },
};

/**
 * Error boundary with error logging callback.
 */
export const WithErrorLogging: Story = {
  render: () => {
    const [shouldThrow, setShouldThrow] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleError = (error: Error) => {
      const logMessage = `[${new Date().toISOString()}] ${error.message}`;
      setLogs((prev) => [...prev, logMessage]);
      console.error("Error caught by boundary:", error);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => setShouldThrow(true)}>Trigger Error</Button>
          <Button onClick={() => setLogs([])} variant="outline">
            Clear Logs
          </Button>
        </div>

        {logs.length > 0 && (
          <div className="space-y-1 rounded-lg bg-muted p-4">
            <h4 className="font-semibold text-sm">Error Logs:</h4>
            {logs.map((log, i) => (
              <pre className="text-xs" key={i}>
                {log}
              </pre>
            ))}
          </div>
        )}

        <ErrorBoundary onError={handleError}>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </div>
    );
  },
};

/**
 * Error boundary with reset keys (resets when dependency changes).
 */
export const WithResetKeys: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    const [shouldThrow, setShouldThrow] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => setShouldThrow(true)}>Trigger Error</Button>
          <Button
            onClick={() => {
              setCount((c) => c + 1);
              setShouldThrow(false);
            }}
            variant="outline"
          >
            Reset (count: {count})
          </Button>
        </div>
        <ErrorBoundary resetKeys={[count]}>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </div>
    );
  },
};

/**
 * Multiple error boundaries protecting different sections.
 */
export const MultipleBoundaries: Story = {
  render: () => {
    const [throwFirst, setThrowFirst] = useState(false);
    const [throwSecond, setThrowSecond] = useState(false);

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Section 1</h3>
          <Button onClick={() => setThrowFirst(true)} size="sm">
            Error in Section 1
          </Button>
          <ErrorBoundary fallback={ComponentErrorFallback}>
            <div className="rounded-lg border p-4">
              <ThrowError shouldThrow={throwFirst} />
            </div>
          </ErrorBoundary>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Section 2</h3>
          <Button onClick={() => setThrowSecond(true)} size="sm">
            Error in Section 2
          </Button>
          <ErrorBoundary fallback={ComponentErrorFallback}>
            <div className="rounded-lg border p-4">
              <ThrowError shouldThrow={throwSecond} />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  },
};
