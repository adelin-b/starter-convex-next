import "@/globals.css";
import { Toaster } from "@starter-saas/ui/toaster";
import { TooltipProvider } from "@starter-saas/ui/tooltip";
import { cn } from "@starter-saas/ui/utils";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ConvexClientProvider } from "./convex-client-provider";

export const metadata: Metadata = {
  title: "DeeDee AI - Voice Agent Platform",
  description:
    "AI-powered call center automation and agent enhancement platform built with Next.js, Better-Auth, and Convex backend.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className={cn(`${GeistSans.variable} ${GeistMono.variable}`, "h-full antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <TooltipProvider delayDuration={0}>
            <ConvexClientProvider>
              <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
            </ConvexClientProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
