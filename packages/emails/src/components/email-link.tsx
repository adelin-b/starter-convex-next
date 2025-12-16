import { Link } from "@react-email/components";
import { colors } from "../config";

type EmailLinkProps = {
  href: string;
  children: React.ReactNode;
};

/**
 * Link component for emails.
 * Styled to match @starter-saas/ui link styles.
 */
export function EmailLink({ href, children }: EmailLinkProps) {
  return (
    <Link href={href} style={styles.link}>
      {children}
    </Link>
  );
}

const styles = {
  link: {
    color: colors.primary,
    textDecoration: "underline",
    wordBreak: "break-all" as const,
  },
};
