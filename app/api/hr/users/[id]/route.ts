import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      )
    }

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

    console.log("Deleting HR user:", userId)

    // Delete admin_users entry first (foreign key constraint)
    const { error: adminDeleteError } = await supabaseAdmin
      .from("admin_users")
      .delete()
      .eq("user_id", userId)

    if (adminDeleteError) {
      console.error("Error deleting admin_users:", adminDeleteError)
      // Continue anyway, might not exist
    }

    // Delete profile entry
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileDeleteError) {
      console.error("Error deleting profile:", profileDeleteError)
      return NextResponse.json(
        { message: `Failed to delete profile: ${profileDeleteError.message}` },
        { status: 500 }
      )
    }

    // Delete auth user
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError)
      return NextResponse.json(
        { message: `Failed to delete auth user: ${authDeleteError.message}` },
        { status: 500 }
      )
    }

    console.log("HR user deleted successfully")

    return NextResponse.json({
      success: true,
      message: "HR user deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting HR user:", error)
    return NextResponse.json(
      { 
        message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}` 
      },
      { status: 500 }
    )
  }
}
