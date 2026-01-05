import type { ReactNode } from "react";
import { DevQuickLogin } from "@/features/auth/components/dev-quick-login";
import { AuthCard } from "./auth-card";
import { AuthVisualPanel } from "./auth-visual-panel";

type AuthPageLayoutProps = {
  children: ReactNode;
  callbackUrl?: string;
};

/**
 * Two-column auth page layout.
 * Left: Visual panel (desktop only)
 * Right: Form panel (with dev quick login in development)
 */
export function AuthPageLayout({ children, callbackUrl }: AuthPageLayoutProps) {
  return (
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-background lg:grid-cols-2">
      {/* Left visual panel - hidden on mobile */}
      <AuthVisualPanel />

      {/* Right form panel */}
      <div className="relative flex animate-fade-in flex-col items-center justify-center gap-4 p-8">
        <AuthCard>{children}</AuthCard>
        <div className="w-full max-w-[420px]">
          <DevQuickLogin callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
