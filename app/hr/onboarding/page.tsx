"use client"

import { useState, useEffect } from "react"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, CheckCircle, AlertCircle, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HRUser {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  is_active: boolean
}

export default function HROnboardingPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitationSent, setInvitationSent] = useState(false)
  const [hrUsers, setHrUsers] = useState<HRUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [serviceKeyConfigured, setServiceKeyConfigured] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "admin", // admin or super_admin
    send_invitation: true
  })

  useEffect(() => {
    loadHRUsers()
    checkServiceKey()
  }, [])

  async function checkServiceKey() {
    try {
      const response = await fetch("/api/hr/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ check_only: true })
      })
      const result = await response.json()
      setServiceKeyConfigured(result.error !== "MISSING_SERVICE_ROLE_KEY")
    } catch {
      setServiceKeyConfigured(false)
    }
  }

  async function loadHRUsers() {
    setIsLoadingUsers(true)
    try {
      const response = await fetch("/api/hr/users")
      if (response.ok) {
        const data = await response.json()
        setHrUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error loading HR users:", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this HR user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/hr/users/${userId}`, {
        method: "DELETE"
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message || "HR user deleted successfully"
        })
        loadHRUsers()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete HR user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting HR user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Call API to create HR user
      const response = await fetch("/api/hr/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message || "HR user created successfully"
        })
        setInvitationSent(true)
        // Reset form
        setFormData({
          email: "",
          first_name: "",
          last_name: "",
          role: "admin",
          send_invitation: true
        })
        // Reload users list
        loadHRUsers()
      } else {
        // Check if it's a service role key error
        if (result.error === "MISSING_SERVICE_ROLE_KEY") {
          toast({
            title: "Service Role Key Required",
            description: "Please configure the service role key in .env.local and restart the server. See setup-service-key.md for instructions.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to create HR user",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error("Error creating HR user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#003300]">HR User Onboarding</h1>
            <p className="text-gray-600">Create new HR admin users for the system</p>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              HR users will have access to employee management, leave management, and other HR functions.
              They will receive an invitation email to set up their password.
            </AlertDescription>
          </Alert>

          {/* Service Key Warning */}
          {serviceKeyConfigured === false && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>⚠️ Service Role Key Required</strong>
                <p className="mt-2">
                  HR user creation requires the Supabase service role key to be configured in <code className="bg-red-100 px-2 py-1 rounded">.env.local</code>
                </p>
                <div className="mt-3">
                  <p className="font-semibold mb-2">Quick Setup (2 minutes):</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to: <a href="https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api" target="_blank" className="text-blue-600 hover:underline">Supabase API Settings</a></li>
                    <li>Copy the <strong>"service_role"</strong> key</li>
                    <li>Add it to <code className="bg-red-100 px-1 rounded">.env.local</code></li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open("https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api", "_blank")}
                    className="bg-white"
                  >
                    Open Supabase Settings
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {invitationSent && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                Invitation sent successfully! The user will receive an email with instructions to set up their account.
              </AlertDescription>
            </Alert>
          )}

          {/* Onboarding Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300] flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create HR User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.doe@company.com"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This will be used for login and receiving notifications
                    </p>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Access Level</h3>
                  
                  <div>
                    <Label>Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div>
                            <p className="font-medium">HR Admin</p>
                            <p className="text-xs text-gray-500">
                              Can manage employees, leaves, and HR operations
                            </p>
                          </div>
                        </SelectItem>
                        <SelectItem value="super_admin">
                          <div>
                            <p className="font-medium">Super Admin</p>
                            <p className="text-xs text-gray-500">
                              Full system access including settings and user management
                            </p>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Permissions Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {formData.role === "super_admin" ? "Super Admin" : "HR Admin"} Permissions:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ View and manage all employees</li>
                    <li>✓ Approve/reject leave requests</li>
                    <li>✓ Manage departments and positions</li>
                    <li>✓ View HR reports and analytics</li>
                    {formData.role === "super_admin" && (
                      <>
                        <li>✓ Manage system settings</li>
                        <li>✓ Create other admin users</li>
                        <li>✓ Access all admin features</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Invitation Option */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Send Invitation Email</p>
                      <p className="text-sm text-gray-500">
                        User will receive an email to set up their password
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.send_invitation}
                    onChange={(e) => setFormData({ ...formData, send_invitation: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({
                      email: "",
                      first_name: "",
                      last_name: "",
                      role: "admin",
                      send_invitation: true
                    })}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.email || !formData.first_name || !formData.last_name || serviceKeyConfigured === false}
                    className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                  >
                    {isSubmitting ? "Creating..." : "Create HR User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* HR Users List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-[#003300] flex items-center justify-between">
                <span>HR Users</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadHRUsers}
                  disabled={isLoadingUsers}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <p className="text-center py-8 text-gray-500">Loading HR users...</p>
              ) : hrUsers.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No HR users found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hrUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                            {user.role === 'super_admin' ? 'Super Admin' : 'HR Admin'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isLoadingUsers}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-[#003300]">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>After creating an HR user:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>The user will receive an invitation email at the provided address</li>
                <li>They should click the link in the email to set up their password</li>
                <li>Once password is set, they can login at <code className="bg-gray-100 px-2 py-1 rounded">/admin</code></li>
                <li>They will have access to HR features based on their assigned role</li>
              </ol>
              <p className="mt-4 text-amber-600">
                <strong>Note:</strong> Make sure the email address is correct as it will be used for login and password recovery.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
