import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function uploadFile(file: File, type = "general"): Promise<string> {
  try {
    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `${type}s/${timestamp}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Upload error:", error)
    throw new Error("Upload failed")
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Use the uploadFile function
    const url = await uploadFile(file, type)
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
