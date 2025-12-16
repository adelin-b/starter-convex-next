import { Heading } from "@react-email/components";
import { colors, typography } from "../config";

type EmailHeadingProps = {
  children: React.ReactNode;
};

/**
 * Email heading component.
 * Styled to match @starter-saas/ui typography.
 */
export function EmailHeading({ children }: EmailHeadingProps) {
  return <Heading style={styles.heading}>{children}</Heading>;
}

const styles = {
  heading: {
    color: colors.foreground,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.heading.lineHeight,
    textAlign: "center" as const,
    margin: "0 0 24px",
  },
};
