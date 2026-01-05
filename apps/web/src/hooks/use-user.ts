import { api } from "@starter-saas/backend/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { authClient } from "@/lib/auth/client";

/**
 * Enhanced User Hook
 *
 * Features:
 * - Real-time user data via Convex (user created automatically by Better-Auth)
 * - TypeScript type safety
 *
 * Usage:
 * ```tsx
 * const { user, isLoading, isAdmin } = useUser();
 *
 * if (isLoading) return <Spinner />;
 * if (!user) return <SignIn />;
 * ```
 */
export function useUser() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const betterAuthUser = session?.user;

  // Reactive query to get user data (automatically updates when data changes)
  // Users are created automatically by Better-Auth database hooks
  const user = useQuery(api.auth.getCurrentUser);

  // Admin check - using admins table in Convex
  const admins = useQuery(api.admins.isAdmin);
  const isAdmin = admins ?? false;
  const isSuperAdmin = false; // SuperAdmin requires separate check if needed

  const isSignedIn = !isSessionLoading && !!betterAuthUser;

  // Parse name into first/last if available
  const nameParts = (user?.name || betterAuthUser?.name || "").trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    // Core data
    user,
    userId: user?.userId || betterAuthUser?.id || null,

    // Loading states
    isLoading: isSessionLoading || (isSignedIn && user === undefined),
    isSignedIn,
    isLoaded: !isSessionLoading,
    isAuthenticated: isSignedIn,

    // Role checks
    isUser: !isAdmin,
    isAdmin,
    isSuperAdmin,

    // Access control (simplified - no KYC in this schema)
    canAccessAdminPanel: isAdmin,
    canAccessUserFeatures: isSignedIn,

    // Display helpers
    displayName: user?.name || betterAuthUser?.name || betterAuthUser?.email || "User",
    fullName: user?.name || betterAuthUser?.name || null,
    firstName,
    lastName,
    initials: firstName ? (firstName[0] || "") + (lastName[0] || "") : null,

    // Better-Auth user data passthrough
    betterAuthUser,
    imageUrl: user?.image || betterAuthUser?.image,
    primaryEmail: user?.email || betterAuthUser?.email,

    // Auth actions
    signOut: () => authClient.signOut(),
  };
}
