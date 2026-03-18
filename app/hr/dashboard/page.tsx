"use client"

import { useState, useEffect } from "react"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Clock, UserPlus, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getHRDashboardStats, getLeaveRequests, getEmployees } from "../actions"

interface DashboardStats {
  totalEmployees: number
  pendingLeaves: number
  onLeaveToday: number
  newEmployees: number
}

export default function HRDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    onLeaveToday: 0,
    newEmployees: 0
  })
  const [recentLeaveRequests, setRecentLeaveRequests] = useState<any[]>([])
  const [recentEmployees, setRecentEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true)
      try {
        const [statsData, leaveRequests, employees] = await Promise.all([
          getHRDashboardStats(),
          getLeaveRequests({ status: "pending" }),
          getEmployees()
        ])

        setStats(statsData)
        setRecentLeaveRequests(leaveRequests.slice(0, 5))
        setRecentEmployees(employees.slice(0, 5))
      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/hr/employees"
    },
    {
      title: "Pending Leave Requests",
      value: stats.pendingLeaves,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      link: "/hr/leaves"
    },
    {
      title: "On Leave Today",
      value: stats.onLeaveToday,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/hr/leaves/calendar"
    },
    {
      title: "New This Month",
      value: stats.newEmployees,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/hr/employees"
    }
  ]

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <HRSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003300]">HR Dashboard</h1>
          <p className="text-gray-600">Welcome to the HR Management System</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Link href="/hr/employees/add">
            <Button className="bg-[#003300] hover:bg-[#003300]/90 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </Link>
          <Link href="/hr/leaves">
            <Button variant="outline" className="border-[#003300] text-[#003300]">
              <FileText className="w-4 h-4 mr-2" />
              View Leave Requests
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link key={index} href={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#003300]">
                        {isLoading ? "..." : stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Leave Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300] flex items-center justify-between">
                <span>Pending Leave Requests</span>
                <Link href="/hr/leaves">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-gray-500">Loading...</p>
              ) : recentLeaveRequests.length === 0 ? (
                <p className="text-gray-500">No pending leave requests</p>
              ) : (
                <div className="space-y-4">
                  {recentLeaveRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-[#003300]">
                          {request.employee?.first_name} {request.employee?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.leave_type?.name} - {request.total_days} day(s)
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/hr/leaves/${request.id}`}>
                        <Button size="sm" variant="outline">Review</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Employees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300] flex items-center justify-between">
                <span>Recent Employees</span>
                <Link href="/hr/employees">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-gray-500">Loading...</p>
              ) : recentEmployees.length === 0 ? (
                <p className="text-gray-500">No employees yet</p>
              ) : (
                <div className="space-y-4">
                  {recentEmployees.map((employee: any) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#003300] text-white rounded-full flex items-center justify-center font-semibold">
                          {employee.first_name[0]}{employee.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-[#003300]">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {employee.position?.title || "No position"} • {employee.employee_id}
                          </p>
                        </div>
                      </div>
                      <Link href={`/hr/employees/${employee.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#003300] mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/hr/employees">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-[#003300]" />
                  <p className="text-sm font-medium">Employees</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/hr/leaves">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-[#003300]" />
                  <p className="text-sm font-medium">Leave Management</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/hr/departments">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-[#003300]" />
                  <p className="text-sm font-medium">Departments</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/hr/reports">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#003300]" />
                  <p className="text-sm font-medium">Reports</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
