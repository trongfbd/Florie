"use client";

import { useBanner } from "../hooks";
import { BannerForm } from "./banner-form";

export function EditBannerContent({ id }: { id: string }) {
  const { data: banner, isLoading } = useBanner(id);

  if (isLoading || !banner) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <BannerForm banner={banner} />;
}
