"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "@/lib/get-error-message";
import { ADMIN_ROLE_LABELS } from "@/lib/admin-role-labels";
import type { AdminRole } from "@/stores/admin-auth-store";
import { useCreateAdminUser } from "../hooks";

const ROLE_OPTIONS: AdminRole[] = ["ADMIN", "OPERATIONS_ADMIN", "STAFF"];

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu cần tối thiểu 8 ký tự"),
  role: z.enum(["ADMIN", "OPERATIONS_ADMIN", "STAFF"]),
});

type FormValues = z.infer<typeof schema>;

export function CreateUserForm() {
  const router = useRouter();
  const createMutation = useCreateAdminUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "STAFF" },
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate(values, { onSuccess: () => router.push("/admin/tai-khoan") });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Họ tên</label>
        <input
          {...register("name")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Email đăng nhập</label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Mật khẩu</label>
        <input
          type="password"
          {...register("password")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Vai trò</label>
        <select
          {...register("role")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {ADMIN_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      {createMutation.isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(createMutation.error, "Có lỗi xảy ra — vui lòng kiểm tra lại thông tin.")}
        </p>
      )}

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {createMutation.isPending ? "Đang tạo..." : "Tạo tài khoản"}
      </button>
    </form>
  );
}
