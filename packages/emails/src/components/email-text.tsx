import { Text } from "@react-email/components";
import { colors, typography } from "../config";

type EmailTextProps = {
  children: React.ReactNode;
};

/**
 * Body text component for emails.
 * Styled to match @starter-saas/ui typography.
 */
export function EmailText({ children }: EmailTextProps) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = {
  text: {
    color: colors.muted,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    margin: "0 0 16px",
  },
};
