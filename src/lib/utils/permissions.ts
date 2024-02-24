import { type User } from "next-auth";
import { Permission } from "@/types/permission";

export function hasPermissions(user: User | null, permissions: Permission[]): boolean {
  return (
    permissions.every(
      (permission) => user?.permissions?.includes(permission),
    ) || user?.permissions?.includes(Permission.ADMIN)
  );
}
