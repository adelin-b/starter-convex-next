"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@starter-saas/ui/avatar";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@starter-saas/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@starter-saas/ui/sidebar";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Crown,
  Database,
  FileText,
  Home,
  Key,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

/**
 * Admin App Sidebar
 *
 * Features:
 * - Orange/red theme (warmer, more authoritative)
 * - Crown branding for admin
 * - User management section
 * - System settings section
 * - Switch to user dashboard link
 * - SuperAdmin-only sections
 */

// Admin navigation structure
const getAdminNavData = (_isSuperAdmin: boolean) => ({
  main: [
    {
      title: "Admin Dashboard",
      url: "/admin",
      icon: Home,
      subtitle: "Overview",
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: Users,
      subtitle: "Manage Users",
    },
    {
      title: "KYC Reviews",
      url: "/admin/kyc-reviews",
      icon: Shield,
      subtitle: "Verify Users",
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: BarChart3,
      subtitle: "Analytics",
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: Bell,
      subtitle: "Send Updates",
    },
  ],
  system: [
    {
      title: "Database",
      url: "/admin/database",
      icon: Database,
      subtitle: "View Data",
      superAdminOnly: true,
    },
    {
      title: "System Settings",
      url: "/admin/settings",
      icon: Settings,
      subtitle: "Configuration",
      superAdminOnly: true,
    },
    {
      title: "API Keys",
      url: "/admin/api-keys",
      icon: Key,
      subtitle: "Manage Keys",
      superAdminOnly: true,
    },
    {
      title: "Logs",
      url: "/admin/logs",
      icon: FileText,
      subtitle: "System Logs",
      superAdminOnly: true,
    },
  ],
});

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Sidebar component requires conditional rendering for collapsed state, role-based sections, and user data handling
export function AdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { signOut, isSuperAdmin, displayName, initials, fullName, imageUrl, primaryEmail } =
    useUser();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Get navigation items
  const navData = getAdminNavData(isSuperAdmin);

  // Transform user data
  const userData =
    displayName || fullName || primaryEmail
      ? {
          name: displayName || fullName || "Admin",
          email: primaryEmail || "",
          avatar: imageUrl || "",
          initials: initials || "A",
        }
      : null;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUserDashboard = () => {
    router.push("/");
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="relative flex h-full flex-col">
        {/* Admin gradient background - orange/red theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-red-500/10 dark:from-orange-900/20 dark:via-red-900/10 dark:to-slate-900" />

        {/* Subtle pattern overlay */}
        <div className="width%3D%2240%22 height%3D%2240%22 viewBox%3D%220 0 40 40%22 xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg fill%3D%22%23dc2626%22 cx%3D%2220%22 cy%3D%2220%22 r%3D%221%22/%3E%3C/g%3E%3C/svg%3E')] absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg fill-opacity%3D%220.03%22%3E%3Ccircle opacity-40 dark:opacity-20" />

        <SidebarHeader>
          <div
            className={cn(
              "relative flex items-center gap-4 px-4 py-6",
              isCollapsed && "justify-center px-2",
            )}
          >
            {/* Admin Logo Container */}
            {isCollapsed ? (
              // Collapsed state - Crown icon
              <div className="group relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 via-orange-500 to-red-600 shadow-md transition-all dark:from-red-600 dark:via-orange-500 dark:to-red-500">
                  <Crown className="h-4 w-4 text-white drop-shadow-sm" />
                </div>
                <div className="-z-10 absolute inset-0 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 blur-sm transition-all group-hover:blur-md" />
              </div>
            ) : (
              <div className="w-full">
                <div className="rounded-xl border border-red-400/30 bg-white/80 p-4 shadow-xl backdrop-blur-xl dark:border-red-500/40 dark:bg-slate-800/80">
                  <div className="text-center">
                    {/* Crown Icon */}
                    <div className="mb-2 flex justify-center">
                      <Crown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="mb-1 bg-gradient-to-r from-red-600 via-orange-600 to-red-500 bg-clip-text font-semibold text-transparent text-xl dark:from-red-500 dark:via-orange-400 dark:to-red-400">
                      Admin Panel
                    </div>
                    <div className="font-medium text-[10px] text-slate-600 uppercase tracking-[0.15em] dark:text-slate-400">
                      System Management
                    </div>
                    {isSuperAdmin && (
                      <Badge
                        className="mt-2 border-red-500/50 text-red-600 text-xs dark:text-red-400"
                        variant="outline"
                      >
                        Super Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Admin Navigation */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                Administration
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {navData.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.subtitle}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Link className="flex items-center gap-3" href={item.url as any}>
                      <item.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        {!isCollapsed && item.subtitle && (
                          <div className="text-muted-foreground text-xs">{item.subtitle}</div>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* System Section (SuperAdmin only) */}
          {isSuperAdmin && (
            <>
              <SidebarSeparator className="my-4" />
              <SidebarGroup>
                {!isCollapsed && (
                  <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    System
                  </SidebarGroupLabel>
                )}
                <SidebarMenu>
                  {navData.system
                    .filter((item) => !item.superAdminOnly || isSuperAdmin)
                    .map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.subtitle}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <Link className="flex items-center gap-3" href={item.url as any}>
                            <item.icon className="h-5 w-5" />
                            <div className="flex-1">
                              <div className="font-medium">{item.title}</div>
                              {!isCollapsed && item.subtitle && (
                                <div className="text-muted-foreground text-xs">{item.subtitle}</div>
                              )}
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroup>
            </>
          )}

          {/* User Dashboard Access */}
          {!isCollapsed && (
            <div className="mt-auto px-4 pb-4">
              <Button
                className="w-full justify-start gap-3 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 transition-all hover:border-amber-500/50"
                onClick={handleUserDashboard}
                variant="outline"
              >
                <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm">User Dashboard</div>
                  <div className="text-muted-foreground text-xs">Switch View</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )}
        </SidebarContent>

        <SidebarFooter>
          {userData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={cn(
                    "h-auto w-full justify-start gap-3 py-3",
                    isCollapsed && "justify-center px-2",
                  )}
                  variant="ghost"
                >
                  <Avatar className="h-8 w-8 border-2 border-red-500/50">
                    <AvatarImage alt={userData.name} src={userData.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 font-medium text-white text-xs">
                      {userData.initials}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 overflow-hidden text-left">
                      <div className="truncate font-medium text-sm">{userData.name}</div>
                      <div className="flex items-center gap-1 truncate text-muted-foreground text-xs">
                        <Shield className="h-3 w-3" />
                        Admin
                      </div>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" side="top" sideOffset={8}>
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleUserDashboard}>
                    <User className="mr-2 h-4 w-4" />
                    User Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Link className="cursor-pointer" href={"/profile" as any}>
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Link className="cursor-pointer" href={"/admin/settings" as any}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>

        <SidebarRail />
      </div>
    </Sidebar>
  );
}
