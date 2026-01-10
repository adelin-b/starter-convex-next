import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign In | Starter SaaS",
    template: "%s | Starter SaaS",
  },
  description: "Sign in to access your account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auth layout provides metadata only - styling is in components using Tailwind
  // Root layout already provides html, body, and Providers
  return <>{children}</>;
}
