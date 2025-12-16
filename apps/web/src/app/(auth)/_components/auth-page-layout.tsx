import type { ReactNode } from "react";
import { AuthCard } from "./auth-card";
import { AuthVisualPanel } from "./auth-visual-panel";

type AuthPageLayoutProps = {
  children: ReactNode;
};

/**
 * Two-column auth page layout.
 * Left: Visual panel (desktop only)
 * Right: Form panel
 */
export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-background lg:grid-cols-2">
      {/* Left visual panel - hidden on mobile */}
      <AuthVisualPanel />

      {/* Right form panel */}
      <div className="relative flex animate-fade-in items-center justify-center p-8">
        <AuthCard>{children}</AuthCard>
      </div>
    </div>
  );
}
