"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { SubscriptionStatus } from "@/features/billing";

export default function SettingsPage() {
  return (
    <div className="container space-y-6 py-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Settings</PageHeaderTitle>
          <PageHeaderDescription>
            Manage your account settings and subscription
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <div className="grid max-w-2xl gap-6">
        <SubscriptionStatus />
      </div>
    </div>
  );
}
