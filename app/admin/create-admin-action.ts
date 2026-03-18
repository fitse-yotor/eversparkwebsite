"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Create the first admin user
 * This should only be used once to bootstrap your admin account
 * After creating the first admin, you can manage other admins through the admin panel
 */
export async function createFirstAdmin(email: string, password: string, fullName?: string) {
  const supabase = await createSupabaseServerClient()

  try {
    // Check if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)

    if (checkError) {
      return { success: false, message: `Error checking existing admins: ${checkError.message}` }
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return { success: false, message: "An admin user already exists. Please use the admin panel to manage users." }
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for first admin
    })

    if (authError) {
      return { success: false, message: `Error creating user: ${authError.message}` }
    }

    if (!authData.user) {
      return { success: false, message: "User creation failed - no user data returned" }
    }

    // Update the profile to admin role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "super_admin",
        full_name: fullName || "Admin User",
      })
      .eq("id", authData.user.id)

    if (profileError) {
      return { success: false, message: `Error updating profile: ${profileError.message}` }
    }

    // Create admin_users entry
    const { error: adminError } = await supabase.from("admin_users").insert({
      user_id: authData.user.id,
      permissions: {
        can_manage_content: true,
        can_manage_users: true,
        can_manage_settings: true,
      },
      is_active: true,
    })

    if (adminError) {
      return { success: false, message: `Error creating admin entry: ${adminError.message}` }
    }

    return {
      success: true,
      message: `Admin user created successfully! You can now log in with email: ${email}`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Create additional admin users (requires existing admin authentication)
 */
export async function createAdminUser(
  email: string,
  password: string,
  fullName: string,
  role: "admin" | "super_admin" = "admin",
  permissions?: {
    can_manage_content?: boolean
    can_manage_users?: boolean
    can_manage_settings?: boolean
  }
) {
  const supabase = await createSupabaseServerClient()

  try {
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return { success: false, message: `Error creating user: ${authError.message}` }
    }

    if (!authData.user) {
      return { success: false, message: "User creation failed" }
    }

    // Update the profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role,
        full_name: fullName,
      })
      .eq("id", authData.user.id)

    if (profileError) {
      return { success: false, message: `Error updating profile: ${profileError.message}` }
    }

    // Create admin_users entry
    const { error: adminError } = await supabase.from("admin_users").insert({
      user_id: authData.user.id,
      permissions: permissions || {
        can_manage_content: true,
        can_manage_users: false,
        can_manage_settings: true,
      },
      is_active: true,
    })

    if (adminError) {
      return { success: false, message: `Error creating admin entry: ${adminError.message}` }
    }

    return {
      success: true,
      message: `Admin user ${email} created successfully!`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * List all admin users
 */
export async function listAdminUsers() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      full_name,
      role,
      created_at,
      admin_users (
        permissions,
        last_login,
        is_active
      )
    `
    )
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, message: error.message, data: null }
  }

  return { success: true, data }
}

/**
 * Update admin user role or permissions
 */
export async function updateAdminUser(
  userId: string,
  updates: {
    role?: "admin" | "super_admin"
    full_name?: string
    is_active?: boolean
    permissions?: {
      can_manage_content?: boolean
      can_manage_users?: boolean
      can_manage_settings?: boolean
    }
  }
) {
  const supabase = await createSupabaseServerClient()

  try {
    // Update profile if role or full_name provided
    if (updates.role || updates.full_name) {
      const profileUpdates: any = {}
      if (updates.role) profileUpdates.role = updates.role
      if (updates.full_name) profileUpdates.full_name = updates.full_name

      const { error: profileError } = await supabase.from("profiles").update(profileUpdates).eq("id", userId)

      if (profileError) {
        return { success: false, message: `Error updating profile: ${profileError.message}` }
      }
    }

    // Update admin_users if permissions or is_active provided
    if (updates.permissions || updates.is_active !== undefined) {
      const adminUpdates: any = {}
      if (updates.permissions) adminUpdates.permissions = updates.permissions
      if (updates.is_active !== undefined) adminUpdates.is_active = updates.is_active

      const { error: adminError } = await supabase.from("admin_users").update(adminUpdates).eq("user_id", userId)

      if (adminError) {
        return { success: false, message: `Error updating admin settings: ${adminError.message}` }
      }
    }

    return { success: true, message: "Admin user updated successfully" }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Delete admin user
 */
export async function deleteAdminUser(userId: string) {
  const supabase = await createSupabaseServerClient()

  try {
    // Check if this is the last super_admin
    const { data: superAdmins, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "super_admin")

    if (checkError) {
      return { success: false, message: `Error checking admins: ${checkError.message}` }
    }

    if (superAdmins && superAdmins.length === 1 && superAdmins[0].id === userId) {
      return { success: false, message: "Cannot delete the last super admin" }
    }

    // Delete the user (cascade will handle profiles and admin_users)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      return { success: false, message: `Error deleting user: ${deleteError.message}` }
    }

    return { success: true, message: "Admin user deleted successfully" }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
