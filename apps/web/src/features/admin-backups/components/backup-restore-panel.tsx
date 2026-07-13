"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Download, Loader2, UploadCloud } from "lucide-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { useDownloadBackup, useRestoreBackup } from "../hooks";

const CONFIRMATION_PHRASE = "XAC-NHAN-KHOI-PHUC-DU-LIEU";

export function BackupRestorePanel() {
  const downloadMutation = useDownloadBackup();
  const restoreMutation = useRestoreBackup();

  const [file, setFile] = useState<File | null>(null);
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = !!file && typedConfirmation === CONFIRMATION_PHRASE;

  function resetRestoreForm() {
    setFile(null);
    setTypedConfirmation("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRestoreSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !canSubmit) return;

    const reallySure = window.confirm(
      "Thao tác này sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại bằng nội dung file sao lưu và KHÔNG THỂ hoàn tác.\n\nBạn có chắc chắn muốn tiếp tục?",
    );
    if (!reallySure) return;

    restoreMutation.mutate(
      { file, confirmation: typedConfirmation },
      { onSuccess: resetRestoreForm },
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-brand border-2 border-secondary bg-white p-5">
        <h2 className="font-display text-lg font-bold text-heading">Sao lưu dữ liệu</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Tải xuống toàn bộ dữ liệu hệ thống (đơn hàng, sản phẩm, khách hàng, v.v.) dưới dạng file .sql. Nên
          thực hiện định kỳ và lưu trữ file ở nơi an toàn.
        </p>
        <button
          type="button"
          onClick={() => downloadMutation.mutate()}
          disabled={downloadMutation.isPending}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-60"
        >
          {downloadMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Tải file sao lưu
        </button>
        {downloadMutation.isError && (
          <p className="mt-2 text-sm text-destructive">
            {getErrorMessage(downloadMutation.error, "Không thể tạo file sao lưu, vui lòng thử lại.")}
          </p>
        )}
      </section>

      <section className="rounded-brand border-2 border-destructive/40 bg-destructive/5 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <h2 className="font-display text-lg font-bold text-destructive">Khôi phục dữ liệu</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Tải lên một file .sql để khôi phục. Thao tác này sẽ <strong>xoá và ghi đè toàn bộ dữ liệu hiện
              tại</strong> bằng dữ liệu trong file — không thể hoàn tác. Chỉ dùng khi thực sự cần thiết.
            </p>
          </div>
        </div>

        <form onSubmit={handleRestoreSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-heading">File sao lưu (.sql)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-semibold focus:border-destructive"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-heading">
              Nhập chính xác <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{CONFIRMATION_PHRASE}</code>{" "}
              để xác nhận
            </label>
            <input
              type="text"
              value={typedConfirmation}
              onChange={(event) => setTypedConfirmation(event.target.value)}
              placeholder={CONFIRMATION_PHRASE}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-destructive"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || restoreMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
          >
            {restoreMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            Khôi phục dữ liệu
          </button>

          {restoreMutation.isError && (
            <p className="text-sm text-destructive">
              {getErrorMessage(restoreMutation.error, "Khôi phục thất bại, vui lòng thử lại.")}
            </p>
          )}
          {restoreMutation.isSuccess && (
            <p className="text-sm font-medium text-success">
              Khôi phục thành công. Vui lòng tải lại trang và đăng nhập lại để đảm bảo dữ liệu hiển thị chính
              xác.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
