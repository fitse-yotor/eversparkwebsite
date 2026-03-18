import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export type UserRole = "user" | "employee" | "admin" | "super_admin"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name?: string
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return null
    }

    const cookieStore = cookies()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    })

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    // Get user profile with role
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, role, full_name")
      .eq("id", session.user.id)
      .single()

    if (error || !profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email || session.user.email || "",
      role: profile.role as UserRole,
      full_name: profile.full_name
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export function hasRole(user: AuthUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ["admin", "super_admin"])
}

export function isEmployee(user: AuthUser | null): boolean {
  return hasRole(user, ["employee"])
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ["super_admin"])
}
