"use client";

import { Settings } from "lucide-react";
import { PageLayout } from "@/components/layouts/page-layout";
import { SubscriptionStatus } from "@/features/billing";

export default function SettingsPage() {
  return (
    <PageLayout
      description="Manage your account settings and subscription"
      icon={Settings}
      title="Settings"
    >
      <div className="max-w-2xl space-y-6">
        <SubscriptionStatus />
      </div>
    </PageLayout>
  );
}
