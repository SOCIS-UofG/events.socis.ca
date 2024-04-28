import { type User } from "next-auth";
import { Permission } from "@/types/global/permission";

export function hasPermissions(
  user: User | null | undefined,
  permissions: Permission[],
): boolean {
  if (!user) {
    return false;
  }

  return (
    permissions.every(
      (permission) => user?.permissions?.includes(permission),
    ) || user?.permissions?.includes(Permission.ADMIN)
  );
}
