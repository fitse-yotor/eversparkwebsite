"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// --- Types ---
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

export interface SeoSettingsData {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  googleAnalyticsId: string
  googleSearchConsole: string
  robotsTxt: string
}

export interface EmailSettingsData {
  smtpHost: string
  smtpPort: string
  smtpUsername: string
  smtpPassword: string
  fromEmail: string
  fromName: string
  enableNotifications: boolean
  notificationEmail: string
}

// --- General Settings Actions ---
export async function getGeneralSettings(): Promise<GeneralSettingsData | null> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch general settings...")
  const { data, error } = await supabase
    .from("general_settings")
    .select(
      "site_name, site_description, contact_email, contact_phone, address, timezone, language, site_logo_url, social_media_links",
    )
    .eq("id", 1)
    .single()

  if (error) {
    console.error("Error fetching general settings:", error.message)
    return null
  }
  console.log("Successfully fetched general settings.")
  return data
    ? {
        siteName: data.site_name,
        siteDescription: data.site_description,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        address: data.address,
        timezone: data.timezone,
        language: data.language,
        siteLogoUrl: data.site_logo_url,
        socialMediaLinks: data.social_media_links || { facebook: "", twitter: "", linkedin: "" }, // Ensure default if null
      }
    : null
}

export async function updateGeneralSettings(settings: GeneralSettingsData) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to update general settings:", settings.siteName)
  const { error } = await supabase
    .from("general_settings")
    .update({
      site_name: settings.siteName,
      site_description: settings.siteDescription,
      contact_email: settings.contactEmail,
      contact_phone: settings.contactPhone,
      address: settings.address,
      timezone: settings.timezone,
      language: settings.language,
      site_logo_url: settings.siteLogoUrl,
      social_media_links: settings.socialMediaLinks,
    })
    .eq("id", 1)

  if (error) {
    console.error("Error updating general settings:", error.message)
    return { success: false, message: `Failed to update general settings: ${error.message}` }
  }
  revalidatePath("/admin/settings")
  revalidatePath("/") // Revalidate homepage as it might use these settings
  return { success: true, message: "General settings updated successfully." }
}

export async function getSeoSettings(): Promise<SeoSettingsData | null> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch SEO settings...")
  const { data, error } = await supabase
    .from("seo_settings")
    .select("meta_title, meta_description, meta_keywords, google_analytics_id, google_search_console, robots_txt")
    .eq("id", 1)
    .single()

  if (error) {
    console.error("Error fetching SEO settings:", error.message)
    return null
  }
  console.log("Successfully fetched SEO settings.")
  return data
    ? {
        metaTitle: data.meta_title,
        metaDescription: data.meta_description,
        metaKeywords: data.meta_keywords,
        googleAnalyticsId: data.google_analytics_id,
        googleSearchConsole: data.google_search_console,
        robotsTxt: data.robots_txt,
      }
    : null
}

export async function updateSeoSettings(settings: SeoSettingsData) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to update SEO settings...")
  const { error } = await supabase
    .from("seo_settings")
    .update({
      meta_title: settings.metaTitle,
      meta_description: settings.metaDescription,
      meta_keywords: settings.metaKeywords,
      google_analytics_id: settings.googleAnalyticsId,
      google_search_console: settings.googleSearchConsole,
      robots_txt: settings.robotsTxt,
    })
    .eq("id", 1)

  if (error) {
    console.error("Error updating SEO settings:", error.message)
    return { success: false, message: `Failed to update SEO settings: ${error.message}` }
  }
  revalidatePath("/admin/settings")
  return { success: true, message: "SEO settings updated successfully." }
}

export async function getEmailSettings(): Promise<EmailSettingsData | null> {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to fetch Email settings...")
  const { data, error } = await supabase
    .from("email_settings")
    .select(
      "smtp_host, smtp_port, smtp_username, smtp_password, from_email, from_name, enable_notifications, notification_email",
    )
    .eq("id", 1)
    .single()

  if (error) {
    console.error("Error fetching Email settings:", error.message)
    return null
  }
  console.log("Successfully fetched Email settings.")
  return data
    ? {
        smtpHost: data.smtp_host,
        smtpPort: data.smtp_port,
        smtpUsername: data.smtp_username,
        smtpPassword: data.smtp_password,
        fromEmail: data.from_email,
        fromName: data.from_name,
        enableNotifications: data.enable_notifications,
        notificationEmail: data.notification_email,
      }
    : null
}

export async function updateEmailSettings(settings: EmailSettingsData) {
  const supabase = await createSupabaseServerClient()
  console.log("Attempting to update Email settings...")
  const { error } = await supabase
    .from("email_settings")
    .update({
      smtp_host: settings.smtpHost,
      smtp_port: settings.smtpPort,
      smtp_username: settings.smtpUsername,
      smtp_password: settings.smtpPassword,
      from_email: settings.fromEmail,
      from_name: settings.fromName,
      enable_notifications: settings.enableNotifications,
      notification_email: settings.notificationEmail,
    })
    .eq("id", 1)

  if (error) {
    console.error("Error updating Email settings:", error.message)
    return { success: false, message: `Failed to update Email settings: ${error.message}` }
  }
  revalidatePath("/admin/settings")
  return { success: true, message: "Email settings updated successfully." }
}
