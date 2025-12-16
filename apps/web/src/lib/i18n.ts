import type { Messages } from "@lingui/core";
import {
  DEFAULT_LOCALE as SHARED_DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from "@starter-saas/shared/i18n-types";

export const LOCALES = SUPPORTED_LOCALES;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = SHARED_DEFAULT_LOCALE;
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

/**
 * Load Lingui message catalog for a locale
 * .po files are processed by @lingui/loader via Turbopack rules
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  try {
    // @lingui/loader transforms .po files to JS modules with { messages } export
    const catalog = await import(`@/locales/${locale}.po`);
    return catalog.messages;
  } catch (error) {
    // If non-default locale fails, fall back to default locale
    if (locale !== DEFAULT_LOCALE) {
      console.warn(`[i18n] Failed to load "${locale}", falling back to "${DEFAULT_LOCALE}"`);
      return loadMessages(DEFAULT_LOCALE);
    }
    // Default locale failed - this is critical, surface the error
    throw new Error(
      `[i18n] Critical: Failed to load default locale "${DEFAULT_LOCALE}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export {
  isSupportedLocale as isValidLocale,
  LOCALE_NAMES as localeNames,
} from "@starter-saas/shared/i18n-types";
