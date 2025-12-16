/**
 * Email configuration and brand constants
 * Shared across all email templates
 */

export const emailConfig = {
  siteName: "VroomMarket",
  siteUrl: "https://starter-saas.fr",
  logoUrl: "https://starter-saas.fr/logo.png",
  supportEmail: "support@starter-saas.fr",
  socialLinks: {
    twitter: "https://twitter.com/starter-saas",
    linkedin: "https://linkedin.com/company/starter-saas",
  },
} as const;

/**
 * Brand colors matching @starter-saas/ui theme
 * These mirror the CSS variables from the UI package
 */
export const colors = {
  // Primary brand color
  primary: "#0070f3",
  primaryForeground: "#ffffff",

  // Neutral colors
  background: "#f6f9fc",
  foreground: "#1a1a1a",
  muted: "#525f7f",
  mutedForeground: "#8898aa",

  // Surface colors
  card: "#ffffff",
  cardForeground: "#1a1a1a",

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
} as const;

/**
 * Typography styles for emails
 */
export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  heading: {
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "32px",
  },
  body: {
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "24px",
  },
  small: {
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
  },
  caption: {
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "16px",
  },
} as const;

/**
 * Spacing constants
 */
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
} as const;
