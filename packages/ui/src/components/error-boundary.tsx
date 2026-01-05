"use client";

import { AlertCircle } from "lucide-react";
import type React from "react";
import { Component, type ReactNode } from "react";
import { env } from "../env";
import { Button } from "./button";
import { Card, CardContent } from "./card";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (props: ErrorFallbackProps) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: unknown[];
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

/**
 * Error Boundary component for catching React errors in component tree.
 *
 * @example
 * // Page-level error boundary
 * <ErrorBoundary>
 *   <MyPage />
 * </ErrorBoundary>
 *
 * @example
 * // Component-level with custom fallback
 * <ErrorBoundary fallback={({ error, reset }) => (
 *   <div>Error: {error.message} <button onClick={reset}>Retry</button></div>
 * )}>
 *   <ComplexComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    if (env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught error:", error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys change
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.reset,
        });
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component with card styling
 */
function DefaultErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  fallbackMessage = "An unexpected error occurred",
  retryButtonText = "Try Again",
}: ErrorFallbackProps & {
  title?: string;
  fallbackMessage?: string;
  retryButtonText?: string;
}) {
  return (
    <Card className="border-destructive/50" data-slot="error-fallback">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div
          className="flex size-12 items-center justify-center rounded-full bg-destructive/10"
          data-slot="error-icon"
        >
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <div className="space-y-2" data-slot="error-content">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="max-w-md text-muted-foreground text-sm">
            {error.message || fallbackMessage}
          </p>
        </div>
        <Button onClick={reset} size="sm" variant="outline">
          {retryButtonText}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Lightweight error fallback for component-level errors
 */
export function ComponentErrorFallback({
  error,
  reset,
  retryButtonText = "Retry",
}: ErrorFallbackProps & { retryButtonText?: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm"
      data-slot="component-error-fallback"
    >
      <AlertCircle className="size-4 shrink-0 text-destructive" />
      <p className="flex-1 text-muted-foreground">{error.message}</p>
      <Button onClick={reset} size="sm" variant="ghost">
        {retryButtonText}
      </Button>
    </div>
  );
}

/**
 * Page-level error fallback with more prominent styling
 */
export function PageErrorFallback({
  error,
  reset,
  title = "Oops! Something went wrong",
  fallbackMessage = "An unexpected error occurred. Please try again.",
  retryButtonText = "Try Again",
  homeButtonText = "Go Home",
  errorDetailsLabel = "Error details (development only)",
}: ErrorFallbackProps & {
  title?: string;
  fallbackMessage?: string;
  retryButtonText?: string;
  homeButtonText?: string;
  errorDetailsLabel?: string;
}) {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-8"
      data-slot="page-error-fallback"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl">{title}</h1>
        <p className="max-w-md text-muted-foreground">{error.message || fallbackMessage}</p>
        {env.NODE_ENV === "development" && error.stack && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer font-medium text-sm">{errorDetailsLabel}</summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-xs">{error.stack}</pre>
          </details>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>{retryButtonText}</Button>
        <Button
          onClick={() => {
            globalThis.location.href = "/";
          }}
          variant="outline"
        >
          {homeButtonText}
        </Button>
      </div>
    </div>
  );
}
