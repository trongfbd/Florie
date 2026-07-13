import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { RegisterForm } from "@/features/customer-auth/components/register-form";

export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function RegisterPage() {
  return (
    <Container className="flex justify-center py-16">
      <div className="w-full max-w-md space-y-6 rounded-brand border-2 border-secondary bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-heading">Tạo tài khoản</h1>
          <p className="mt-1 text-sm text-foreground/60">Theo dõi đơn hàng và lưu sản phẩm yêu thích</p>
        </div>
        <RegisterForm />
      </div>
    </Container>
  );
}
