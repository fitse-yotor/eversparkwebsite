"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, DollarSign, User, Building, Edit } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ViewEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [employee, setEmployee] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEmployee()
  }, [params.id])

  async function loadEmployee() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/employees")
      const result = await response.json()
      
      if (result.success) {
        const emp = result.data.find((e: any) => e.id === params.id)
        if (emp) {
          setEmployee(emp)
        } else {
          toast({
            title: "Error",
            description: "Employee not found",
            variant: "destructive"
          })
          router.push("/hr/employees")
        }
      }
    } catch (error) {
      console.error("Error loading employee:", error)
      toast({
        title: "Error",
        description: "Failed to load employee details",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      on_leave: "bg-yellow-100 text-yellow-800",
      on_probation: "bg-blue-100 text-blue-800",
      suspended: "bg-red-100 text-red-800",
      terminated: "bg-gray-100 text-gray-800"
    }
    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#f6f4f3]">
        <HRSidebar />
        <main className="flex-1 p-8">
          <p className="text-center py-8 text-gray-500">Loading employee details...</p>
        </main>
      </div>
    )
  }

  if (!employee) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#003300] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {employee.first_name[0]}{employee.last_name[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#003300]">
                    {employee.first_name} {employee.last_name}
                  </h1>
                  <p className="text-gray-600">{employee.employee_id}</p>
                  <div className="mt-2">{getStatusBadge(employee.status)}</div>
                </div>
              </div>
              <Link href={`/hr/employees/${employee.id}/edit`}>
                <Button className="bg-[#003300] hover:bg-[#003300]/90 text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Employee
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{employee.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">{employee.country || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{employee.department?.name || <span className="text-gray-400 italic">Not assigned</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium">{employee.position?.title || <span className="text-gray-400 italic">Not assigned</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="font-medium capitalize">{employee.employment_type.replace("_", " ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-medium">{new Date(employee.join_date).toLocaleDateString()}</p>
                </div>
                {employee.probation_end_date && (
                  <div>
                    <p className="text-sm text-gray-500">Probation End Date</p>
                    <p className="font-medium">{new Date(employee.probation_end_date).toLocaleDateString()}</p>
                  </div>
                )}
                {employee.confirmation_date && (
                  <div>
                    <p className="text-sm text-gray-500">Confirmation Date</p>
                    <p className="font-medium">{new Date(employee.confirmation_date).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Basic Salary</p>
                  <p className="font-medium text-xl">
                    {employee.basic_salary 
                      ? `${employee.currency} ${employee.basic_salary.toLocaleString()}`
                      : <span className="text-gray-400 italic text-base">Not set</span>
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p className="font-medium">{employee.currency}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          {employee.bio && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-[#003300]">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{employee.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
