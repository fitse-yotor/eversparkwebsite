"use client"

import { useState, useEffect } from "react"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserPlus, Search, Edit, Trash2, Eye, Mail, RefreshCw, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  getDepartments,
  getPositions,
  deleteEmployee,
  type Employee,
  type Department,
  type Position
} from "../actions"

export default function EmployeesPage() {
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null)
  const [resendingCredentials, setResendingCredentials] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    
    // Reload data when page becomes visible (e.g., after navigating back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Empty dependency array - only run once on mount

  async function loadData() {
    setIsLoading(true)
    try {
      console.log("Loading employee data via API...")
      
      // Fetch employees from API
      const employeesResponse = await fetch("/api/employees")
      const employeesResult = await employeesResponse.json()
      
      if (!employeesResponse.ok) {
        console.error("API Error:", employeesResult)
        throw new Error(employeesResult.error || "Failed to fetch employees")
      }
      
      console.log("Employees API response:", employeesResult)
      
      // Fetch departments and positions using server actions
      const [departmentsData, positionsData] = await Promise.all([
        getDepartments(),
        getPositions()
      ])
      
      console.log("Employees loaded:", employeesResult.data?.length || 0, employeesResult.data)
      console.log("Departments loaded:", departmentsData.length)
      console.log("Positions loaded:", positionsData.length)
      
      setEmployees(employeesResult.data || [])
      setDepartments(departmentsData)
      setPositions(positionsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load employees",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteEmployee(id: string) {
    try {
      const result = await deleteEmployee(id)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        setDeleteDialogOpen(false)
        setEmployeeToDelete(null)
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
        description: "Failed to terminate employee",
        variant: "destructive"
      })
    }
  }

  function openDeleteDialog(employee: any) {
    setEmployeeToDelete({
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`
    })
    setDeleteDialogOpen(true)
  }

  async function handleResendCredentials(employee: any) {
    setResendingCredentials(employee.id)
    try {
      const response = await fetch("/api/employees/resend-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: result.message,
          duration: 5000
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to resend credentials",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error resending credentials:", error)
      toast({
        title: "Error",
        description: "Failed to resend credentials",
        variant: "destructive"
      })
    } finally {
      setResendingCredentials(null)
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = filterDepartment === "all" || emp.department_id === filterDepartment
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

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

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <HRSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003300]">Employee Management</h1>
            <p className="text-gray-600">Manage your organization's employees</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadData} 
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/hr/employees/add">
              <Button className="bg-[#003300] hover:bg-[#003300]/90 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="on_probation">On Probation</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#003300]">
              Employees ({filteredEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-gray-500">Loading employees...</p>
            ) : filteredEmployees.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No employees found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee: any) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#003300] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </div>
                          <span>{employee.first_name} {employee.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>{employee.department?.name || <span className="text-gray-400 italic">Not assigned</span>}</TableCell>
                      <TableCell>{employee.position?.title || <span className="text-gray-400 italic">Not assigned</span>}</TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>{new Date(employee.join_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/hr/employees/${employee.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View Details">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Link href={`/hr/employees/${employee.id}/edit`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit Employee">
                              <Edit className="w-4 h-4 text-green-600" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleResendCredentials(employee)}
                            disabled={resendingCredentials === employee.id}
                            title="Resend Login Credentials"
                          >
                            <Send className={`w-4 h-4 text-purple-600 ${resendingCredentials === employee.id ? 'animate-pulse' : ''}`} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => openDeleteDialog(employee)}
                            title="Terminate Employee"
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Terminate Employee</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to terminate <span className="font-semibold text-gray-900">{employeeToDelete?.name}</span>?
                <br /><br />
                This will change their status to "Terminated" and they will no longer have access to the system.
                This action can be reversed by editing the employee and changing their status back to "Active".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => employeeToDelete && handleDeleteEmployee(employeeToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Terminate Employee
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
