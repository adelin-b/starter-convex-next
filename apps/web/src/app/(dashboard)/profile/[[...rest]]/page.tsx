"use client";

import { ConvexProfile } from "@/components/profile/convex-profile";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="font-bold text-2xl tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Content */}
      <ConvexProfile />
    </div>
  );
}
