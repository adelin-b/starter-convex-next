"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@starter-saas/ui/sidebar";
import { Bot, Building2, CreditCard, FileText, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryWithStatus } from "@/lib/convex-hooks";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLingui();
  const { data: hasAdminAccess } = useQueryWithStatus(api.organizations.hasAdminAccess, {});

  const navigationItems = [
    {
      title: t`Agents`,
      url: "/agents",
      icon: Bot,
    },
    {
      title: t`Scripts`,
      url: "/scripts",
      icon: FileText,
    },
    {
      title: t`Settings`,
      url: "/settings",
      icon: CreditCard,
    },
  ] as const;

  const adminItems = [
    {
      title: t`Admin`,
      url: "/admin",
      icon: Settings,
    },
    {
      title: t`Organizations`,
      url: "/admin/organizations",
      icon: Building2,
    },
    {
      title: t`Members`,
      url: "/admin/members",
      icon: Users,
    },
  ] as const;

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>
          <Trans>Organization</Trans>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {hasAdminAccess && (
        <SidebarGroup data-testid="admin-nav-section">
          <SidebarGroupLabel>
            <Trans>Administration</Trans>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link
                        data-testid={`nav-link-${item.url.replaceAll("/", "-").slice(1)}`}
                        href={item.url}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </SidebarContent>
  );
}
