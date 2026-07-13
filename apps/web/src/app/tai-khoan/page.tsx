import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { AccountPageContent } from "@/features/account/components/account-page-content";

export const metadata: Metadata = {
  title: "Tài khoản của tôi",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <Container className="space-y-6 py-12">
      <h1 className="font-display text-4xl font-bold text-heading">Tài khoản của tôi</h1>
      <AccountPageContent />
    </Container>
  );
}
