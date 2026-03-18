"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  getDepartments,
  getPositions,
  generateEmployeeId,
  type EmployeeInput,
  type Department,
  type Position,
  type Employee
} from "../../actions"

export default function AddEmployeePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [formData, setFormData] = useState<EmployeeInput>({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employment_type: "full_time",
    join_date: new Date().toISOString().split("T")[0],
    department_id: "",
    position_id: "",
    basic_salary: 0,
    currency: "USD"
  })

  useEffect(() => {
    loadData()
    
    // Reload data when page becomes visible (e.g., after navigating back from department creation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function loadData() {
    try {
      console.log("Loading data for add employee page...")
      
      // Fetch employees from API
      const employeesResponse = await fetch("/api/employees")
      const employeesResult = await employeesResponse.json()
      
      // Fetch departments, positions, and generate next ID
      const [deptData, posData, nextId] = await Promise.all([
        getDepartments(),
        getPositions(),
        generateEmployeeId()
      ])
      
      console.log("Employees for manager dropdown:", employeesResult.data?.length || 0)
      console.log("Departments:", deptData.length)
      console.log("Positions:", posData.length)
      console.log("Next Employee ID:", nextId)
      
      setDepartments(deptData)
      setPositions(posData)
      setEmployees(employeesResult.data || [])
      setFormData(prev => ({ ...prev, employee_id: nextId }))
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Call the employee onboarding API which creates auth user and sends email
      const response = await fetch("/api/employees/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeData: formData,
          sendEmail: true
        })
      })

      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError)
        throw new Error("Invalid response from server")
      }

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        router.push("/hr/employees")
      } else {
        // Show specific error message from API
        let errorMessage = result?.message || "Failed to add employee"
        let errorTitle = "Registration Failed"
        
        // Check for duplicate email error - check the actual message from API
        if (errorMessage.includes("already exists") || 
            errorMessage.includes("User with email") ||
            response.status === 400) {
          errorTitle = "Email Already Registered"
          errorMessage = "This email address is already registered in the system. Please use a different email address."
        }
        
        console.error("API Error:", result)
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
          duration: 6000  // 6 seconds for important errors
        })
      }
    } catch (error) {
      console.error("Request Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add employee. Please try again.",
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-[#003300]">Add New Employee</h1>
            <p className="text-gray-600">Add a new employee to your organization</p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300]">Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employee ID</Label>
                      <Input
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        placeholder="EMP001"
                      />
                    </div>
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
                  </div>

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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john.doe@company.com"
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>

                {/* Department & Position */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Department & Position</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Department</Label>
                        <Link href="/hr/departments/add">
                          <Button type="button" size="sm" variant="outline">
                            <Plus className="w-3 h-3 mr-1" />
                            Add New
                          </Button>
                        </Link>
                      </div>
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

                {/* Compensation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Compensation</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Basic Salary</Label>
                      <Input
                        type="number"
                        value={formData.basic_salary}
                        onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) })}
                        placeholder="50000"
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
                    disabled={isSubmitting || !formData.first_name || !formData.last_name || !formData.email}
                    className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                  >
                    {isSubmitting ? "Adding..." : "Add Employee"}
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
