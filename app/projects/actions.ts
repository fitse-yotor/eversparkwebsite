"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Define the Project type based on the actual database schema (scripts/013-create-projects-table.sql)
export type Project = {
  id: string
  created_at: string
  updated_at: string
  slug: string
  title: string
  category: string
  location: string
  description: string | null
  executive_summary: string | null
  subtitle: string | null
  main_image_url: string | null
  video_url: string | null
  rating: number | null
  client: string | null
  completed_date: string | null // Stored as text for flexibility
  tags: string[] | null // Array of text tags
  status: string | null
  featured: boolean
  sample_images: string[] | null // Array of image URLs
  key_results: string[] | null // Array of key result bullet points
  technical_specs: Record<string, any> | null // JSON object for flexible key-value specs
}

// Define the ProjectInput type for form submissions, aligning with Project type
export type ProjectInput = Omit<Project, "id" | "created_at" | "updated_at">

// Define ProjectCategory type (still hardcoded for now)
export type ProjectCategory = {
  id: string
  name: string
  slug: string
}

// Helper to map camelCase input to snake_case for database insertion/update
function toDbPayload(input: ProjectInput): Record<string, any> {
  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    location: input.location,
    description: input.description,
    executive_summary: input.executive_summary,
    subtitle: input.subtitle,
    main_image_url: input.main_image_url,
    video_url: input.video_url,
    rating: input.rating,
    client: input.client,
    completed_date: input.completed_date,
    tags: input.tags,
    status: input.status,
    featured: input.featured,
    sample_images: input.sample_images,
    key_results: input.key_results,
    technical_specs: input.technical_specs,
  }
}

// Helper to map database snake_case to camelCase for consistency in frontend
function fromDbPayload(data: any): Project {
  return {
    id: data.id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    slug: data.slug,
    title: data.title,
    category: data.category,
    location: data.location,
    description: data.description,
    executive_summary: data.executive_summary,
    subtitle: data.subtitle,
    main_image_url: data.main_image_url,
    video_url: data.video_url,
    rating: data.rating !== null ? Number.parseFloat(data.rating) : null, // Convert numeric string to number
    client: data.client,
    completed_date: data.completed_date,
    tags: data.tags || [], // Ensure it's an array
    status: data.status,
    featured: data.featured,
    sample_images: data.sample_images || [], // Ensure it's an array
    key_results: data.key_results || [], // Ensure it's an array
    technical_specs: data.technical_specs || null, // Ensure it's an object or null
  }
}

export async function getProjects({ featured }: { featured?: boolean } = {}): Promise<Project[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from("projects").select("*")

  if (featured) {
    query = query.eq("featured", true)
  }

  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data.map(fromDbPayload)
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching project by ID:", error)
    return null
  }

  if (!data) {
    return null
  }

  return fromDbPayload(data)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).single()

  if (error) {
    console.error("Error fetching project by slug:", error)
    return null
  }

  if (!data) {
    return null
  }

  return fromDbPayload(data)
}

export async function getProjectCategories(): Promise<ProjectCategory[]> {
  // For now, project categories are hardcoded.
  // In a real application, you would fetch these from a 'project_categories' table.
  return [
    { id: "1", name: "Water Treatment", slug: "water-treatment" },
    { id: "2", name: "Desalination", slug: "desalination" },
    { id: "3", name: "Wastewater Management", slug: "wastewater-management" },
    { id: "4", name: "Renewable Energy Integration", slug: "renewable-energy-integration" },
  ]
}

export async function addProject(projectInput: ProjectInput) {
  const supabase = await createSupabaseServerClient()
  const insertPayload = toDbPayload(projectInput)

  const { data, error } = await supabase.from("projects").insert(insertPayload).select("*").single()

  if (error) {
    console.error("Error inserting project:", error)
    return { success: false, message: error.message, project: null }
  }

  revalidatePath("/admin/projects")
  revalidatePath("/projects")
  revalidatePath(`/projects/${data.slug}`)

  return { success: true, message: "Project added successfully.", project: fromDbPayload(data) }
}

export async function updateProject(slug: string, projectInput: ProjectInput) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("projects")
    .update(toDbPayload(projectInput))
    .eq("slug", slug)
    .select("*")
    .single()

  if (error) {
    console.error(`Error updating project ${slug}:`, error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/projects")
  revalidatePath("/projects")
  revalidatePath(`/projects/${slug}`)

  return { success: true, message: "Project updated successfully.", project: fromDbPayload(data) }
}

export async function deleteProject(slug: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("projects").delete().eq("slug", slug)

  if (error) {
    console.error(`Error deleting project ${slug}:`, error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/projects")
  revalidatePath("/projects")

  return { success: true, message: "Project deleted successfully." }
}
