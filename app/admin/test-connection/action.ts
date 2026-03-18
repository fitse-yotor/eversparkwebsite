"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server" // Adjusted path

interface TestConnectionResult {
  success: boolean
  message: string
  data?: any
}

export async function testTableConnection(): Promise<TestConnectionResult> {
  console.log("--- Starting Supabase Connection Test ---")

  let supabase
  try {
    supabase = createSupabaseServerClient() // Using service role for direct table access test
    console.log("Supabase client initialized for connection test.")
  } catch (e: any) {
    const errorMessage = `Test Failed: Supabase client initialization failed: ${e.message}`
    console.error(errorMessage)
    console.dir(e, { depth: 5 })
    return { success: false, message: errorMessage, data: null }
  }

  try {
    console.log("Attempting to query Supabase 'auth.users' table for count...")
    // Supabase uses `auth.users` for authentication by default.
    // If you have a separate 'profiles' or 'users' table for public data, query that.
    // For this test, let's try to count users in the auth schema.
    // Note: Direct querying of auth.users might require service_role key.
    const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true })

    if (error) {
      console.error("--- TEST FAILED: SUPABASE QUERY ---")
      console.error("The query to count rows in 'users' table failed. The raw error is:")
      console.dir(error, { depth: 5 })
      const errorMessage = `Test Failed: The Supabase query failed: ${error.message}. Check server logs.`
      return { success: false, message: errorMessage, data: { error } }
    }

    console.log("Query executed successfully.")
    console.log("Row count in 'users' table:", count)
    const successMessage = `Test Succeeded: Successfully connected to Supabase and found ${count} row(s) in the 'users' table.`
    console.log(successMessage)
    return { success: true, message: successMessage, data: { count } }
  } catch (e: any) {
    // This catch block might be redundant if the Supabase client handles errors gracefully by returning an `error` object.
    // However, it's here as a safeguard for unexpected issues.
    console.error("--- TEST FAILED: UNEXPECTED ERROR DURING QUERY ---")
    console.dir(e, { depth: 5 })
    const errorMessage = `Test Failed: An unexpected error occurred during the query: ${String(e)}`
    return { success: false, message: errorMessage, data: null }
  }
}
