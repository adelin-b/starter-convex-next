"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Building2, Settings, Users } from "lucide-react";
import Link from "next/link";
import { PageLayout } from "@/components/layouts/page-layout";
import { AdminGuard } from "@/components/ui/auth-guard";

export default function AdminPage() {
  const { t } = useLingui();

  const adminSections = [
    {
      title: t`Organizations`,
      description: t`Manage organizations and their settings`,
      href: "/admin/organizations" as const,
      icon: Building2,
    },
    {
      title: t`Members`,
      description: t`View and manage organization members and roles`,
      href: "/admin/members" as const,
      icon: Users,
    },
  ];

  return (
    <AdminGuard>
      <PageLayout
        description={<Trans>Manage your organizations, members, and roles</Trans>}
        icon={Settings}
        title={<Trans>Administration</Trans>}
      >
        <div className="grid max-w-4xl gap-5 sm:grid-cols-2">
          {adminSections.map((section) => (
            <Link href={section.href} key={section.href}>
              <Card className="group h-full border-border/60 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <section.icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-[0.8125rem]">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="inline-flex items-center font-medium text-primary text-sm opacity-0 transition-opacity group-hover:opacity-100">
                    {section.href === "/admin/organizations" ? (
                      <Trans>Manage organizations →</Trans>
                    ) : (
                      <Trans>Manage members →</Trans>
                    )}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </PageLayout>
    </AdminGuard>
  );
}
