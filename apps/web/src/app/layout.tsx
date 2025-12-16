import { cn } from "@starter-saas/ui/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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

export const metadata: Metadata = {
  title: {
    default: "VroomMarket",
    template: "%s | VroomMarket",
  },
  description: "Vehicle marketplace for organizations",
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
        {/* biome-ignore lint/style/noProcessEnv: Server component dev script check */}
        {process.env.NODE_ENV === "development" && (
          <>
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/@react-grab/claude-code/dist/client.global.js"
              strategy="lazyOnload"
            />
          </>
        )}
        <script async crossOrigin="anonymous" src="https://tweakcn.com/live-preview.min.js" />
      </head>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased")}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
