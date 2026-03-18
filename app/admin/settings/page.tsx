"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, Download, RefreshCw, Shield, Globe, Bell } from "lucide-react"
import Image from "next/image"
import {
  getGeneralSettings,
  updateGeneralSettings,
  type GeneralSettingsData,
  getSeoSettings,
  updateSeoSettings,
  type SeoSettingsData,
  getEmailSettings,
  updateEmailSettings,
  type EmailSettingsData,
} from "./actions" // Import new actions and types

export default function SettingsManagement() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsData>({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    timezone: "",
    language: "",
    siteLogoUrl: null,
    socialMediaLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
    },
  })
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const [seoSettings, setSeoSettings] = useState<SeoSettingsData>({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    googleAnalyticsId: "",
    googleSearchConsole: "",
    robotsTxt: "",
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettingsData>({
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "noreply@everspark.com",
    fromName: "Ever Spark Technologies",
    enableNotifications: true,
    notificationEmail: "admin@everspark.com",
  })

  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    requireSpecialChars: true,
    enableCaptcha: true,
    allowedIPs: "",
  })

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: "30",
    backupLocation: "cloud",
    lastBackup: "2024-01-15T10:30:00Z",
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    enableAPI: true,
    apiKey: "sk_live_...",
    webhookUrl: "",
    enableWebhooks: false,
  })

  useEffect(() => {
    const loadSettings = async () => {
      // Load general settings
      const generalData = await getGeneralSettings()
      if (generalData) {
        setGeneralSettings(generalData)
      }

      // Load SEO settings
      const seoData = await getSeoSettings()
      if (seoData) {
        setSeoSettings(seoData)
      }

      // Load Email settings
      const emailData = await getEmailSettings()
      if (emailData) {
        setEmailSettings(emailData)
      }
    }
    loadSettings()
  }, [])

  const handleSaveSettings = async (settingsType: string) => {
    if (settingsType === "General") {
      const result = await updateGeneralSettings(generalSettings)
      if (result.success) {
        alert(result.message)
      } else {
        alert(`Error: ${result.message}`)
      }
    } else if (settingsType === "SEO") {
      const result = await updateSeoSettings(seoSettings)
      if (result.success) {
        alert(result.message)
      } else {
        alert(`Error: ${result.message}`)
      }
    } else if (settingsType === "Email") {
      const result = await updateEmailSettings(emailSettings)
      if (result.success) {
        alert(result.message)
      } else {
        alert(`Error: ${result.message}`)
      }
    } else {
      alert(`${settingsType} settings saved successfully! (Not yet integrated with DB)`)
    }
  }

  const handleBackupNow = () => {
    alert("Backup initiated successfully!")
  }

  const handleRestoreBackup = () => {
    if (confirm("Are you sure you want to restore from backup? This will overwrite current data.")) {
      alert("Restore initiated successfully!")
    }
  }

  const generateNewAPIKey = () => {
    const newKey = "sk_live_" + Math.random().toString(36).substring(2, 15)
    setIntegrationSettings({ ...integrationSettings, apiKey: newKey })
  }

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedLogoFile(event.target.files[0])
    } else {
      setSelectedLogoFile(null)
    }
  }

  const handleLogoUpload = async () => {
    if (!selectedLogoFile) {
      alert("Please select a file to upload.")
      return
    }

    setIsUploadingLogo(true)
    const formData = new FormData()
    formData.append("file", selectedLogoFile)
    formData.append("type", "logo") // Use 'logo' type for specific folder in blob storage

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.url) {
        const updatedSettings = { ...generalSettings, siteLogoUrl: data.url }
        setGeneralSettings(updatedSettings) // Update local state
        setSelectedLogoFile(null) // Clear selected file after upload

        // Automatically save general settings after successful logo upload
        const saveResult = await updateGeneralSettings(updatedSettings)
        if (saveResult.success) {
          alert("Logo uploaded and settings saved successfully!")
        } else {
          alert(`Logo uploaded, but failed to save settings: ${saveResult.message}`)
        }
      } else {
        alert("Logo upload failed: No URL returned.")
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      alert(`Error uploading logo: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003300]">Settings</h1>
          <p className="text-gray-600">Manage your website settings and configurations</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* ... existing General tab content ... */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <Input
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                      placeholder="Site name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <Input
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                      placeholder="Contact email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <Textarea
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                    placeholder="Site description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <Input
                      value={generalSettings.contactPhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                      placeholder="Contact phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <Select
                      value={generalSettings.timezone}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Textarea
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                    placeholder="Company address"
                    rows={2}
                  />
                </div>

                {/* Logo Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
                  {generalSettings.siteLogoUrl && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                      <Image
                        src={generalSettings.siteLogoUrl || "/placeholder.svg"}
                        alt="Site Logo"
                        width={150}
                        height={50}
                        className="max-w-[150px] h-auto border rounded"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={handleLogoFileChange} className="flex-1" />
                    <Button onClick={handleLogoUpload} disabled={!selectedLogoFile || isUploadingLogo}>
                      {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                      <Upload className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  {selectedLogoFile && <p className="text-sm text-gray-500 mt-1">Selected: {selectedLogoFile.name}</p>}
                </div>

                {/* Social Media Links Section */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Social Media Links</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                      <Input
                        value={generalSettings.socialMediaLinks.facebook}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            socialMediaLinks: { ...generalSettings.socialMediaLinks, facebook: e.target.value },
                          })
                        }
                        placeholder="https://facebook.com/everspark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                      <Input
                        value={generalSettings.socialMediaLinks.twitter}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            socialMediaLinks: { ...generalSettings.socialMediaLinks, twitter: e.target.value },
                          })
                        }
                        placeholder="https://twitter.com/everspark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                      <Input
                        value={generalSettings.socialMediaLinks.linkedin}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            socialMediaLinks: { ...generalSettings.socialMediaLinks, linkedin: e.target.value },
                          })
                        }
                        placeholder="https://linkedin.com/company/everspark"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSettings("General")}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <Input
                    value={seoSettings.metaTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                    placeholder="Meta title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <Textarea
                    value={seoSettings.metaDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                    placeholder="Meta description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                  <Input
                    value={seoSettings.metaKeywords}
                    onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                    placeholder="Meta keywords (comma separated)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                    <Input
                      value={seoSettings.googleAnalyticsId}
                      onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                      placeholder="GA-XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Search Console</label>
                    <Input
                      value={seoSettings.googleSearchConsole}
                      onChange={(e) => setSeoSettings({ ...seoSettings, googleSearchConsole: e.target.value })}
                      placeholder="Verification code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Robots.txt</label>
                  <Textarea
                    value={seoSettings.robotsTxt}
                    onChange={(e) => setSeoSettings({ ...seoSettings, robotsTxt: e.target.value })}
                    placeholder="Robots.txt content"
                    rows={5}
                  />
                </div>

                <Button
                  onClick={() => handleSaveSettings("SEO")}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save SEO Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Email Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                    <Input
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                    <Input
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                    <Input
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                      placeholder="Username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                    <Input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                    <Input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                      placeholder="noreply@everspark.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                    <Input
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                      placeholder="Ever Spark Technologies"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive email notifications for new messages</p>
                  </div>
                  <Switch
                    checked={emailSettings.enableNotifications}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableNotifications: checked })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email</label>
                  <Input
                    type="email"
                    value={emailSettings.notificationEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, notificationEmail: e.target.value })}
                    placeholder="admin@everspark.com"
                  />
                </div>

                <Button
                  onClick={() => handleSaveSettings("Email")}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... existing Security, Backup, and Integrations tabs ... */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableTwoFactor}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Password Length</label>
                    <Input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                      placeholder="8"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Require Special Characters</h4>
                    <p className="text-sm text-gray-500">Require special characters in passwords</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireSpecialChars}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, requireSpecialChars: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Enable CAPTCHA</h4>
                    <p className="text-sm text-gray-500">Enable CAPTCHA for login and contact forms</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableCaptcha}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableCaptcha: checked })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed IP Addresses</label>
                  <Textarea
                    value={securitySettings.allowedIPs}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, allowedIPs: e.target.value })}
                    placeholder="Enter IP addresses (one per line) or leave empty to allow all"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => handleSaveSettings("Security")}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">Backup & Restore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Automatic Backup</h4>
                    <p className="text-sm text-gray-500">Automatically backup your data</p>
                  </div>
                  <Switch
                    checked={backupSettings.autoBackup}
                    onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, autoBackup: checked })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                    <Select
                      value={backupSettings.backupFrequency}
                      onValueChange={(value) => setBackupSettings({ ...backupSettings, backupFrequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retention (days)</label>
                    <Input
                      type="number"
                      value={backupSettings.backupRetention}
                      onChange={(e) => setBackupSettings({ ...backupSettings, backupRetention: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
                    <Select
                      value={backupSettings.backupLocation}
                      onValueChange={(value) => setBackupSettings({ ...backupSettings, backupLocation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="cloud">Cloud Storage</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Last Backup</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(backupSettings.lastBackup).toLocaleDateString()} at{" "}
                    {new Date(backupSettings.lastBackup).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleBackupNow} className="bg-[#003300] hover:bg-[#003300]/90 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Backup Now
                  </Button>
                  <Button
                    onClick={handleRestoreBackup}
                    variant="outline"
                    className="border-[#003300] text-[#003300] hover:bg-[#003300] hover:text-white bg-transparent"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Restore Backup
                  </Button>
                </div>

                <Button
                  onClick={() => handleSaveSettings("Backup")}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Backup Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">Integrations & API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Enable API</h4>
                    <p className="text-sm text-gray-500">Allow external applications to access your data</p>
                  </div>
                  <Switch
                    checked={integrationSettings.enableAPI}
                    onCheckedChange={(checked) =>
                      setIntegrationSettings({ ...integrationSettings, enableAPI: checked })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <div className="flex gap-2">
                    <Input
                      value={integrationSettings.apiKey}
                      onChange={(e) => setIntegrationSettings({ ...integrationSettings, apiKey: e.target.value })}
                      placeholder="API Key"
                      readOnly
                    />
                    <Button onClick={generateNewAPIKey} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Enable Webhooks</h4>
                    <p className="text-sm text-gray-500">Send notifications to external services</p>
                  </div>
                  <Switch
                    checked={integrationSettings.enableWebhooks}
                    onCheckedChange={(checked) =>
                      setIntegrationSettings({ ...integrationSettings, enableWebhooks: checked })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                  <Input
                    value={integrationSettings.webhookUrl}
                    onChange={(e) => setIntegrationSettings({ ...integrationSettings, webhookUrl: e.target.value })}
                    placeholder="https://your-app.com/webhook"
                  />
                </div>

                <Button
                  onClick={() => handleSaveSettings("Integration")}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Integration Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
