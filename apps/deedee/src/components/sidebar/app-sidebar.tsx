"use client";

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
} from "@starter-saas/ui/sidebar";
import {
  BarChart3,
  BookOpen,
  Bot,
  CreditCard,
  Globe,
  History,
  MessageSquare,
  Phone,
  PhoneCall,
  Settings2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { useUser } from "@/hooks/use-user";

const data = {
  teams: [
    {
      name: "My Organization",
      logo: Globe,
      plan: "Premium",
    },
  ],
  navGroups: [
    {
      label: "BUILD",
      items: [
        {
          title: "SDR Copilot",
          url: "/dashboard/sdr-copilot",
          icon: Sparkles,
        },
        {
          title: "Agents",
          url: "/dashboard/agents",
          icon: Bot,
        },
        {
          title: "Knowledge Base",
          url: "/dashboard/knowledge-base",
          icon: BookOpen,
        },
      ],
    },
    {
      label: "DEPLOY",
      items: [
        {
          title: "Phone Numbers",
          url: "/dashboard/phone-numbers",
          icon: Phone,
        },
        {
          title: "Batch Call",
          url: "/dashboard/batch-call",
          icon: PhoneCall,
        },
      ],
    },
    {
      label: "MONITOR",
      items: [
        {
          title: "Call History",
          url: "/dashboard/call-history",
          icon: History,
        },
        {
          title: "Chat History",
          url: "/dashboard/chat-history",
          icon: MessageSquare,
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        {
          title: "Billing",
          url: "/dashboard/billing",
          icon: CreditCard,
        },
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: Settings2,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { fullName, firstName, primaryEmail, imageUrl } = useUser();
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  // Transform user data to match NavUser expected format
  const userData =
    fullName || primaryEmail
      ? {
          name: fullName || firstName || primaryEmail || "User",
          email: primaryEmail || "",
          avatar: imageUrl || "",
        }
      : null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
