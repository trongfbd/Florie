import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GlobalPopup } from "@/components/marketing/global-popup";
import { PixelScripts } from "@/components/marketing/pixel-scripts";
import { getActivePopup, getSiteSettings } from "@/lib/api-server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: { default: "Florie — Flower Shop", template: "%s | Florie" },
  description: "Mỗi bó hoa, một câu chuyện.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [popup, siteSettings] = await Promise.all([getActivePopup(), getSiteSettings()]);

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground font-sans">
        <PixelScripts settings={siteSettings} />
        <AppProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <GlobalPopup popup={popup} />
        </AppProviders>
      </body>
    </html>
  );
}
