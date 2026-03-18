"use client"

import { useState } from "react"
import { testTableConnection } from "./test-connection-action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestConnectionPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTestConnection = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const res = await testTableConnection()
      setResult(res)
    } catch (error) {
      console.error("Error calling testTableConnection action:", error)
      setResult({
        success: false,
        message: "Client-side error calling the test action.",
        errorDetails: String(error),
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Database Table Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the button to test the connection to the Neon database and query the 'users' table.
          </p>
          <Button onClick={handleTestConnection} disabled={isLoading} className="w-full">
            {isLoading ? "Testing..." : "Run Connection Test"}
          </Button>
          {result && (
            <div
              className={`mt-4 p-3 rounded-md ${result.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              <p className="font-semibold">Test Result:</p>
              <p>Status: {result.success ? "Success" : "Failed"}</p>
              <p>Message: {result.message}</p>
              {typeof result.rowCount !== "undefined" && result.rowCount !== null && (
                <p>Row Count in 'users': {result.rowCount}</p>
              )}
              {result.errorDetails && (
                <p className="mt-2 text-xs">
                  <span className="font-semibold">Error Details:</span>
                  <pre className="whitespace-pre-wrap break-all">{result.errorDetails}</pre>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
