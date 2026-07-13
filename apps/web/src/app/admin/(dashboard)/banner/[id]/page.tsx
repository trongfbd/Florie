import type { Metadata } from "next";
import { EditBannerContent } from "@/features/admin-banners/components/edit-banner-content";

export const metadata: Metadata = { title: "Sửa banner", robots: { index: false } };

interface EditBannerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa banner</h1>
      <EditBannerContent id={id} />
    </div>
  );
}
