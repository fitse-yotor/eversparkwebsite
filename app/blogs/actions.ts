"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishedDate: string // ISO date string
  readTime: string
  imageUrl: string | null
  tags: string[]
  category: string
  categoryName: string
  featured: boolean
  status: "draft" | "published" | "archived"
  created_at: string
  updated_at: string
}

export interface BlogInput {
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishedDate: string
  readTime: string
  imageUrl: string | null
  tags: string[]
  category: string
  categoryName: string
  featured: boolean
  status: "draft" | "published" | "archived"
}

function mapSupabaseBlogToBlogPost(data: any): BlogPost {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    author: data.author,
    publishedDate: data.published_date,
    readTime: data.read_time,
    imageUrl: data.image_url,
    tags: data.tags || [],
    category: data.category,
    categoryName: data.category_name,
    featured: data.featured,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function getBlogs(): Promise<BlogPost[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("blogs").select("*").order("published_date", { ascending: false })

  if (error) {
    console.error("Error fetching blogs:", error.message)
    return []
  }
  return data.map(mapSupabaseBlogToBlogPost)
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching blog with ID ${id}:`, error.message)
    return null
  }
  return mapSupabaseBlogToBlogPost(data)
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("blogs").select("*").eq("slug", slug).single()

  if (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error.message)
    return null
  }
  return mapSupabaseBlogToBlogPost(data)
}

export async function addBlog(blogInput: BlogInput) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("blogs").insert(blogInput).select().single()

  if (error) {
    console.error("Error adding blog:", error.message)
    return { success: false, message: `Failed to add blog: ${error.message}` }
  }

  revalidatePath("/blogs")
  revalidatePath("/admin/blogs")
  return { success: true, message: "Blog added successfully!", blog: mapSupabaseBlogToBlogPost(data) }
}

export async function updateBlog(id: string, blogInput: Partial<BlogInput>) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("blogs").update(blogInput).eq("id", id).select().single()

  if (error) {
    console.error("Error updating blog:", error.message)
    return { success: false, message: `Failed to update blog: ${error.message}` }
  }

  revalidatePath("/blogs")
  revalidatePath(`/blogs/${blogInput.slug || id}`)
  revalidatePath("/admin/blogs")
  return { success: true, message: "Blog updated successfully!", blog: mapSupabaseBlogToBlogPost(data) }
}

export async function deleteBlog(id: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("blogs").delete().eq("id", id)

  if (error) {
    console.error("Error deleting blog:", error.message)
    return { success: false, message: `Failed to delete blog: ${error.message}` }
  }

  revalidatePath("/blogs")
  revalidatePath("/admin/blogs")
  return { success: true, message: "Blog deleted successfully!" }
}
