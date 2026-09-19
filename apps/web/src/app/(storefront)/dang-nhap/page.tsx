import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { LoginForm } from "@/features/customer-auth/components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage() {
  return (
    <Container className="flex justify-center py-16">
      <div className="w-full max-w-md space-y-6 rounded-brand border-2 border-secondary bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-heading">Đăng nhập</h1>
          <p className="mt-1 text-sm text-foreground/60">Chào mừng bạn quay lại Bèo Flower Corner</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </Container>
  );
}
