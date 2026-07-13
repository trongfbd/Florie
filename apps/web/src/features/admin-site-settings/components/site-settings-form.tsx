"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useSiteSettings, useUpdateSiteSettings } from "../hooks";
import type { SiteSettingsFormInput } from "../types";

export function SiteSettingsForm() {
  const { data: settings, isLoading } = useSiteSettings();
  const mutation = useUpdateSiteSettings();

  const { register, handleSubmit, reset } = useForm<SiteSettingsFormInput>();

  useEffect(() => {
    if (settings) {
      reset({
        facebookPixelId: settings.facebookPixelId ?? "",
        googleAnalyticsId: settings.googleAnalyticsId ?? "",
        googleTagManagerId: settings.googleTagManagerId ?? "",
      });
    }
  }, [settings, reset]);

  if (isLoading) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  function onSubmit(values: SiteSettingsFormInput) {
    mutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Facebook Pixel ID</label>
        <input
          {...register("facebookPixelId")}
          placeholder="VD: 123456789012345"
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Google Analytics 4 Measurement ID</label>
        <input
          {...register("googleAnalyticsId")}
          placeholder="VD: G-XXXXXXX"
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Google Tag Manager Container ID</label>
        <input
          {...register("googleTagManagerId")}
          placeholder="VD: GTM-XXXXXXX"
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {mutation.isSuccess && <p className="text-sm text-success">✓ Đã lưu.</p>}
      {mutation.isError && <p className="text-sm text-destructive">Có lỗi xảy ra — vui lòng thử lại.</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {mutation.isPending ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
