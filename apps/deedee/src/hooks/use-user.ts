import { api } from "@starter-saas/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";

/**
 * Enhanced User Hook
 *
 * Features:
 * - Automatic profile creation/linking when user signs up
 * - Real-time profile updates via Convex
 * - Role and KYC status helpers
 * - TypeScript type safety
 *
 * Usage:
 * ```tsx
 * const { user, isLoading, isAdmin, isApproved } = useUser();
 *
 * if (isLoading) return <Spinner />;
 * if (!user) return <SignIn />;
 * if (isAdmin) return <AdminDashboard />;
 * if (!isApproved) return <KYCRequired />;
 * ```
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: User hook requires multiple state checks for auth, loading, profile creation, and sync. Splitting would make the hook less coherent.
export function useUser() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const betterAuthUser = session?.user;

  // Reactive query to get user data (automatically updates when data changes)
  const user = useQuery(api.users.getCurrentUser);

  // Mutation to create user if needed
  const createUser = useMutation(api.users.getOrCreateUser);

  // Handle user creation when signed in but no user exists yet
  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (!isSessionLoading && betterAuthUser && user === null) {
        try {
          await createUser();
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
    };

    createUserIfNeeded();
  }, [isSessionLoading, betterAuthUser, user, createUser]);

  // Role helpers (using globalRole from schema)
  const isUser = user?.globalRole === "user" || !user?.globalRole;
  const isAdmin = user?.globalRole === "admin" || user?.globalRole === "superadmin";
  const isSuperAdmin = user?.globalRole === "superadmin";

  // KYC status helpers
  const isPending = user?.kycStatus === "pending";
  const isApproved = user?.kycStatus === "approved";
  const isRejected = user?.kycStatus === "rejected";
  const isUnderReview = user?.kycStatus === "under_review";

  // Account status helpers
  const isActive = user?.isActive ?? false;
  const needsPasswordChange = user?.passwordChangeRequired ?? false;

  // Access control helpers
  const canAccessAdminPanel = isAdmin;
  const canAccessUserFeatures = isApproved || isAdmin; // Admins bypass KYC

  const isSignedIn = !isSessionLoading && !!betterAuthUser;

  return {
    // Core data
    user,
    userId: user?.clerkId || null,

    // Loading states
    isLoading: isSessionLoading || (isSignedIn && user === undefined),
    isSignedIn,
    isLoaded: !isSessionLoading,
    isAuthenticated: isSignedIn,

    // Role checks
    isUser,
    isAdmin,
    isSuperAdmin,

    // KYC status
    isPending,
    isApproved,
    isRejected,
    isUnderReview,
    kycStatus: user?.kycStatus || null,

    // Account status
    isActive,
    needsPasswordChange,

    // Access control
    canAccessAdminPanel,
    canAccessUserFeatures,

    // Display helpers
    displayName: user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.nickname ||
        user.username ||
        user.email ||
        "User"
      : null,
    initials: user ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "") : null,

    // Better-Auth user data passthrough
    betterAuthUser,
    imageUrl: betterAuthUser?.image,
    fullName: betterAuthUser?.name,
    firstName: user?.firstName,
    lastName: user?.lastName,
    primaryEmail: betterAuthUser?.email,

    // Auth actions
    signOut: () => authClient.signOut(),
  };
}
