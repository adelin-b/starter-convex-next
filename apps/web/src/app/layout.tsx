import { cn } from "@starter-saas/ui/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "@starter-saas/ui/globals.css";
import Providers from "@/components/providers/providers";
import { getLocale } from "@/lib/get-locale";
import { loadMessages } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Starter SaaS",
    template: "%s | Starter SaaS",
  },
  description: "Your premium SaaS application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await loadMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Dev tools loaded via DevToolsLoader component to avoid duplicate script loading */}
      </head>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          playfairDisplay.variable,
          "antialiased",
        )}
      >
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
