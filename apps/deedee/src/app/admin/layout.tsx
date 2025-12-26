"use client";

import { Alert, AlertDescription, AlertTitle } from "@starter-saas/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@starter-saas/ui/breadcrumb";
import { Button } from "@starter-saas/ui/button";
import { Separator } from "@starter-saas/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@starter-saas/ui/sidebar";
import { AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminAppSidebar } from "@/components/sidebar/admin-app-sidebar";
import { useUser } from "@/hooks/use-user";
import { ThemeSwitcher } from "@/utils/theme-switcher";

type AdminLayoutProps = {
  children: React.ReactNode;
};

/**
 * Admin Dashboard Layout
 *
 * Features:
 * - Role-based access control (admin/superadmin only)
 * - Orange/red theme
 * - Beautiful gradient backgrounds
 * - Breadcrumb navigation
 * - Automatic redirect if not admin
 */

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isSuperAdmin, isLoading } = useUser();

  // Protect admin routes
  useEffect(() => {
    if (!(isLoading || isAdmin)) {
      // Redirect to dashboard if not admin
      router.push("/dashboard");
    }
  }, [isAdmin, isLoading, router]);

  // Generate breadcrumb based on current path
  const generateBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems: Array<{ label: string; href?: string; isLast: boolean }> = [];

    // Always start with Admin
    breadcrumbItems.push({
      label: "Admin",
      href: "/admin",
      isLast: segments.length === 1,
    });

    // Add other segments
    for (let i = 1; i < segments.length; i += 1) {
      const segment = segments[i];
      const href = `/${segments.slice(0, i + 1).join("/")}`;
      const isLast = i === segments.length - 1;

      // Convert segment to readable label
      const label =
        segment
          ?.split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") || "";

      breadcrumbItems.push({
        label,
        href: isLast ? undefined : href,
        isLast,
      });
    }

    return breadcrumbItems;
  };

  const breadcrumbItems = generateBreadcrumb();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show unauthorized if not admin
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert className="max-w-lg border-red-500/50 bg-red-50/80 dark:bg-red-900/20">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
          <AlertTitle className="text-red-900 dark:text-red-300">Access Denied</AlertTitle>
          <AlertDescription className="text-red-800 dark:text-red-400">
            <p className="mb-4">You don&apos;t have permission to access the admin panel.</p>
            <Button asChild variant="destructive">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminAppSidebar />
      <SidebarInset>
        {/* Enhanced Admin Background - Orange/Red Theme */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Base gradient - warmer, more authoritative */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-red-50/30 to-amber-50/40 dark:from-slate-900 dark:via-red-950/10 dark:to-slate-900" />

          {/* Floating gradient orbs - red/orange theme */}
          <div className="-top-40 -right-40 absolute h-80 w-80 animate-float rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-50 blur-3xl" />
          <div className="-bottom-40 -left-40 absolute h-80 w-80 animate-float-slow rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-40 blur-3xl delay-1000" />
          <div className="absolute top-1/2 right-1/4 h-96 w-96 animate-float-slow rounded-full bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-30 blur-3xl delay-2000" />

          {/* Subtle pattern overlay */}
          <div className="width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg fill%3D%22%23dc2626%22 cx%3D%2230%22 cy%3D%2230%22 r%3D%221.5%22/%3E%3C/g%3E%3C/svg%3E')] absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg fill-opacity%3D%220.02%22%3E%3Ccircle opacity-40 dark:opacity-20" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <header className="flex h-16 shrink-0 items-center gap-2 border-red-500/20 border-b bg-background/50 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
              <div className="flex items-center gap-2 font-medium text-red-600 text-xs dark:text-red-400">
                <Shield className="h-4 w-4" />
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </div>
              <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
              <ThemeSwitcher />
              <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <div className="flex items-center" key={index}>
                      {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                      <BreadcrumbItem className="hidden md:block">
                        {item.isLast ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={item.href!}>{item.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 pt-4">
            {/* Page Content */}
            <div className="relative">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
