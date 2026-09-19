import type { Metadata } from "next";
import { AdminLoginForm } from "@/features/admin-auth/components/admin-login-form";

export const metadata: Metadata = { title: "Đăng nhập Admin", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-brand border-2 border-secondary bg-white p-8 shadow-xl">
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-accent">Bèo Flower Corner</p>
          <p className="mt-1 text-sm text-foreground/60">Đăng nhập quản trị</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
