"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadImage, type UploadFolder } from "@/lib/uploads-api";
import { getErrorMessage } from "@/lib/get-error-message";

export function ImageUploadField({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const { url } = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(getErrorMessage(err, "Tải ảnh thất bại — vui lòng thử lại."));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-heading">{label}</label>

      {value && (
        <div className="relative h-28 w-28 overflow-hidden rounded-lg border-2 border-secondary bg-secondary">
          <Image src={value} alt="" fill sizes="112px" className="object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-secondary px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-secondary">
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {isUploading ? "Đang tải..." : value ? "Đổi ảnh" : "Tải ảnh lên"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Hoặc dán URL ảnh"
          className="min-w-0 flex-1 rounded-lg border-2 border-secondary px-3 py-2 text-xs text-foreground/70 outline-none focus:border-accent"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
