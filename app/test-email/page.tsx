"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"

export default function TestEmailPage() {
  const [email, setEmail] = useState("fitseyotor@gmail.com")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function sendTestEmail() {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Test Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Test your SMTP email configuration by sending a sample email.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipient Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <Button
                  onClick={sendTestEmail}
                  disabled={loading || !email}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            </div>

            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? "text-green-900" : "text-red-900"}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-100 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">SMTP Configuration:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• Host: mail.eversparket.com</li>
                <li>• Port: 465 (SSL)</li>
                <li>• From: account@eversparket.com</li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                Make sure to set SMTP_PASSWORD in your .env.local file
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
