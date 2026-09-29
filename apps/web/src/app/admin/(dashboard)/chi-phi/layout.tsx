import { RequireRole } from "@/components/admin/require-role";

export default function ChiPhiLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["ADMIN"]}>{children}</RequireRole>;
}
