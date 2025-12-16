"use client";

import { SiGoogle } from "@icons-pack/react-simple-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@starter-saas/ui/button";
import { Loader2 } from "lucide-react";

type GoogleSignInButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
};

/**
 * Shared Google sign-in button with loading state.
 * Used by both sign-in and sign-up forms.
 */
export function GoogleSignInButton({ onClick, isLoading, disabled }: GoogleSignInButtonProps) {
  const { t } = useLingui();

  return (
    <Button
      aria-busy={isLoading}
      aria-label={t`Sign in with Google`}
      className="w-full"
      disabled={disabled || isLoading}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      {isLoading ? (
        <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <SiGoogle aria-hidden="true" className="mr-2 h-4 w-4" />
      )}
      {isLoading ? <Trans>Connecting...</Trans> : <Trans>Google</Trans>}
    </Button>
  );
}
