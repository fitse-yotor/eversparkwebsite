"use client"

import { useState, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login, signup } from "@/app/auth/actions"
import { getGeneralSettings, type GeneralSettingsData } from "@/app/admin/settings/actions"
import Image from "next/image"
import { AlertCircle, CheckCircle2 } from "lucide-react"

function SubmitButton({ isLoginMode }: { isLoginMode: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#003300] hover:bg-[#003300]/90 text-white"
    >
      {pending ? "Please wait..." : isLoginMode ? "Log in" : "Sign up"}
    </Button>
  )
}

export default function AdminLoginPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsData | null>(null)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [loginState, loginAction] = useFormState(login, null)
  const [signupState, signupAction] = useFormState(signup, null)

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

  const currentState = isLoginMode ? loginState : signupState
  const currentAction = isLoginMode ? loginAction : signupAction

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
          <CardDescription>{isLoginMode ? "Log in to your account" : "Create a new account"}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentState && !currentState.success && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentState.message}</AlertDescription>
            </Alert>
          )}
          {currentState && currentState.success && (
            <Alert className="mb-4 border-green-500 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{currentState.message}</AlertDescription>
            </Alert>
          )}
          <form action={currentAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <SubmitButton isLoginMode={isLoginMode} />
          </form>
          <div className="mt-4 text-center text-sm">
            {isLoginMode ? (
              <>
                Don&apos;t have an account?{" "}
                <Button variant="link" onClick={() => setIsLoginMode(false)} className="p-0 h-auto text-[#003300]">
                  Sign up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Button variant="link" onClick={() => setIsLoginMode(true)} className="p-0 h-auto text-[#003300]">
                  Log in
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
