import type { ReactNode } from "react";
import { MobileBrand } from "./mobile-brand";

type AuthCardProps = {
  children: ReactNode;
};

/**
 * Glassmorphism card container for auth forms.
 * Includes mobile brand header.
 */
export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[420px] animate-slide-up-delay rounded-3xl border border-border bg-card p-10 shadow-lg backdrop-blur-xl">
      <MobileBrand />
      {children}
    </div>
  );
}
