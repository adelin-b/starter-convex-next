import type { ReactNode } from "react";

type AuthPageLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

/**
 * Shared layout for authentication pages (sign-in, sign-up)
 * Provides consistent styling and structure across auth pages
 */
export function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Centered title section */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-bold text-4xl text-white tracking-tight">{title}</h1>
          <p className="text-lg text-slate-300">{subtitle}</p>
        </div>

        {/* Centered auth component */}
        <div className="flex justify-center">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
