import { RequireRole } from "@/components/admin/require-role";

export default function NhaCungCapLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["ADMIN", "OPERATIONS_ADMIN"]}>{children}</RequireRole>;
}
