"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addDepartment, getDepartments, getEmployees, type Department, type Employee } from "../../actions"

export default function AddDepartmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    head_id: "",
    parent_department_id: "",
    budget: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [deptData, empData] = await Promise.all([
      getDepartments(),
      getEmployees()
    ])
    setDepartments(deptData)
    setEmployees(empData)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await addDepartment(formData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Department created successfully"
        })
        router.push("/hr/departments")
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
        description: "Failed to create department",
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
        <div className="max-w-3xl mx-auto">
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
            <h1 className="text-3xl font-bold text-[#003300]">Add New Department</h1>
            <p className="text-gray-600">Create a new department in your organization</p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300]">Department Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Engineering"
                      required
                    />
                  </div>
                  <div>
                    <Label>Department Code</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="ENG"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Department description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department Head</Label>
                    <Select
                      value={formData.head_id}
                      onValueChange={(value) => setFormData({ ...formData, head_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department head" />
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
                  <div>
                    <Label>Parent Department</Label>
                    <Select
                      value={formData.parent_department_id}
                      onValueChange={(value) => setFormData({ ...formData, parent_department_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    placeholder="100000"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.name}
                    className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                  >
                    {isSubmitting ? "Creating..." : "Create Department"}
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
