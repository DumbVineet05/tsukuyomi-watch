import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthProvider } from "@/lib/auth/auth-context";
import { AuthModal } from "@/components/auth/AuthModal";
import { PetalBreeze } from "@/components/ui/PetalBreeze";
import { EarthIntroSplash } from "@/components/ui/EarthIntroSplash";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Japanese-inspired celestial guide for stargazing conditions, astronomy events, and astronomical image restoration.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-full antialiased`}
    >
      <body className="starfield flex min-h-screen flex-col font-sans">
        <AuthProvider>
          <EarthIntroSplash />
          <PetalBreeze />
          <SiteHeader />
          <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>
          <SiteFooter />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
