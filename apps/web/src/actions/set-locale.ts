"use server";

import { cookies } from "next/headers";
import { isValidLocale, LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n";

export async function setLocale(locale: Locale) {
  // Defense-in-depth: validate even though type enforces Locale
  if (!isValidLocale(locale)) {
    throw new Error("Please select a valid language option.");
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return locale;
}
