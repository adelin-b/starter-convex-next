"use client";

import { DashboardMain } from "@starter-saas/ui/dashboard-layout";

export default function ProfilePage() {
  return (
    <DashboardMain>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="text-muted-foreground">Profile management coming soon.</div>
      </div>
    </DashboardMain>
  );
}
