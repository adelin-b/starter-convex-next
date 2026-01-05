"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

/**
 * Redirect from old /admin/organizations/[id]/members to new /admin/organizations/[id]?tab=members
 * This maintains backward compatibility for existing links and bookmarks.
 */
export default function OrganizationMembersRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/organizations/${id}?tab=members`);
  }, [id, router]);

  return null;
}
