import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()
    const updates = await request.json()

    const { data, error } = await supabase.from("messages").update(updates).eq("id", params.id).select().single()

    if (error) {
      console.error("Error updating message:", error)
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Message update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.from("messages").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting message:", error)
      return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Message delete API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
