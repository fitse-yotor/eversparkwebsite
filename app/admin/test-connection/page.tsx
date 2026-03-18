"use client"

import { useState } from "react"
import { testTableConnection } from "./action" // Assuming action.ts is in the same folder

// Define a type for the state
interface TestState {
  message: string
  success?: boolean
  data?: any
  loading: boolean
}

export default function TestConnectionPage() {
  const [state, setState] = useState<TestState>({
    message: "Click the button to start the Supabase test.",
    loading: false,
  })

  const handleTest = async () => {
    setState({ message: "Running Supabase test...", loading: true })
    const result = await testTableConnection()
    setState({
      message: result.message,
      success: result.success,
      data: result.data,
      loading: false,
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Supabase Connection Test</h1>
        <p className="mb-6 text-gray-600">
          This page tests the basic connectivity to Supabase and attempts to count the rows in the `users` table (or
          `auth.users`). Check the results below and the server logs for detailed output.
        </p>
        <button
          onClick={handleTest}
          disabled={state.loading}
          className="mb-6 w-full rounded-md bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {state.loading ? "Testing..." : "Run Supabase Connection Test"}
        </button>
        <div className="rounded-md bg-gray-100 p-4">
          <h2 className="mb-2 font-semibold text-gray-700">Test Result:</h2>
          <div
            className={`whitespace-pre-wrap break-words p-2 text-sm font-medium ${
              state.success === true ? "text-green-700" : state.success === false ? "text-red-700" : "text-gray-700"
            }`}
          >
            {state.message}
          </div>
          {state.data && (
            <pre className="mt-2 overflow-x-auto rounded bg-gray-200 p-2 text-xs text-gray-800">
              {JSON.stringify(state.data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
