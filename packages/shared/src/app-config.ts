/**
 * Centralized application configuration
 *
 * This file contains all branding and app identity settings.
 * Update these values when setting up a new project using the setup wizard.
 *
 * @see setup.ts for automated configuration
 */

export const appConfig = {
  /** Display name shown in UI, emails, and metadata */
  name: "Starter SaaS",

  /** Short description for SEO and metadata */
  description: "Your premium SaaS application",

  /** Package scope used in imports (without @) */
  scope: "starter-saas",

  /** Social media and contact links */
  links: {
    twitter: "https://twitter.com/your-app",
    linkedin: "https://linkedin.com/company/your-app",
    github: "https://github.com/your-org/your-app",
  },
} as const;

export type AppConfig = typeof appConfig;
