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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Link href={section.href} key={section.href}>
              <Card className="h-full transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {section.href === "/admin/organizations" ? (
                      <Trans>Click to manage organizations</Trans>
                    ) : (
                      <Trans>Click to manage members</Trans>
                    )}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </PageLayout>
    </AdminGuard>
  );
}
