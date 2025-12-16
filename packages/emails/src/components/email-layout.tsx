import { Body, Container, Head, Html, Img, Preview, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { colors, emailConfig, typography } from "../config";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

/**
 * Base layout component for all VroomMarket emails.
 * Provides consistent branding, header, and footer.
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header with logo */}
          <Img
            alt={emailConfig.siteName}
            height="48"
            src={emailConfig.logoUrl}
            style={styles.logo}
            width="48"
          />

          {/* Main content */}
          {children}

          {/* Footer */}
          <Text style={styles.footer}>
            &copy; {new Date().getFullYear()} {emailConfig.siteName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: colors.background,
    fontFamily: typography.fontFamily,
  },
  container: {
    backgroundColor: colors.card,
    margin: "0 auto",
    padding: "40px 20px",
    borderRadius: "8px",
    maxWidth: "480px",
  },
  logo: {
    margin: "0 auto 24px",
    display: "block" as const,
  },
  footer: {
    color: colors.mutedForeground,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    textAlign: "center" as const,
    marginTop: "32px",
  },
};
