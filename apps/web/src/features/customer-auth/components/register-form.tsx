"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegisterCustomer } from "../hooks";
import { GoogleLoginButton } from "./google-login-button";

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegisterCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    registerMutation.mutate(
      { ...values, email: values.email || undefined },
      { onSuccess: () => router.push("/tai-khoan") },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading" htmlFor="name">
          Họ và tên
        </label>
        <input
          id="name"
          {...register("name")}
          className="w-full rounded-lg border-2 border-secondary px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading" htmlFor="phone">
          Số điện thoại
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full rounded-lg border-2 border-secondary px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading" htmlFor="email">
          Email (không bắt buộc)
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full rounded-lg border-2 border-secondary px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading" htmlFor="password">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="w-full rounded-lg border-2 border-secondary px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {registerMutation.isError && (
        <p className="text-sm text-destructive">
          {(registerMutation.error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Đăng ký thất bại, vui lòng thử lại."}
        </p>
      )}

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
      </button>

      <GoogleLoginButton onSuccess={() => router.push("/tai-khoan")} />

      <p className="text-center text-sm text-foreground/70">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-semibold text-accent hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
