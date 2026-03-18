import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * GET /api/services
 * Returns:
 * {
 *   services: ServiceItem[],
 *   pageContent: { subtitle: string | null }
 * }
 */
export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Fetch all service items ordered by sort_order
  const { data: services, error: serviceErr } = await supabase
    .from("service_items")
    .select("id, title, description, icon, sort_order")
    .order("sort_order", { ascending: true })

  if (serviceErr) {
    console.error("API /services – error fetching service_items:", serviceErr.message)
    return NextResponse.json({ error: "Failed to fetch service items" }, { status: 500 })
  }

  // Fetch the page-level subtitle (row id = 1 convention)
  const { data: pageRow, error: pageErr } = await supabase
    .from("services_page_content")
    .select("section_subtitle")
    .eq("id", 1)
    .single()

  if (pageErr) {
    console.error("API /services – error fetching page content:", pageErr.message)
  }

  return NextResponse.json({
    services,
    pageContent: { subtitle: pageRow?.section_subtitle ?? null },
  })
}
