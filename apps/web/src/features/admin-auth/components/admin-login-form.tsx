"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoginAdmin } from "../hooks";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type FormValues = z.infer<typeof schema>;

export function AdminLoginForm() {
  const router = useRouter();
  const loginMutation = useLoginAdmin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    loginMutation.mutate(values, { onSuccess: () => router.push("/admin") });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
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
          autoComplete="current-password"
          {...register("password")}
          className="w-full rounded-lg border-2 border-secondary px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {loginMutation.isError && (
        <p className="text-sm text-destructive">Email hoặc mật khẩu không đúng.</p>
      )}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
