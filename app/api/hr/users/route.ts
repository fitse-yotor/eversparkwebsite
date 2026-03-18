import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { message: "Service role key not configured" },
        { status: 503 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get all HR users (admin and super_admin roles)
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        role,
        created_at,
        admin_users (
          is_active,
          permissions,
          last_login
        )
      `)
      .in("role", ["admin", "super_admin"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching HR users:", error)
      return NextResponse.json(
        { message: `Failed to fetch HR users: ${error.message}` },
        { status: 500 }
      )
    }

    // Transform the data to flatten admin_users
    const users = profiles?.map(profile => ({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      created_at: profile.created_at,
      is_active: profile.admin_users?.[0]?.is_active ?? true,
      permissions: profile.admin_users?.[0]?.permissions,
      last_login: profile.admin_users?.[0]?.last_login
    })) || []

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error in HR users API:", error)
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
