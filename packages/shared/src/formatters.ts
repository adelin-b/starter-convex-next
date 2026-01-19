/**
 * Common formatting utilities.
 */

/**
 * Format seconds to mm:ss display string.
 * @example formatDuration(65) // "1:05"
 * @example formatDuration(3661) // "61:01"
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format a number with locale-specific thousand separators.
 * @example formatNumber(1234567) // "1 234 567" (fr-FR)
 * @example formatNumber(1234567, "en-US") // "1,234,567"
 */
export function formatNumber(value: number, locale = "fr-FR"): string {
  return value.toLocaleString(locale);
}

/**
 * Format a currency amount with proper symbol placement.
 * Returns "-" for undefined values.
 * @example formatCurrency(1500) // "1 500 €" (fr-FR, EUR)
 * @example formatCurrency(undefined) // "-"
 * @example formatCurrency(1500, "USD", "en-US") // "$1,500"
 */
export function formatCurrency(
  amount: number | undefined,
  currency = "EUR",
  locale = "fr-FR",
): string {
  if (amount === undefined) {
    return "-";
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a mileage value with km suffix.
 * @example formatMileage(125000) // "125 000 km" (fr-FR)
 */
export function formatMileage(km: number, locale = "fr-FR"): string {
  return `${formatNumber(km, locale)} km`;
}

/**
 * Format timestamp to long date format.
 * Returns "-" for undefined values.
 * @example formatDate(1704326400000) // "4 janvier 2024" (fr-FR)
 * @example formatDate(undefined) // "-"
 */
export function formatDate(timestamp: number | undefined, locale = "fr-FR"): string {
  if (timestamp === undefined) {
    return "-";
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(new Date(timestamp));
}

/**
 * Format timestamp to short date (dd/mm/yyyy).
 * Returns empty string for undefined values.
 * @example formatShortDate(1704326400000) // "04/01/2024" (fr-FR)
 * @example formatShortDate(undefined) // ""
 */
export function formatShortDate(timestamp: number | undefined, locale = "fr-FR"): string {
  if (timestamp === undefined) {
    return "";
  }
  return new Date(timestamp).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format timestamp to date with time.
 * @example formatDateTime(1704326400000) // "04 janvier 2024 à 14:00" (fr-FR)
 */
export function formatDateTime(timestamp: number, locale = "fr-FR"): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format ISO date string to month + year format.
 * @example formatMonthYear("2020-06-15") // "juin 2020" (fr-FR)
 * @example formatMonthYear("2020-06-15", "en-US") // "June 2020"
 */
export function formatMonthYear(isoDate: string, locale = "fr-FR"): string {
  return new Date(isoDate).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

/**
 * Format relative time using Intl.RelativeTimeFormat.
 * @example formatRelativeTime(Date.now() + 60000) // "in 1 minute"
 * @example formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 */
export function formatRelativeTime(timestamp: number, locale = "fr-FR"): string {
  const now = Date.now();
  const diffMs = timestamp - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, "second");
  }
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  return rtf.format(diffDays, "day");
}
