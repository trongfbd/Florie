import { RequireRole } from "@/components/admin/require-role";

export default function BannerLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["ADMIN", "OPERATIONS_ADMIN"]}>{children}</RequireRole>;
}
