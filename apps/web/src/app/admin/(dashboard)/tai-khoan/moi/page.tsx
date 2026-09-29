import type { Metadata } from "next";
import { CreateUserForm } from "@/features/admin-users/components/create-user-form";

export const metadata: Metadata = { title: "Tạo tài khoản", robots: { index: false } };

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Tạo tài khoản</h1>
      <CreateUserForm />
    </div>
  );
}
