"use client";

import type { Messages } from "@lingui/core";
import { i18n } from "@lingui/core";
import { I18nProvider as LinguiProvider } from "@lingui/react";
import type { ReactNode } from "react";
import { useLayoutEffect, useMemo } from "react";
import { z } from "zod";
import { en, fr } from "zod/locales";
import type { Locale } from "@/lib/i18n";

const zodLocales: Record<Locale, () => Parameters<typeof z.config>[0]> = { en, fr };

type IntlProviderProps = {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
};

export function IntlProvider({ locale, messages, children }: IntlProviderProps) {
  // Activate i18n synchronously during render (before first paint)
  // This ensures SSR has translations available immediately
  useMemo(() => {
    i18n.load({ [locale]: messages });
    i18n.activate(locale);
  }, [locale, messages]);

  // useLayoutEffect for client-side updates (locale changes, Zod sync)
  useLayoutEffect(() => {
    // Sync Zod validation error messages with current locale
    z.config(zodLocales[locale]());
  }, [locale]);

  return <LinguiProvider i18n={i18n}>{children}</LinguiProvider>;
}
