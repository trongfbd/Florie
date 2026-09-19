import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
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
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Flower Shop`, template: `%s | ${SITE_NAME}` },
  description: "Mỗi bó hoa, một câu chuyện.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "vi_VN",
    title: `${SITE_NAME} — Flower Shop`,
    description: "Mỗi bó hoa, một câu chuyện.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Flower Shop`,
    description: "Mỗi bó hoa, một câu chuyện.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
