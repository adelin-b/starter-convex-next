/**
 * Validate callback URL to prevent open redirect attacks.
 * Only allows relative paths that start with "/" and are not protocol-relative.
 *
 * @example
 * isValidCallbackUrl("/vehicles") // true
 * isValidCallbackUrl("/admin/users") // true
 * isValidCallbackUrl("//evil.com") // false (protocol-relative)
 * isValidCallbackUrl("https://evil.com") // false (absolute URL)
 */
export function isValidCallbackUrl(url: string): boolean {
  // Must start with / and not be protocol-relative (//evil.com)
  return url.startsWith("/") && !url.startsWith("//");
}

/**
 * Get a safe callback URL, falling back to a default if invalid.
 * Logs a warning when a potentially malicious URL is rejected.
 */
export function getSafeCallbackUrl(url: string | null | undefined, defaultUrl = "/agents"): string {
  if (url && isValidCallbackUrl(url)) {
    return url;
  }
  // Log rejected URLs for security monitoring (potential open redirect attempts)
  if (url) {
    console.warn("[AUTH] Rejected invalid callback URL:", url);
  }
  return defaultUrl;
}
