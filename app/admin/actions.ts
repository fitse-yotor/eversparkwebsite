"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// TODO: Implement proper session management (e.g., using cookies)
// For now, this is a placeholder. In a real app, you'd generate a secure session token.
function createSessionForUser(userId: string, email: string) {
  console.log(`Placeholder: Creating session for user ${userId} (${email})`)
  // In a real app:
  // 1. Generate a secure session token.
  // 2. Store it (e.g., in a sessions table in your DB, or a JWT).
  // 3. Set an HTTP-only, secure cookie with this token.
  // For Next.js, you might use libraries like 'iron-session' or 'next-auth' (though next-auth is more for full auth solutions).
}

export async function loginUser(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "Email and password are required.", success: false }
  }

  console.log(`Attempting to sign in user: ${email}`)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })

  if (error) {
    console.error("--- SUPABASE LOGIN FAILED ---")
    console.error("Supabase auth error:", error.message)
    // Provide a more user-friendly message based on common Supabase errors
    let userMessage = "Login failed: Invalid credentials or server error."
    if (error.message.includes("Invalid login credentials")) {
      userMessage = "Invalid email or password."
    } else if (error.message.includes("Email not confirmed")) {
      userMessage = "Please confirm your email address before logging in."
    }
    return {
      success: false,
      message: userMessage,
    }
  }

  if (data.user) {
    console.log(`User ${data.user.email} signed in successfully.`)
    // Here you might want to check if the user has an admin role if your app requires it.
    // For example, by checking a 'role' column in your 'users' or 'profiles' table:
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles") // or 'users' if you store roles there
      .select("role")
      .eq("id", data.user.id)
      .single()
    if (profileError || !userProfile || userProfile.role !== "admin") {
      await supabase.auth.signOut() // Sign out if not admin
      return { success: false, message: "Access denied. Not an admin." }
    }
    redirect("/admin/dashboard")
  } else {
    // Should not happen if error is null and data.user is null, but as a safeguard
    console.error("--- SUPABASE LOGIN UNEXPECTED STATE ---")
    console.error("User data is null without an error after signInWithPassword.")
    return {
      success: false,
      message: "Login failed: An unexpected error occurred. Please try again.",
    }
  }
}

export async function signupUser(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "Email and password are required.", success: false }
  }

  console.log(`Attempting to sign up user: ${email}`)
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  })

  if (error) {
    console.error("--- SUPABASE SIGNUP FAILED ---")
    console.error("Supabase auth error:", error.message)
    let userMessage = "Signup failed: An error occurred."
    if (error.message.includes("User already registered")) {
      userMessage = "This email is already registered. Please log in."
    } else if (error.message.includes("Password should be at least 6 characters")) {
      userMessage = "Password must be at least 6 characters long."
    }
    return {
      success: false,
      message: userMessage,
    }
  }

  if (data.user) {
    console.log(`User ${data.user.email} signed up successfully.`)
    // Optionally, insert into profiles table with a default role
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      role: "user", // Default role, can be changed to 'admin' manually in DB for first admin
    })
    if (profileError) {
      console.error("Error inserting profile:", profileError.message)
      // Consider rolling back user creation or handling this more robustly
      return { success: false, message: "Signup successful, but failed to create user profile." }
    }
    return {
      success: true,
      message: "Signup successful! Please check your email to confirm your account.",
    }
  } else {
    console.error("--- SUPABASE SIGNUP UNEXPECTED STATE ---")
    console.error("User data is null without an error after signUp.")
    return {
      success: false,
      message: "Signup failed: An unexpected error occurred. Please try again.",
    }
  }
}

export async function logoutUser() {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to sign out user.")
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error.message)
    return { success: false, message: `Logout failed: ${error.message}` }
  }

  revalidatePath("/admin/dashboard") // Revalidate dashboard to clear session data
  redirect("/admin") // Redirect to login page after logout
}

// --- Dashboard Stats Actions ---
export async function getTotalProductsCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true })
  if (error) {
    console.error("Error fetching total products count:", error.message)
    return 0
  }
  return count || 0
}

export async function getTotalProjectsCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase.from("projects").select("*", { count: "exact", head: true })
  if (error) {
    console.error("Error fetching total projects count:", error.message)
    return 0
  }
  return count || 0
}

export async function getTotalBlogsCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase.from("blogs").select("*", { count: "exact", head: true })
  if (error) {
    console.error("Error fetching total blogs count:", error.message)
    return 0
  }
  return count || 0
}

export async function getUnreadMessagesCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false)
  if (error) {
    console.error("Error fetching unread messages count:", error.message)
    return 0
  }
  return count || 0
}

// --- General Settings Types (for dashboard stats) ---
export interface GeneralSettingsData {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  timezone: string
  language: string
  siteLogoUrl: string | null
  socialMediaLinks: {
    facebook: string
    twitter: string
    linkedin: string
  }
}

// --- Hero Section Actions ---
export interface HeroData {
  title: string
  subtitle: string
  description: string
  mainImageUrl: string
}
export async function getHeroData(): Promise<HeroData | null> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch hero data...")
  const { data, error } = await supabase
    .from("hero_content")
    .select("title, subtitle, description, main_image_url")
    .eq("id", 1)
    .single()
  if (error) {
    console.error("Error fetching hero data:", error.message)
    return null
  }
  console.log("Successfully fetched hero data.")
  return data ? { ...data, mainImageUrl: data.main_image_url } : null
}
export async function updateHeroData(heroData: HeroData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("hero_content")
    .update({
      title: heroData.title,
      subtitle: heroData.subtitle,
      description: heroData.description,
      main_image_url: heroData.mainImageUrl,
    })
    .eq("id", 1)
  if (error) {
    console.error("Error updating hero data:", error.message)
    return { success: false, message: `Failed to update hero section: ${error.message}` }
  }
  revalidatePath("/admin/content")
  revalidatePath("/")
  return { success: true, message: "Hero section updated." }
}

// --- About Us Section Actions ---
export interface AboutUsData {
  title: string
  subtitle: string
  storyTitle: string
  storyContent: string
  storyImageUrl: string
}
export async function getAboutUsData(): Promise<AboutUsData | null> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch about us data...")
  const { data, error } = await supabase
    .from("about_us_content")
    .select("page_title, subtitle, story_title, story_content, story_image_url")
    .eq("id", 1)
    .single()
  if (error) {
    console.error("Error fetching about us data:", error.message)
    return null
  }
  console.log("Successfully fetched about us data.")
  return data
    ? {
        title: data.page_title,
        subtitle: data.subtitle,
        storyTitle: data.story_title,
        storyContent: data.story_content,
        storyImageUrl: data.story_image_url,
      }
    : null
}
export async function updateAboutUsData(aboutData: AboutUsData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("about_us_content")
    .update({
      page_title: aboutData.title,
      subtitle: aboutData.subtitle,
      story_title: aboutData.storyTitle,
      story_content: aboutData.storyContent,
      story_image_url: aboutData.storyImageUrl,
    })
    .eq("id", 1)
  if (error) {
    console.error("Error updating about us data:", error.message)
    return { success: false, message: `Failed to update About Us: ${error.message}` }
  }
  revalidatePath("/admin/content")
  revalidatePath("/about")
  return { success: true, message: "About Us section updated." }
}

// --- Team Member Actions ---
export interface TeamMember {
  id?: string
  name: string
  position: string
  image: string
  bio: string
}
export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch team members...")
  const { data, error } = await supabase
    .from("team_members")
    .select("id, name, position, image_url, bio, sort_order") // Ensure sort_order is selected
    .order("sort_order")
  if (error) {
    console.error("Error fetching team members:", error.message)
    return []
  }
  console.log(`Successfully fetched ${data?.length || 0} team members.`)
  return (
    data.map((tm) => ({
      id: tm.id,
      name: tm.name,
      position: tm.position,
      image: tm.image_url,
      bio: tm.bio,
      sort_order: tm.sort_order,
    })) || []
  )
}
export async function addTeamMember(memberData: Omit<TeamMember, "id">) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to add team member:", memberData)
  const { data, error } = await supabase
    .from("team_members")
    .insert([
      { name: memberData.name, position: memberData.position, image_url: memberData.image, bio: memberData.bio }, // sort_order will use DB default
    ])
    .select("id, name, position, image_url, bio, sort_order")
    .single()
  if (error) {
    console.error("Error adding team member:", error.message, error.details)
    return { success: false, message: `Failed to add team member: ${error.message}`, member: null }
  }
  console.log("Team member added successfully:", data)
  revalidatePath("/admin/content")
  return { success: true, message: "Team member added.", member: data ? { ...data, image: data.image_url } : null }
}
export async function updateTeamMember(memberId: string, memberData: Partial<TeamMember>) {
  const supabase = await createSupabaseServerClient()
  const payload: any = { ...memberData }
  if (payload.image) {
    payload.image_url = payload.image
    delete payload.image
  }
  delete payload.id // Ensure id is not in the update payload
  const { error } = await supabase.from("team_members").update(payload).eq("id", memberId)
  if (error) {
    console.error("Error updating team member:", error.message)
    return { success: false, message: `Failed to update team member: ${error.message}` }
  }
  revalidatePath("/admin/content")
  return { success: true, message: "Team member updated." }
}
export async function deleteTeamMember(memberId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("team_members").delete().eq("id", memberId)
  if (error) {
    console.error("Error deleting team member:", error.message)
    return { success: false, message: `Failed to delete team member: ${error.message}` }
  }
  revalidatePath("/admin/content")
  return { success: true, message: "Team member deleted." }
}

// --- Services Actions ---
export interface ServicePageData {
  subtitle: string
}
export async function getServicesPageContent(): Promise<ServicePageData | null> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch services page content...")
  const { data, error } = await supabase.from("services_page_content").select("section_subtitle").eq("id", 1).single()
  if (error) {
    console.error("Error fetching services page content:", error.message)
    return null
  }
  console.log("Successfully fetched services page content.")
  return data ? { subtitle: data.section_subtitle || "" } : null
}
export async function updateServicesPageContent(content: ServicePageData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("services_page_content")
    .update({ section_subtitle: content.subtitle })
    .eq("id", 1)
  if (error) {
    console.error("Error updating services page content:", error.message)
    return { success: false, message: `Failed to update services page: ${error.message}` }
  }
  revalidatePath("/admin/content")
  revalidatePath("/services")
  return { success: true, message: "Services page content updated." }
}
export interface ServiceItem {
  id?: string
  title: string
  description: string
  icon: string
}
export async function getServiceItems(): Promise<ServiceItem[]> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch service items...")
  const { data, error } = await supabase
    .from("service_items")
    .select("id, title, description, icon, sort_order")
    .order("sort_order", { ascending: true })
  if (error) {
    console.error(`Error fetching service items:`, error.message)
    return []
  }
  console.log(`Successfully fetched ${data?.length || 0} service items.`)
  return (
    data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      sort_order: item.sort_order,
    })) || []
  )
}
export async function addServiceItem(itemData: Omit<ServiceItem, "id">) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to add service item:", itemData)
  const { data, error } = await supabase
    .from("service_items")
    .insert([{ title: itemData.title, description: itemData.description, icon: itemData.icon }]) // sort_order will use DB default
    .select("id, title, description, icon, sort_order")
    .single()
  if (error) {
    console.error(`Error adding service item:`, error.message, error.details)
    return { success: false, message: `Failed to add service item: ${error.message}`, item: null }
  }
  console.log("Service item added successfully:", data)
  revalidatePath("/admin/content")
  revalidatePath("/services")
  return { success: true, message: "Service item added.", item: data }
}
export async function updateServiceItem(itemId: string, itemData: Partial<ServiceItem>) {
  const supabase = await createSupabaseServerClient()
  const payload: any = { ...itemData }
  delete payload.id
  const { error } = await supabase.from("service_items").update(payload).eq("id", itemId)
  if (error) {
    console.error("Error updating service item:", error.message)
    return { success: false, message: `Failed to update service item: ${error.message}` }
  }
  revalidatePath("/admin/content")
  return { success: true, message: "Service item updated." }
}
export async function deleteServiceItem(itemId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("service_items").delete().eq("id", itemId)
  if (error) {
    console.error("Error deleting service item:", error.message)
    return { success: false, message: `Failed to delete service item: ${error.message}` }
  }
  revalidatePath("/admin/content")
  return { success: true, message: "Service item deleted." }
}

// --- Partners Actions ---
export interface PartnerItem {
  id?: string
  name: string
  logoUrl: string
  websiteUrl: string
  description: string
}
export async function getPartnerItems(): Promise<PartnerItem[]> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch partner items...")
  const { data, error } = await supabase
    .from("partner_items")
    .select("id, name, logo_url, website_url, description, sort_order") // Ensure sort_order is selected
    .order("sort_order")
  if (error) {
    console.error("Error fetching partner items:", error.message)
    return []
  }
  console.log(`Successfully fetched ${data?.length || 0} partner items.`)
  return (
    data.map((p) => ({
      id: p.id,
      name: p.name,
      logoUrl: p.logo_url,
      websiteUrl: p.website_url,
      description: p.description,
      sort_order: p.sort_order,
    })) || []
  )
}
export async function addPartnerItem(itemData: Omit<PartnerItem, "id">) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to add partner item:", itemData)
  const { data, error } = await supabase
    .from("partner_items")
    .insert([
      {
        name: itemData.name,
        logo_url: itemData.logoUrl,
        website_url: itemData.websiteUrl,
        description: itemData.description,
        // sort_order will use DB default
      },
    ])
    .select("id, name, logo_url, website_url, description, sort_order")
    .single()
  if (error) {
    console.error("Error adding partner item:", error.message, error.details)
    return { success: false, message: `Failed to add partner: ${error.message}`, item: null }
  }
  console.log("Partner item added successfully:", data)
  revalidatePath("/admin/content")
  return {
    success: true,
    message: "Partner item added.",
    item: data ? { ...data, logoUrl: data.logo_url, websiteUrl: data.website_url } : null,
  }
}
export async function updatePartnerItem(itemId: string, itemData: Partial<PartnerItem>) {
  const supabase = await createSupabaseServerClient()
  const payload: any = { ...itemData }
  if (payload.logoUrl) {
    payload.logo_url = payload.logoUrl
    delete payload.logoUrl
  }
  if (payload.websiteUrl) {
    payload.website_url = payload.websiteUrl
    delete payload.websiteUrl
  }
  delete payload.id
  const { error } = await supabase.from("partner_items").update(payload).eq("id", itemId)
  if (error) {
    console.error("Error updating partner item:", error.message)
    return { success: false, message: `Failed to update partner: ${error.message}` }
  }
  revalidatePath("/admin/content")
  return { success: true, message: "Partner item updated." }
}
export async function deletePartnerItem(itemId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("partner_items").delete().eq("id", itemId)
  if (error) {
    console.error("Error deleting partner item:", error.message)
    return { success: false, message: `Failed to delete partner: ${error.message}` }
  }
  revalidatePath("/admin/content")
  return { success: true, message: "Partner item deleted." }
}

// --- Contact Info Actions ---
export interface ContactInfoData {
  address: string
  city: string
  country: string
  mainPhone: string
  supportPhone: string
  email: string
  mapUrl: string
  socialMedia: {
    facebook: string
    twitter: string
    linkedin: string
  }
}
export async function getContactInfoData(): Promise<ContactInfoData | null> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch contact info from 'contact_info_content' table...")
  const { data, error } = await supabase
    .from("contact_info_content")
    .select("address, city, country, main_phone, support_phone, email, map_url, social_media_links")
    .eq("id", 1)
    .single()
  if (error) {
    console.error("Error fetching contact info:", error.message)
    return null
  }
  console.log("Successfully fetched contact info.")
  return data
    ? {
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        mainPhone: data.main_phone || "",
        supportPhone: data.support_phone || "",
        email: data.email || "",
        mapUrl: data.map_url || "",
        socialMedia: data.social_media_links || { facebook: "", twitter: "", linkedin: "" },
      }
    : null
}
export async function updateContactInfoData(contactData: ContactInfoData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("contact_info_content")
    .update({
      address: contactData.address,
      city: contactData.city,
      country: contactData.country,
      main_phone: contactData.mainPhone,
      support_phone: contactData.supportPhone,
      email: contactData.email,
      map_url: contactData.mapUrl,
      social_media_links: contactData.socialMedia,
    })
    .eq("id", 1)
  if (error) {
    console.error("Error updating contact info:", error.message)
    return { success: false, message: `Failed to update contact info: ${error.message}` }
  }
  revalidatePath("/admin/content")
  revalidatePath("/contact")
  return { success: true, message: "Contact information updated." }
}

// --- Solution Types ---
export interface SolutionBenefit {
  id?: string // Only for reading/updating existing
  benefit_text: string
  sort_order?: number
}

export interface Solution {
  id: string
  title: string
  description: string | null
  image_url: string | null
  featured: boolean
  benefits: SolutionBenefit[]
  created_at?: string
  updated_at?: string
}

export interface SolutionInput {
  // For create/update operations
  title: string
  description: string | null
  image_url: string | null
  featured: boolean
  benefits: string[] // Array of benefit texts
}

// --- Solutions CRUD Actions ---

export async function getSolutions(): Promise<Solution[]> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch all solutions...")
  const { data: solutionsData, error: solutionsError } = await supabase
    .from("solutions")
    .select("id, title, description, image_url, featured, created_at, updated_at")
    .order("title", { ascending: true })

  if (solutionsError) {
    console.error("Error fetching solutions:", solutionsError.message)
    return []
  }
  if (!solutionsData) {
    console.log("No solutions found.")
    return []
  }

  console.log(`Successfully fetched ${solutionsData.length} solutions. Fetching benefits...`)

  const solutionsWithBenefits = await Promise.all(
    solutionsData.map(async (solution) => {
      const { data: benefitsData, error: benefitsError } = await supabase
        .from("solution_benefits")
        .select("id, benefit_text, sort_order")
        .eq("solution_id", solution.id)
        .order("sort_order", { ascending: true })

      if (benefitsError) {
        console.error(`Error fetching benefits for solution ${solution.id}:`, benefitsError.message)
        return { ...solution, benefits: [] }
      }
      return { ...solution, benefits: benefitsData || [] }
    }),
  )
  console.log("Finished fetching benefits for all solutions.")
  return solutionsWithBenefits
}

export async function getSolutionById(id: string): Promise<Solution | null> {
  const supabase = await createSupabaseServerClient()
  console.log(`Attempting to fetch solution with id: ${id}`)
  const { data: solutionData, error: solutionError } = await supabase
    .from("solutions")
    .select("id, title, description, image_url, featured, created_at, updated_at")
    .eq("id", id)
    .single()

  if (solutionError) {
    console.error(`Error fetching solution ${id}:`, solutionError.message)
    return null
  }
  if (!solutionData) {
    console.log(`Solution with id ${id} not found.`)
    return null
  }

  console.log(`Successfully fetched solution ${id}. Fetching benefits...`)

  const { data: benefitsData, error: benefitsError } = await supabase
    .from("solution_benefits")
    .select("id, benefit_text, sort_order")
    .eq("solution_id", solutionData.id)
    .order("sort_order", { ascending: true })

  if (benefitsError) {
    console.error(`Error fetching benefits for solution ${id}:`, benefitsError.message)
    // Return solution data even if benefits fail, with empty benefits array
    return { ...solutionData, benefits: [] }
  }

  console.log(`Finished fetching benefits for solution ${id}.`)
  return { ...solutionData, benefits: benefitsData || [] }
}

export async function addSolution(solutionInput: SolutionInput) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to add new solution:", solutionInput.title)

  // Insert into solutions table
  const { data: newSolution, error: solutionInsertError } = await supabase
    .from("solutions")
    .insert({
      title: solutionInput.title,
      description: solutionInput.description,
      image_url: solutionInput.image_url,
      featured: solutionInput.featured,
    })
    .select("id, title, description, image_url, featured, created_at, updated_at")
    .single()

  if (solutionInsertError) {
    console.error("Error inserting new solution:", solutionInsertError.message)
    return { success: false, message: `Failed to add solution: ${solutionInsertError.message}`, solution: null }
  }
  if (!newSolution) {
    console.error("Failed to insert solution, no data returned.")
    return { success: false, message: "Failed to add solution, no data returned.", solution: null }
  }

  console.log(`Solution ${newSolution.id} added. Adding benefits...`)

  // Insert benefits
  if (solutionInput.benefits && solutionInput.benefits.length > 0) {
    const benefitRecords = solutionInput.benefits.map((benefit, index) => ({
      solution_id: newSolution.id,
      benefit_text: benefit,
      sort_order: index,
    }))

    const { error: benefitsInsertError } = await supabase.from("solution_benefits").insert(benefitRecords)

    if (benefitsInsertError) {
      console.error(`Error inserting benefits for solution ${newSolution.id}:`, benefitsInsertError.message)
      // Optionally, delete the just-created solution if benefits fail, or just warn
      return {
        success: false,
        message: `Solution added, but failed to add benefits: ${benefitsInsertError.message}`,
        solution: { ...newSolution, benefits: [] },
      }
    }
  }

  const finalSolutionData = await getSolutionById(newSolution.id) // Fetch again to get benefits properly associated

  revalidatePath("/admin/solutions")
  revalidatePath("/solutions")
  revalidatePath("/") // Solutions might be on homepage
  console.log(`Solution ${newSolution.title} and its benefits added successfully.`)
  return { success: true, message: "Solution added successfully.", solution: finalSolutionData }
}

export async function updateSolution(id: string, solutionInput: SolutionInput) {
  const supabase = await createSupabaseServerClient()
  console.log(`Attempting to update solution: ${id}`)

  // Update solutions table
  const { data: updatedSolutionData, error: solutionUpdateError } = await supabase
    .from("solutions")
    .update({
      title: solutionInput.title,
      description: solutionInput.description,
      image_url: solutionInput.image_url,
      featured: solutionInput.featured,
    })
    .eq("id", id)
    .select("id") // select to confirm update
    .single()

  if (solutionUpdateError) {
    console.error(`Error updating solution ${id}:`, solutionUpdateError.message)
    return { success: false, message: `Failed to update solution: ${solutionUpdateError.message}` }
  }
  if (!updatedSolutionData) {
    console.error(`Failed to update solution ${id}, no data returned or not found.`)
    return { success: false, message: `Failed to update solution ${id}, not found or no change.` }
  }

  console.log(`Solution ${id} updated. Managing benefits...`)

  // Delete existing benefits for this solution
  const { error: deleteBenefitsError } = await supabase.from("solution_benefits").delete().eq("solution_id", id)

  if (deleteBenefitsError) {
    console.error(`Error deleting old benefits for solution ${id}:`, deleteBenefitsError.message)
    return {
      success: false,
      message: `Solution updated, but failed to manage benefits (delete step): ${deleteBenefitsError.message}`,
    }
  }

  // Insert new benefits
  if (solutionInput.benefits && solutionInput.benefits.length > 0) {
    const benefitRecords = solutionInput.benefits.map((benefit, index) => ({
      solution_id: id,
      benefit_text: benefit,
      sort_order: index,
    }))
    const { error: insertBenefitsError } = await supabase.from("solution_benefits").insert(benefitRecords)

    if (insertBenefitsError) {
      console.error(`Error inserting new benefits for solution ${id}:`, insertBenefitsError.message)
      return {
        success: false,
        message: `Solution updated, but failed to manage benefits (insert step): ${insertBenefitsError.message}`,
      }
    }
  }

  revalidatePath("/admin/solutions")
  revalidatePath(`/solutions/${id}`)
  revalidatePath("/solutions")
  revalidatePath("/")
  console.log(`Solution ${id} and its benefits updated successfully.`)
  return { success: true, message: "Solution updated successfully." }
}

export async function deleteSolution(id: string) {
  const supabase = await createSupabaseServerClient()
  console.log(`Attempting to delete solution: ${id}`)

  // Deleting from 'solutions' table will cascade delete from 'solution_benefits'
  // due to ON DELETE CASCADE in the foreign key constraint.
  const { error } = await supabase.from("solutions").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting solution ${id}:`, error.message)
    return { success: false, message: `Failed to delete solution: ${error.message}` }
  }

  revalidatePath("/admin/solutions")
  revalidatePath("/solutions")
  revalidatePath("/")
  console.log(`Solution ${id} deleted successfully.`)
  return { success: true, message: "Solution deleted successfully." }
}

// --- Product Category Types ---
export interface ProductCategory {
  id: string
  name: string
  description: string | null
  slug: string
  created_at?: string
  updated_at?: string
}

export interface ProductCategoryInput {
  name: string
  description: string | null
  slug: string
}

// --- Product Types ---
export interface ProductFeature {
  id?: string // For existing features during update
  feature_text: string
  sort_order: number
}

export interface ProductSpecification {
  [key: string]: string | number | boolean // Flexible key-value pairs
}

// Update Product and ProductInput interfaces to remove related products
export interface Product {
  id: string // db uuid
  slug: string // url-friendly identifier, matches old id
  name: string
  category_id: string
  category_name?: string // Joined for convenience
  category_slug?: string // Joined for convenience
  short_description: string | null
  full_description: string | null
  main_image_url: string | null
  data_sheet_url: string | null
  featured: boolean
  status: "active" | "inactive"
  specifications: ProductSpecification | null
  features: ProductFeature[]
  created_at?: string
  updated_at?: string
}

export interface ProductInput {
  slug: string
  name: string
  category_id: string
  short_description: string | null
  full_description: string | null
  main_image_url: string | null
  data_sheet_url: string | null
  featured: boolean
  status: "active" | "inactive"
  specifications: ProductSpecification | null
  feature_texts: string[] // Array of feature texts for create/update
}

// --- Product Category CRUD Actions ---

export async function getProductCategories(): Promise<ProductCategory[]> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch all product categories...")
  const { data, error } = await supabase
    .from("product_categories")
    .select("id, name, description, slug, created_at, updated_at")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching product categories:", error.message)
    return []
  }
  console.log(`Successfully fetched ${data?.length || 0} product categories.`)
  return data || []
}

export async function addProductCategory(categoryInput: ProductCategoryInput) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to add new product category:", categoryInput.name)
  const { data, error } = await supabase.from("product_categories").insert(categoryInput).select().single()

  if (error) {
    console.error("Error adding product category:", error.message)
    return { success: false, message: `Failed to add category: ${error.message}`, category: null }
  }
  revalidatePath("/admin/products") // Or a dedicated categories admin page
  revalidatePath("/products")
  return { success: true, message: "Product category added.", category: data }
}

export async function updateProductCategory(id: string, categoryInput: ProductCategoryInput) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to update product category:", id)
  const { data, error } = await supabase.from("product_categories").update(categoryInput).eq("id", id).select().single()

  if (error) {
    console.error("Error updating product category:", error.message)
    return { success: false, message: `Failed to update category: ${error.message}`, category: null }
  }
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, message: "Product category updated.", category: data }
}

export async function deleteProductCategory(id: string) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to delete product category:", id)
  // Check if any products are using this category
  const { data: productsInCategory, error: productCheckError } = await supabase
    .from("products")
    .select("id")
    .eq("category_id", id)
    .limit(1)

  if (productCheckError) {
    console.error("Error checking products in category:", productCheckError.message)
    return { success: false, message: `Error checking products: ${productCheckError.message}` }
  }
  if (productsInCategory && productsInCategory.length > 0) {
    return { success: false, message: "Cannot delete category: It is currently assigned to one or more products." }
  }

  const { error } = await supabase.from("product_categories").delete().eq("id", id)
  if (error) {
    console.error("Error deleting product category:", error.message)
    return { success: false, message: `Failed to delete category: ${error.message}` }
  }
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, message: "Product category deleted." }
}

// --- Product CRUD Actions ---

// Update getProducts to remove related products fetching
export async function getProducts(filters?: { categorySlug?: string; featured?: boolean }): Promise<Product[]> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch products with filters:", filters)

  let query = supabase
    .from("products")
    .select(
      `
      id, slug, name, short_description, full_description, main_image_url, data_sheet_url, featured, status, specifications, created_at, updated_at,
      category_id,
      product_categories ( name, slug )
    `,
    )
    .order("name", { ascending: true })

  if (filters?.categorySlug && filters.categorySlug !== "all") {
    // Assuming 'all' slug means no category filter
    const { data: category } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .single()
    if (category) {
      query = query.eq("category_id", category.id)
    } else {
      console.warn(`Category with slug ${filters.categorySlug} not found. Returning no products for this category.`)
      return []
    }
  }
  if (typeof filters?.featured === "boolean") {
    query = query.eq("featured", filters.featured)
  }

  const { data: productsData, error: productsError } = await query

  if (productsError) {
    console.error("Error fetching products:", productsError.message)
    return []
  }
  if (!productsData) {
    console.log("No products found for the given filters.")
    return []
  }

  console.log(`Successfully fetched ${productsData.length} products. Fetching features...`)

  const productsWithDetails = await Promise.all(
    productsData.map(async (product) => {
      const { data: featuresData, error: featuresError } = await supabase
        .from("product_features")
        .select("id, feature_text, sort_order")
        .eq("product_id", product.id)
        .order("sort_order", { ascending: true })

      if (featuresError) {
        console.error(`Error fetching features for product ${product.id}:`, featuresError.message)
      }

      const category_name = (product.product_categories as any)?.name
      const category_slug = (product.product_categories as any)?.slug

      return {
        ...product,
        category_name,
        category_slug,
        product_categories: undefined,
        features: featuresData || [],
      }
    }),
  )

  console.log("Finished processing products with features.")
  return productsWithDetails as Product[]
}

// Update getProductBySlug to remove related products fetching
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient()
  console.log(`Attempting to fetch product by slug: ${slug}`)

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      `
      id, slug, name, short_description, full_description, main_image_url, data_sheet_url, featured, status, specifications, created_at, updated_at,
      category_id,
      product_categories ( name, slug )
    `,
    )
    .eq("slug", slug)
    .single()

  if (productError) {
    console.error(`Error fetching product with slug ${slug}:`, productError.message)
    return null
  }
  if (!productData) {
    console.log(`Product with slug ${slug} not found.`)
    return null
  }

  console.log(`Successfully fetched product ${slug}. Fetching features...`) // Removed "and related products"

  const { data: featuresData, error: featuresError } = await supabase
    .from("product_features")
    .select("id, feature_text, sort_order")
    .eq("product_id", productData.id)
    .order("sort_order", { ascending: true })

  if (featuresError) console.error(`Error fetching features for product ${slug}:`, featuresError.message)

  const category_name = (productData.product_categories as any)?.name
  const category_slug = (productData.product_categories as any)?.slug

  return {
    ...productData,
    category_name,
    category_slug,
    product_categories: undefined,
    features: featuresData || [],
  } as Product
}

// Update addProduct to remove related products logic
export async function addProduct(productInput: ProductInput) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to add new product:", productInput.name)

  // Remove related_product_slugs from destructuring
  const { feature_texts, ...productCoreInput } = productInput

  const { data: newProduct, error: productInsertError } = await supabase
    .from("products")
    .insert(productCoreInput)
    .select("id, slug, category_id")
    .single()

  if (productInsertError) {
    console.error("Error inserting new product:", productInsertError.message, productInsertError.details)
    return { success: false, message: `Failed to add product: ${productInsertError.message}`, product: null }
  }
  if (!newProduct) {
    return { success: false, message: "Failed to add product, no data returned.", product: null }
  }

  console.log(`Product ${newProduct.id} (${newProduct.slug}) added. Managing features...`) // Removed "and related products"

  if (feature_texts && feature_texts.length > 0) {
    const featureRecords = feature_texts.map((text, index) => ({
      product_id: newProduct.id,
      feature_text: text,
      sort_order: index,
    }))
    const { error: featuresInsertError } = await supabase.from("product_features").insert(featureRecords)
    if (featuresInsertError) {
      console.warn(`Product added, but failed to add features for ${newProduct.slug}:`, featuresInsertError.message)
    }
  }

  const finalProductData = await getProductBySlug(newProduct.slug)
  const category = await supabase.from("product_categories").select("slug").eq("id", newProduct.category_id).single()

  revalidatePath("/admin/products")
  revalidatePath("/products")
  if (category.data?.slug) {
    revalidatePath(`/products/${category.data.slug}`)
    revalidatePath(`/products/${category.data.slug}/${newProduct.slug}`)
  }
  return { success: true, message: "Product added successfully.", product: finalProductData }
}

// Update updateProduct to remove related products logic
export async function updateProduct(productSlug: string, productInput: ProductInput) {
  const supabase = await createSupabaseServerClient()
  console.log(`Attempting to update product: ${productSlug}`)

  // Remove related_product_slugs from destructuring
  const { feature_texts, ...productCoreInput } = productInput

  const { data: existingProduct, error: fetchError } = await supabase
    .from("products")
    .select("id, category_id")
    .eq("slug", productSlug)
    .single()

  if (fetchError || !existingProduct) {
    console.error(`Error fetching product ID for slug ${productSlug}:`, fetchError?.message)
    return { success: false, message: `Product with slug ${productSlug} not found.` }
  }
  const productId = existingProduct.id

  const { data: updatedProductData, error: productUpdateError } = await supabase
    .from("products")
    .update(productCoreInput)
    .eq("id", productId)
    .select("id, slug, category_id")
    .single()

  if (productUpdateError) {
    console.error(`Error updating product ${productSlug}:`, productUpdateError.message)
    return { success: false, message: `Failed to update product: ${productUpdateError.message}` }
  }
  if (!updatedProductData) {
    return { success: false, message: `Failed to update product ${productSlug}, not found or no change.` }
  }

  console.log(`Product ${productSlug} updated. Managing features...`) // Removed "and related products"

  await supabase.from("product_features").delete().eq("product_id", productId)
  if (feature_texts && feature_texts.length > 0) {
    const featureRecords = feature_texts.map((text, index) => ({
      product_id: productId,
      feature_text: text,
      sort_order: index,
    }))
    await supabase.from("product_features").insert(featureRecords)
  }

  const finalProductData = await getProductBySlug(updatedProductData.slug)
  const oldCategory = await supabase
    .from("product_categories")
    .select("slug")
    .eq("id", existingProduct.category_id)
    .single()
  const newCategory = await supabase
    .from("product_categories")
    .select("slug")
    .eq("id", updatedProductData.category_id)
    .single()

  revalidatePath("/admin/products")
  revalidatePath("/products")
  if (oldCategory.data?.slug) revalidatePath(`/products/${oldCategory.data.slug}`)
  if (newCategory.data?.slug && newCategory.data.slug !== oldCategory.data?.slug) {
    revalidatePath(`/products/${newCategory.data.slug}`)
  }
  revalidatePath(`/products/${newCategory.data?.slug}/${updatedProductData.slug}`)

  return { success: true, message: "Product updated successfully." }
}

// Update deleteProduct to remove related products logic (already handled by cascade, but good to review)
export async function deleteProduct(productSlug: string) {
  const supabase = await createSupabaseServerClient()
  console.log(`Attempting to delete product: ${productSlug}`)

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("id, category_id, product_categories(slug)")
    .eq("slug", productSlug)
    .single()

  if (fetchError || !product) {
    console.error(`Error fetching product for deletion ${productSlug}:`, fetchError?.message)
    return { success: false, message: `Product ${productSlug} not found.` }
  }

  const { error } = await supabase.from("products").delete().eq("id", product.id)

  if (error) {
    console.error(`Error deleting product ${productSlug}:`, error.message)
    return { success: false, message: `Failed to delete product: ${error.message}` }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  const categorySlug = (product.product_categories as any)?.slug
  if (categorySlug) {
    revalidatePath(`/products/${categorySlug}`)
    revalidatePath(`/products/${categorySlug}/${productSlug}`)
  }
  return { success: true, message: "Product deleted successfully." }
}
