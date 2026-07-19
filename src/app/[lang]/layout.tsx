import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import LayoutShell from "@/components/LayoutShell";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Guardify IT — Affordable Digital Subscriptions in Bangladesh",
    template: "%s | Guardify IT",
  },
  description:
    "Buy ChatGPT Plus, Canva Pro, Netflix, LinkedIn Premium and more at the lowest prices in Bangladesh. Fast delivery via WhatsApp.",
  keywords: [
    "ChatGPT Plus Bangladesh",
    "Canva Pro cheap",
    "Netflix subscription BD",
    "LinkedIn Premium Bangladesh",
    "Guardify IT",
    "software subscription Bangladesh",
    "Microsoft 365 cheap",
  ],
  metadataBase: new URL("https://guardifyit.com"),
  openGraph: {
    title: "Guardify IT — Affordable Digital Subscriptions in Bangladesh",
    description:
      "Buy ChatGPT Plus, Canva Pro, Netflix, LinkedIn Premium and more at the lowest prices in Bangladesh.",
    type: "website",
    locale: "en_US",
    siteName: "Guardify IT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guardify IT — Affordable Digital Subscriptions in Bangladesh",
    description:
      "Buy ChatGPT Plus, Canva Pro, Netflix, LinkedIn Premium and more at the lowest prices in Bangladesh.",
  },
  icons: {
    icon: "/logo-v3.png",
  },
  alternates: {
    canonical: "https://guardifyit.com/en",
    languages: {
      "en-US": "https://guardifyit.com/en",
      "bn-BD": "https://guardifyit.com/bn",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { i18n, type Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionary";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const validLang = (lang === "bn" ? "bn" : "en") as Locale;
  const dict = await getDictionary(validLang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": "Guardify IT",
                        "image": "https://guardifyit.com/logo-v3.png",
                        "@id": "https://guardifyit.com/#localbusiness",
                        "url": "https://guardifyit.com",
                        "telephone": "+880 1997-118118",
                        "address": {
                          "@type": "PostalAddress",
                          "streetAddress": "Dhaka, Bangladesh",
                          "addressLocality": "Dhaka",
                          "postalCode": "1200",
                          "addressCountry": "BD"
                        },
                        "priceRange": "$$",
                        "openingHoursSpecification": {
                          "@type": "OpeningHoursSpecification",
                          "dayOfWeek": [
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday"
                          ],
                          "opens": "00:00",
                          "closes": "23:59"
                        }
                      })
                    }}
                  />
                  <LayoutShell dict={dict}>
                    {children}
                  </LayoutShell>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
