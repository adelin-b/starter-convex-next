/**
 * Email configuration and brand constants
 * Shared across all email templates
 */

// biome-ignore lint/style/noProcessEnv: email config requires env access at module level
const SITE_URL = process.env.SITE_URL || "http://localhost:3001";
// biome-ignore lint/style/noProcessEnv: email config requires env access at module level
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@example.com";

export const emailConfig = {
  siteName: "Starter SaaS",
  siteUrl: SITE_URL,
  logoUrl: `${SITE_URL}/assets/logos/logo-small.png`,
  supportEmail: EMAIL_FROM,
  socialLinks: {
    twitter: "https://twitter.com/your-app",
    linkedin: "https://linkedin.com/company/your-app",
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
