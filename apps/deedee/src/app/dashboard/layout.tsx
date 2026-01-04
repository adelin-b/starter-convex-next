"use client";

import { CopilotKit } from "@copilotkit/react-core";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { AgentBreadcrumbOverride } from "@/components/breadcrumb/agent-breadcrumb-override";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import "@copilotkit/react-ui/styles.css";

// CopilotKit is only enabled when agent name is configured
const COPILOT_ENABLED = !!process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME;

function CopilotWrapper({ children }: { children: ReactNode }) {
  if (!COPILOT_ENABLED) {
    return <>{children}</>;
  }
  return <CopilotKit runtimeUrl="/api/copilotkit">{children}</CopilotKit>;
}

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [agentNames, setAgentNames] = useState<Record<string, string>>({});

  // Generate breadcrumb based on current path
  const generateBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);

    // Start with Dashboard, then add other segments
    const dashboardItem = {
      label: "Dashboard",
      href: "/dashboard",
      isLast: segments.length === 1,
    };

    // Map remaining segments to breadcrumb items
    const additionalItems = segments.slice(1).map((segment, index) => {
      const segmentIndex = index + 1;
      const href = `/${segments.slice(0, segmentIndex + 1).join("/")}`;
      const isLast = segmentIndex === segments.length - 1;

      // Convert segment to readable label
      let label =
        segment
          ?.split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") || "";

      // Override with agent name if this segment is an agent ID
      if (agentNames[segment]) {
        label = agentNames[segment];
      }

      return {
        label,
        href: isLast ? undefined : href,
        isLast,
      };
    });

    return [dashboardItem, ...additionalItems];
  };

  const handleAgentNameLoad = (agentId: string, agentName: string) => {
    setAgentNames((prev) => ({ ...prev, [agentId]: agentName }));
  };

  const breadcrumbItems = generateBreadcrumb();

  // Determine if we should show back button (depth > 2, e.g., /dashboard/agents/new)
  const showBackButton = breadcrumbItems.length > 2;

  const handleBack = () => {
    router.back();
  };

  return (
    <AuthWrapper>
      <CopilotWrapper>
        <AgentBreadcrumbOverride onAgentNameLoad={handleAgentNameLoad} />
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  className="mr-2 data-[orientation=vertical]:h-4"
                  orientation="vertical"
                />
                {showBackButton && (
                  <>
                    <Button
                      className="h-7 w-7"
                      onClick={handleBack}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Separator
                      className="mr-2 data-[orientation=vertical]:h-4"
                      orientation="vertical"
                    />
                  </>
                )}
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
            <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-0">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </CopilotWrapper>
    </AuthWrapper>
  );
}
