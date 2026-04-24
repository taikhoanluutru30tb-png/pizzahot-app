import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

export type AppRole = "admin" | "staff" | "ctv" | "shipper" | "tech_support";
export type WorkspaceRole = Exclude<AppRole, "tech_support">;

export const ROLE_PATHS: Record<AppRole, string> = {
  admin: "/admin",
  staff: "/staff",
  ctv: "/ctv",
  shipper: "/shipper",
  tech_support: "/admin",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Quản lý",
  staff: "Nhân viên",
  ctv: "Đối tác bán hàng",
  shipper: "Giao hàng",
  tech_support: "Hỗ trợ kỹ thuật",
};

const WORKSPACE_PREFIXES: WorkspaceRole[] = ["admin", "staff", "ctv", "shipper"];

export function normalizeRole(value: unknown): AppRole | null {
  if (value === "Admin" || value === "admin") return "admin";
  if (value === "Staff" || value === "staff") return "staff";
  if (value === "CTV" || value === "ctv") return "ctv";
  if (value === "Shipper" || value === "shipper") return "shipper";
  if (value === "Tech Support" || value === "tech_support") return "tech_support";
  return null;
}

export function getDisplayName(user: User, userData: Record<string, unknown> | undefined) {
  const candidates = [userData?.fullName, userData?.displayName, userData?.name, user.displayName, user.email];
  const found = candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  return found ?? "Tài khoản đăng nhập";
}

export function getWorkspaceFromPath(pathname: string) {
  return WORKSPACE_PREFIXES.find((role) => pathname === `/${role}` || pathname.startsWith(`/${role}/`)) ?? null;
}

export function getRoleHomePath(role: AppRole | null | undefined) {
  if (role === "tech_support") return "/admin";
  if (!role) return "/";
  return ROLE_PATHS[role];
}

export function canAccessWorkspace(role: AppRole | null | undefined, workspace: WorkspaceRole | null) {
  if (!workspace) return true;
  if (!role) return false;
  if (role === "tech_support") return true;
  return role === workspace;
}

export function getAccessDeniedMessage() {
  return "Bạn không có quyền truy cập vào khu vực này.";
}

export async function loadCurrentUserRole(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  const data = snapshot.data() as Record<string, unknown> | undefined;
  const role = normalizeRole(data?.role);
  return { snapshot, data, role };
}

export { auth };
