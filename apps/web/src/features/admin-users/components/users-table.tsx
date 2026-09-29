"use client";

import { getErrorMessage } from "@/lib/get-error-message";
import { ADMIN_ROLE_LABELS } from "@/lib/admin-role-labels";
import { useAdminAuthStore, type AdminRole } from "@/stores/admin-auth-store";
import { useAdminUsers, useSetAdminUserActive, useUpdateAdminUserRole } from "../hooks";
import type { AdminUserRow } from "../types";

const ROLE_OPTIONS: AdminRole[] = ["ADMIN", "OPERATIONS_ADMIN", "STAFF"];

function UserRow({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const updateRole = useUpdateAdminUserRole(user.id);
  const setActive = useSetAdminUserActive(user.id);

  return (
    <tr className="hover:bg-secondary/20">
      <td className="px-4 py-3">
        <p className="font-medium text-heading">
          {user.name} {isSelf && <span className="text-xs font-normal text-foreground/40">(bạn)</span>}
        </p>
        <p className="text-xs text-foreground/50">{user.email}</p>
      </td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          disabled={isSelf || updateRole.isPending}
          onChange={(event) => updateRole.mutate(event.target.value as AdminRole)}
          className="rounded-lg border-2 border-secondary bg-white px-2 py-1.5 text-xs outline-none focus:border-accent disabled:opacity-50"
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {ADMIN_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        {updateRole.isError && (
          <p className="mt-1 text-xs text-destructive">
            {getErrorMessage(updateRole.error, "Không thể đổi vai trò.")}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            user.isActive ? "bg-success/15 text-success" : "bg-secondary text-foreground/60"
          }`}
        >
          {user.isActive ? "Hoạt động" : "Đã khoá"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={isSelf || setActive.isPending}
          onClick={() => setActive.mutate(!user.isActive)}
          className={`text-sm font-semibold hover:underline disabled:pointer-events-none disabled:opacity-40 ${
            user.isActive ? "text-destructive" : "text-accent"
          }`}
        >
          {user.isActive ? "Khoá" : "Mở khoá"}
        </button>
        {setActive.isError && (
          <p className="mt-1 text-xs text-destructive">
            {getErrorMessage(setActive.error, "Không thể cập nhật.")}
          </p>
        )}
      </td>
    </tr>
  );
}

export function UsersTable() {
  const { data: users, isLoading } = useAdminUsers();
  const currentUserId = useAdminAuthStore((state) => state.admin?.id);

  return (
    <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
          <tr>
            <th className="px-4 py-3">Tài khoản</th>
            <th className="px-4 py-3">Vai trò</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary">
          {isLoading && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-foreground/50">
                Đang tải...
              </td>
            </tr>
          )}
          {!isLoading && users?.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-foreground/50">
                Chưa có tài khoản nào.
              </td>
            </tr>
          )}
          {users?.map((user) => (
            <UserRow key={user.id} user={user} isSelf={user.id === currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
