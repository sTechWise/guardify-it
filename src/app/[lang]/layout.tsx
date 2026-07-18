import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AuthRedirectHandler from "@/components/AuthRedirectHandler";

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
    default: "Guardify IT — Premium Digital Security Subscriptions",
    template: "%s | Guardify IT",
  },
  description:
    "Bangladesh's trusted marketplace for genuine antivirus, VPN, and Windows licenses. Affordable digital protection delivered instantly.",
  keywords: [
    "antivirus Bangladesh",
    "VPN subscription",
    "Windows license",
    "digital security",
    "Guardify IT",
    "software subscription",
    "genuine license",
  ],
  metadataBase: new URL("https://guardifyit.com"),
  openGraph: {
    title: "Guardify IT — Premium Digital Security Subscriptions",
    description:
      "Bangladesh's trusted marketplace for genuine antivirus, VPN, and Windows licenses.",
    type: "website",
    locale: "en_US",
    siteName: "Guardify IT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guardify IT — Premium Digital Security Subscriptions",
    description:
      "Bangladesh's trusted marketplace for genuine antivirus, VPN, and Windows licenses.",
  },
  icons: {
    icon: "/logo-v3.png",
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "100vh",
                    }}
                  >
                    <AuthRedirectHandler />
                    <Navbar dict={dict} />
                    <main style={{ flex: 1 }}>{children}</main>
                    <Footer />
                    <WhatsAppButton />
                  </div>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
