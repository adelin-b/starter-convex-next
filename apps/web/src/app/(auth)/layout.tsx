import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign In | VroomMarket",
    template: "%s | VroomMarket",
  },
  description: "Sign in to VroomMarket - Your premium vehicle marketplace",
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
