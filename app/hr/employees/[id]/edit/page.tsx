"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  updateEmployee,
  getDepartments,
  getPositions,
  type Department,
  type Position
} from "../../../actions"

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  
  const [formData, setFormData] = useState<any>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employment_type: "full_time",
    join_date: "",
    department_id: "",
    position_id: "",
    manager_id: "",
    basic_salary: 0,
    currency: "USD",
    status: "active"
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
      setIsLoading(true)
      try {
        const employeeId = Array.isArray(params.id) ? params.id[0] : params.id
        console.log("Loading employee for edit, ID:", employeeId)

        const [employeesResponse, deptData, posData] = await Promise.all([
          fetch("/api/employees"),
          getDepartments(),
          getPositions()
        ])

        const employeesResult = await employeesResponse.json()

        if (employeesResult.success) {
          const emp = employeesResult.data.find((e: any) => e.id === employeeId)
          console.log("Found employee for edit:", emp)

          if (emp) {
            setFormData({
              first_name: emp.first_name,
              last_name: emp.last_name,
              email: emp.email,
              phone: emp.phone || "",
              employment_type: emp.employment_type,
              join_date: emp.join_date,
              department_id: emp.department_id || "",
              position_id: emp.position_id || "",
              manager_id: emp.manager_id || "",
              basic_salary: emp.basic_salary || 0,
              currency: emp.currency,
              status: emp.status
            })
          }
          setEmployees(employeesResult.data.filter((e: any) => e.id !== employeeId))
        }

        setDepartments(deptData)
        setPositions(posData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateEmployee(params.id as string, formData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        router.push(`/hr/employees/${params.id}`)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#f6f4f3]">
        <HRSidebar />
        <main className="flex-1 p-8">
          <p className="text-center py-8 text-gray-500">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-[#003300]">Edit Employee</h1>
            <p className="text-gray-600">Update employee information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300]">Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Employment Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employment Type</Label>
                      <Select
                        value={formData.employment_type}
                        onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="on_probation">On Probation</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Department</Label>
                      <Select
                        value={formData.department_id}
                        onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Select
                        value={formData.position_id}
                        onValueChange={(value) => setFormData({ ...formData, position_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map(pos => (
                            <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Join Date *</Label>
                      <Input
                        type="date"
                        value={formData.join_date}
                        onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Reporting Manager</Label>
                      <Select
                        value={formData.manager_id}
                        onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name} ({emp.employee_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Compensation</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Basic Salary</Label>
                      <Input
                        type="number"
                        value={formData.basic_salary}
                        onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="ETB">ETB (Ethiopian Birr)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
