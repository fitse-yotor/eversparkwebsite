"use client"

import { useState, useEffect } from "react"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Plus, Edit, Trash2, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getEmployees,
  type Department,
  type Employee
} from "../actions"

export default function DepartmentsPage() {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

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
    setIsLoading(true)
    try {
      const [deptData, empData] = await Promise.all([
        getDepartments(),
        getEmployees()
      ])
      setDepartments(deptData)
      setEmployees(empData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdd() {
    try {
      const result = await addDepartment(formData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Department added successfully"
        })
        setIsAddDialogOpen(false)
        resetForm()
        loadData()
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
        description: "Failed to add department",
        variant: "destructive"
      })
    }
  }

  async function handleUpdate() {
    if (!selectedDepartment) return

    try {
      const result = await updateDepartment(selectedDepartment.id, formData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Department updated successfully"
        })
        setIsEditDialogOpen(false)
        resetForm()
        loadData()
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
        description: "Failed to update department",
        variant: "destructive"
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      const result = await deleteDepartment(id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Department deleted successfully"
        })
        loadData()
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
        description: "Failed to delete department",
        variant: "destructive"
      })
    }
  }

  function openEditDialog(dept: Department) {
    setSelectedDepartment(dept)
    setFormData({
      name: dept.name,
      code: dept.code || "",
      description: dept.description || "",
      head_id: dept.head_id || "",
      parent_department_id: dept.parent_department_id || "",
      budget: dept.budget || 0
    })
    setIsEditDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      name: "",
      code: "",
      description: "",
      head_id: "",
      parent_department_id: "",
      budget: 0
    })
    setSelectedDepartment(null)
  }

  const getDepartmentEmployeeCount = (deptId: string) => {
    return employees.filter(emp => emp.department_id === deptId).length
  }

  const getDepartmentHead = (headId: string | null) => {
    if (!headId) return "-"
    const head = employees.find(emp => emp.id === headId)
    return head ? `${head.first_name} ${head.last_name}` : "-"
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <HRSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003300]">Department Management</h1>
            <p className="text-gray-600">Manage organizational departments</p>
          </div>
          <Link href="/hr/departments/add">
            <Button className="bg-[#003300] hover:bg-[#003300]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </Link>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {departments.map(dept => (
            <Card key={dept.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#003300] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    <span>{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => openEditDialog(dept)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(dept.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dept.code && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">{dept.code}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Head:</span>
                    <span className="font-medium">{getDepartmentHead(dept.head_id)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {getDepartmentEmployeeCount(dept.id)}
                    </span>
                  </div>
                  {dept.budget && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">${dept.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {dept.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {dept.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#003300]">All Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-gray-500">Loading departments...</p>
            ) : departments.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No departments found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department Head</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map(dept => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.code || "-"}</TableCell>
                      <TableCell>{getDepartmentHead(dept.head_id)}</TableCell>
                      <TableCell>{getDepartmentEmployeeCount(dept.id)}</TableCell>
                      <TableCell>
                        {dept.budget ? `$${dept.budget.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openEditDialog(dept)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(dept.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Department Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                      <SelectItem value="">None</SelectItem>
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
                      <SelectItem value="">None</SelectItem>
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

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAdd}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                  disabled={!formData.name}
                >
                  Add Department
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Department Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                      <SelectItem value="">None</SelectItem>
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
                      <SelectItem value="">None</SelectItem>
                      {departments.filter(d => d.id !== selectedDepartment?.id).map(dept => (
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

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdate}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                  disabled={!formData.name}
                >
                  Update Department
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
