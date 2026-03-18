"use client"

import { useState, useEffect, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/app/auth/actions"
import { getGeneralSettings, type GeneralSettingsData } from "@/app/admin/settings/actions"
import Image from "next/image"
import Link from "next/link"
import { AlertCircle, LogIn } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#003300] hover:bg-[#003300]/90 text-white"
    >
      {pending ? "Logging in..." : (
        <>
          <LogIn className="w-4 h-4 mr-2" />
          Log in
        </>
      )}
    </Button>
  )
}

export default function LoginPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsData | null>(null)
  const [loginState, loginAction] = useActionState(login, null)

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getGeneralSettings()
      if (settings) {
        setGeneralSettings(settings)
      }
    }
    loadSettings()
  }, [])

  const siteName = generalSettings?.siteName || "Ever Spark Technologies"
  const siteLogoUrl = generalSettings?.siteLogoUrl || "/images/everspark-logo.png"

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f4f3] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {siteLogoUrl && (
            <div className="mb-4 flex justify-center">
              <Image
                src={siteLogoUrl || "/placeholder.svg"}
                alt={siteName}
                width={150}
                height={50}
                className="object-contain"
              />
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-[#003300]">{siteName}</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {loginState && !loginState.success && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginState.message}</AlertDescription>
            </Alert>
          )}
          
          <form action={loginAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="your.email@company.com" 
                required 
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-[#003300] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                autoComplete="current-password"
              />
            </div>
            <SubmitButton />
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Role-Based Access:</strong>
            </p>
            <ul className="text-xs text-blue-800 mt-2 space-y-1">
              <li>• HR Admins → HR Dashboard</li>
              <li>• Employees → Employee Portal</li>
              <li>• Super Admins → Full Access</li>
            </ul>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Contact your administrator if you need access or have forgotten your password.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
