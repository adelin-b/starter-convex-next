/**
 * Supported locales for the application.
 * Used by both apps/web and packages/emails for consistent i18n.
 */
export const SUPPORTED_LOCALES = ["en", "fr"] as const;

/**
 * Type representing a valid locale string.
 */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Default locale used when no preference is specified.
 */
export const DEFAULT_LOCALE: SupportedLocale = "en";

/**
 * Human-readable names for each locale.
 */
export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: "English",
  fr: "Français",
};

/**
 * Type guard to check if a string is a valid locale.
 *
 * @example
 * isSupportedLocale("en") // true
 * isSupportedLocale("de") // false
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Get the best matching locale from a list of preferred locales.
 * Falls back to DEFAULT_LOCALE if no match is found.
 *
 * @example
 * getBestLocale(["fr-FR", "en-US"]) // "fr"
 * getBestLocale(["de-DE"]) // "en" (default)
 */
export function getBestLocale(preferredLocales: string[]): SupportedLocale {
  for (const locale of preferredLocales) {
    const lang = locale.split("-")[0];
    if (isSupportedLocale(lang)) {
      return lang;
    }
  }
  return DEFAULT_LOCALE;
}
