"use client";

import { Trans } from "@lingui/react/macro";

/**
 * Visual divider with "Or continue with" text.
 * Used between email/password form and social login buttons.
 */
export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="flex-1 border-t" />
      <span className="text-muted-foreground text-xs uppercase">
        <Trans>Or continue with</Trans>
      </span>
      <div className="flex-1 border-t" />
    </div>
  );
}
