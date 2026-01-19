"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@starter-saas/ui/avatar";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getInitials } from "@/lib/user-utils";

type UserCellWithLinkProps<T extends string> = {
  /** User data from better-auth, or null if not found */
  user: { name: string; email: string; image: string | null } | null;
  /** Fallback ID to display when user is null */
  userId: string;
  /** Link href for the user cell (typed dynamic route) */
  linkHref: Route<T>;
  /** Render as plain text without link */
  linkless?: false;
};

type UserCellLinklessProps = {
  /** User data from better-auth, or null if not found */
  user: { name: string; email: string; image: string | null } | null;
  /** Fallback ID to display when user is null */
  userId: string;
  /** Render as plain text without link */
  linkless: true;
};

type UserCellProps<T extends string> = UserCellWithLinkProps<T> | UserCellLinklessProps;

/**
 * User cell component for DataTable columns.
 * Displays avatar, name, and email with optional link.
 * Reusable across organization members and members list pages.
 *
 * @example
 * // In a DataTable column definition
 * cell: ({ row }) => (
 *   <UserCell
 *     user={row.original.user}
 *     userId={row.original.userId}
 *     linkHref={`/admin/members/${row.original._id}`}
 *   />
 * )
 */
export function UserCell<T extends string>(props: UserCellProps<T>) {
  const { user, userId, linkless } = props;

  // Helper to get content (avatar and user info)
  const getContent = (userData: NonNullable<typeof user>): ReactNode => {
    const initials = getInitials(userData.name);
    return (
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          {userData.image && <AvatarImage alt={userData.name} src={userData.image} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{userData.name}</span>
          <span className="text-muted-foreground text-xs">{userData.email}</span>
        </div>
      </div>
    );
  };

  // Linkless mode - no navigation
  if (linkless) {
    if (!user) {
      return <span className="text-muted-foreground text-sm">{userId}</span>;
    }
    return getContent(user);
  }

  // Link mode - extract href and render with link
  const { linkHref } = props as UserCellWithLinkProps<T>;

  if (!user) {
    return (
      <Link className="text-muted-foreground text-sm hover:underline" href={linkHref}>
        {userId}
      </Link>
    );
  }

  return (
    <Link className="flex items-center gap-2 hover:underline" href={linkHref}>
      {getContent(user)}
    </Link>
  );
}
