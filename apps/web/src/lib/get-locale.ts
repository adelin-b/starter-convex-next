import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isValidLocale, LOCALE_COOKIE_NAME, type Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (localeCookie && isValidLocale(localeCookie)) {
    return localeCookie;
  }

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");

  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(",")[0].split("-")[0].toLowerCase();
    if (isValidLocale(preferredLocale)) {
      return preferredLocale;
    }
  }

  return DEFAULT_LOCALE;
}
