"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useInvoiceSettings, useUpdateInvoiceSettings } from "../hooks";
import type { InvoiceSettingsFormInput } from "../types";

function FormField({
  label,
  name,
  register,
  placeholder,
  type = "text",
}: {
  label: string;
  name: keyof InvoiceSettingsFormInput;
  register: ReturnType<typeof useForm<InvoiceSettingsFormInput>>["register"];
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-heading">{label}</label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}

export function InvoiceSettingsForm() {
  const { data: settings, isLoading } = useInvoiceSettings();
  const mutation = useUpdateInvoiceSettings();

  const { register, handleSubmit, reset } = useForm<InvoiceSettingsFormInput>();

  useEffect(() => {
    if (settings) {
      // List fields explicitly (not a blanket Object.entries(settings) spread) —
      // the real API response also carries `id`/`updatedAt`, which aren't part
      // of the update DTO and would get rejected by the backend's
      // forbidNonWhitelisted validation if they leaked into the submit payload.
      reset({
        companyLegalName: settings.companyLegalName ?? "",
        taxCode: settings.taxCode ?? "",
        companyAddress: settings.companyAddress ?? "",
        companyPhone: settings.companyPhone ?? "",
        companyEmail: settings.companyEmail ?? "",
        eInvoiceProvider: settings.eInvoiceProvider ?? "",
        eInvoiceApiEndpoint: settings.eInvoiceApiEndpoint ?? "",
        eInvoiceApiKey: settings.eInvoiceApiKey ?? "",
        eInvoiceApiSecret: settings.eInvoiceApiSecret ?? "",
        eInvoiceTemplateCode: settings.eInvoiceTemplateCode ?? "",
        eInvoiceSeriesSymbol: settings.eInvoiceSeriesSymbol ?? "",
      });
    }
  }, [settings, reset]);

  if (isLoading) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  function onSubmit(values: InvoiceSettingsFormInput) {
    mutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground/50">
          Thông tin công ty (hiển thị trên hóa đơn)
        </h3>
        <FormField label="Tên pháp lý công ty" name="companyLegalName" register={register} placeholder="VD: Công ty TNHH Florie" />
        <FormField label="Mã số thuế (MST)" name="taxCode" register={register} placeholder="VD: 0312345678" />
        <FormField label="Địa chỉ" name="companyAddress" register={register} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Số điện thoại" name="companyPhone" register={register} />
          <FormField label="Email" name="companyEmail" register={register} type="email" />
        </div>
      </div>

      <div className="space-y-4 border-t border-secondary pt-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground/50">
            Hóa đơn điện tử (chưa tích hợp)
          </h3>
          <p className="mt-1 text-sm text-foreground/60">
            Các trường này chỉ để lưu sẵn cấu hình — hệ thống chưa gọi API nhà cung cấp hóa đơn điện tử
            hay phát hành hóa đơn lên cơ quan thuế. Khi cần tích hợp thật, điền các trường bên dưới rồi
            báo để nối API.
          </p>
        </div>
        <FormField
          label="Nhà cung cấp"
          name="eInvoiceProvider"
          register={register}
          placeholder="VD: VIETTEL, VNPT, MISA, M-INVOICE"
        />
        <FormField label="API endpoint" name="eInvoiceApiEndpoint" register={register} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="API key" name="eInvoiceApiKey" register={register} type="password" />
          <FormField label="API secret" name="eInvoiceApiSecret" register={register} type="password" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Mẫu số hóa đơn" name="eInvoiceTemplateCode" register={register} placeholder="VD: 1" />
          <FormField label="Ký hiệu hóa đơn" name="eInvoiceSeriesSymbol" register={register} placeholder="VD: 1C24TAA" />
        </div>
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
