import { RequireRole } from "@/components/admin/require-role";

export default function SanPhamLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["ADMIN", "OPERATIONS_ADMIN"]}>{children}</RequireRole>;
}
