"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Small helper to wrap Supabase errors in a friendlier message.
 */
function humanizeAuthError(message: string) {
  if (message.includes("Invalid login credentials")) return "Invalid email or password."
  if (message.includes("User already registered")) return "Email is already registered."
  if (message.includes("Email not confirmed")) return "Please confirm your email address."
  return "Something went wrong. Please try again."
}

/* -------------------------------------------------------------------------- */
/*                                   LOGIN                                    */
/* -------------------------------------------------------------------------- */
export async function login(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const email = formData.get("email") as string | null
  const password = formData.get("password") as string | null

  console.log("Login attempt for:", email)

  if (!email || !password) {
    return { success: false, message: "Email and password are required." }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Login error:", error.message)
    return { success: false, message: humanizeAuthError(error.message) }
  }

  console.log("Login successful, checking user role...")

  /* -- Get user profile and redirect based on role --------------------------- */
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  console.log("Profile data:", profile, "Error:", profileErr)

  if (profileErr || !profile) {
    console.error("Profile error:", profileErr)
    await supabase.auth.signOut()
    return { success: false, message: "Unable to load user profile." }
  }

  // Redirect based on role
  const role = profile.role
  console.log("User role:", role)

  if (role === "super_admin" || role === "admin") {
    redirect("/admin/dashboard")
  } else if (role === "hr") {
    redirect("/hr/dashboard")
  } else if (role === "employee") {
    redirect("/employee/dashboard")
  } else {
    console.error("Unknown role:", role)
    await supabase.auth.signOut()
    return { success: false, message: "Invalid user role." }
  }
}

/* -------------------------------------------------------------------------- */
/*                                   SIGNUP                                   */
/* -------------------------------------------------------------------------- */
export async function signup(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const email = formData.get("email") as string | null
  const password = formData.get("password") as string | null

  if (!email || !password) {
    return { success: false, message: "Email and password are required." }
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { success: false, message: humanizeAuthError(error.message) }
  }

  return {
    success: true,
    message: "Account created! Check your inbox to verify your email, then log in.",
  }
}

/* -------------------------------------------------------------------------- */
/*                                  LOGOUT                                    */
/* -------------------------------------------------------------------------- */
export async function logoutUser() {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/admin")
}


export async function resetPassword(email: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    return { success: false, message: error.message }
  }

  return {
    success: true,
    message: "Password reset link has been sent to your email"
  }
}


export async function updatePassword(newPassword: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { success: false, message: error.message }
  }

  return {
    success: true,
    message: "Password has been reset successfully"
  }
}
