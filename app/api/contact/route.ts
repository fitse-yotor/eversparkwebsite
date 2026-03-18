import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, subject, and message are required" },
        { status: 400 },
      )
    }

    // --- use SERVICE-ROLE key (bypasses RLS) -----------------------------
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← service-role key
    )
    // ---------------------------------------------------------------------

    // Determine category based on subject keywords
    let category = "general"
    const subjectLower = subject.toLowerCase()
    if (subjectLower.includes("sales") || subjectLower.includes("quote") || subjectLower.includes("price")) {
      category = "sales"
    } else if (
      subjectLower.includes("support") ||
      subjectLower.includes("technical") ||
      subjectLower.includes("help")
    ) {
      category = "support"
    } else if (subjectLower.includes("partner") || subjectLower.includes("collaboration")) {
      category = "partnership"
    }

    // Determine priority based on subject keywords
    let priority = "medium"
    if (subjectLower.includes("urgent") || subjectLower.includes("emergency")) {
      priority = "high"
    } else if (subjectLower.includes("info") || subjectLower.includes("question")) {
      priority = "low"
    }

    // Insert message into database
    const { data, error } = await supabase
      .from("messages")
      .insert({
        name,
        email,
        company: company || null,
        phone: phone || null,
        subject,
        message,
        category,
        priority,
        status: "unread",
        starred: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting message:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      id: data.id,
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
