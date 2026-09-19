import type { Metadata, Viewport } from "next";

// Wraps every /admin/* route (the dashboard group, dang-nhap, hoa-don) purely
// to scope PWA metadata to admin only — the storefront keeps no manifest/
// apple-mobile-web-app tags. "Add to Home Screen" on iOS reads these to
// launch full-screen, without Safari's chrome, as its own app icon.
export const metadata: Metadata = {
  manifest: "/admin.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Bèo Admin",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#e88aa2",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
