import { Button } from "@react-email/components";
import { colors, typography } from "../config";

type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
};

/**
 * Primary action button for emails.
 * Styled to match @starter-saas/ui Button component.
 */
export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button href={href} style={styles.button}>
      {children}
    </Button>
  );
}

const styles = {
  button: {
    backgroundColor: colors.primary,
    borderRadius: "6px",
    color: colors.primaryForeground,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block" as const,
    padding: "12px 24px",
  },
};
