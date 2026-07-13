"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoginCustomer } from "../hooks";
import { GoogleLoginButton } from "./google-login-button";

const schema = z.object({
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function goToRedirect() {
    router.push(searchParams.get("redirect") ?? "/tai-khoan");
  }

  function onSubmit(values: FormValues) {
    loginMutation.mutate(values, { onSuccess: goToRedirect });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      {loginMutation.isError && (
        <p className="text-sm text-destructive">Số điện thoại hoặc mật khẩu không đúng.</p>
      )}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <GoogleLoginButton onSuccess={goToRedirect} />

      <p className="text-center text-sm text-foreground/70">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="font-semibold text-accent hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
