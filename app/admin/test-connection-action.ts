"use server"

import { neon } from "@neondatabase/serverless"

interface TestConnectionResult {
  success: boolean
  message: string
  rowCount?: number | null
  errorDetails?: string | null
}

export async function testTableConnection(): Promise<TestConnectionResult> {
  console.log("Attempting to test table connection...")

  if (!process.env.POSTGRES_URL) {
    const errMsg = "CRITICAL: POSTGRES_URL environment variable is not set."
    console.error(errMsg)
    return {
      success: false,
      message: "Server configuration error: Database URL not configured.",
      errorDetails: errMsg,
    }
  }

  let sql: any

  try {
    console.log("Initializing Neon client for connection test...")
    sql = neon(process.env.POSTGRES_URL)
    console.log("Neon client initialized for connection test.")
    if (typeof sql !== "function") {
      const errMsg = "Neon client (sql) was initialized but is not a function."
      console.error("CRITICAL:", errMsg, "Type:", typeof sql)
      return {
        success: false,
        message: "Database client initialization failed: client is not a function.",
        errorDetails: errMsg,
      }
    }
  } catch (e: any) {
    console.error("CRITICAL: Error initializing Neon client for connection test:", e)
    let initErrorMessage = "Failed to initialize database connection."
    if (e instanceof Error && e.message) {
      initErrorMessage = `Database init error: ${e.message.substring(0, 200)}`
    } else if (typeof e === "string") {
      initErrorMessage = `Database init error (raw): ${e.substring(0, 200)}`
    }
    return { success: false, message: initErrorMessage, errorDetails: String(e) }
  }

  try {
    console.log("Attempting to query 'users' table for count...")
    // Performing a simple count query on the 'users' table
    const result = await sql`SELECT COUNT(*) as count FROM users`

    const rowCount = result[0]?.count
    console.log("'users' table count query successful. Row count:", rowCount)

    if (typeof rowCount === "undefined" || rowCount === null) {
      return {
        success: false,
        message: "Query executed but count was not returned as expected. Check table structure or query.",
        rowCount: null,
      }
    }

    return {
      success: true,
      message: `Successfully connected and queried 'users' table. Row count: ${rowCount}.`,
      rowCount: Number(rowCount),
    }
  } catch (error: any) {
    console.error("Error during 'users' table count query:")
    // Log detailed error information
    if (error === null) {
      console.error("Caught error is null.")
    } else if (error === undefined) {
      console.error("Caught error is undefined.")
    } else {
      console.error("Type of error:", typeof error)
      console.error("Error object (using console.error):", error)
      console.error(
        "Error object (stringified, if possible):",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      )
      console.error("Error object (toString):", String(error))
    }

    let safeErrorMessage = "Failed to query 'users' table."
    if (error instanceof Error) {
      safeErrorMessage = `Query Error: ${error.name} - ${error.message ? error.message.substring(0, 150) : "No message"}`
    } else if (typeof error === "string") {
      safeErrorMessage = `Query Error (string): ${error.substring(0, 150)}`
    } else if (error.message) {
      safeErrorMessage = `Query Error (object): ${String(error.message).substring(0, 150)}`
    } else {
      safeErrorMessage = `Query Error (unknown type): ${String(error).substring(0, 150)}`
    }

    return { success: false, message: safeErrorMessage, errorDetails: String(error) }
  }
}
