"use client";

import { DashboardMain } from "@starter-saas/ui/dashboard-layout";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { ThemeSwitcher } from "@/utils/theme-switcher";

export default function SettingsPage() {
  return (
    <DashboardMain>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Settings</PageHeaderTitle>
          <PageHeaderDescription>Manage your application preferences</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="rounded-lg border p-6">
          <h3 className="mb-1 font-medium text-sm">Appearance</h3>
          <p className="mb-4 text-muted-foreground text-xs">Customize the look and feel</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Theme</p>
              <p className="text-muted-foreground text-xs">Select your preferred color theme</p>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </DashboardMain>
  );
}
