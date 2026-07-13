import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GlobalPopup } from "@/components/marketing/global-popup";
import { PixelScripts } from "@/components/marketing/pixel-scripts";
import { getSiteSettings } from "@/lib/api-server";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await getSiteSettings();

  return (
    <>
      <PixelScripts settings={siteSettings} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <GlobalPopup />
    </>
  );
}
