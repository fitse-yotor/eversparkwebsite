import { UserRole } from "./auth"

export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case "super_admin":
    case "admin":
      return "/hr/dashboard"
    case "employee":
      return "/employee/dashboard"
    case "user":
    default:
      return "/"
  }
}

export function canAccessHR(role: UserRole): boolean {
  return ["admin", "super_admin"].includes(role)
}

export function canAccessEmployee(role: UserRole): boolean {
  return role === "employee"
}

export function canAccessAdmin(role: UserRole): boolean {
  return ["admin", "super_admin"].includes(role)
}
