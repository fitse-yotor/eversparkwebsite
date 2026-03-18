"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FolderKanban, Newspaper, Mail } from "lucide-react"
import {
  getTotalProductsCount,
  getTotalProjectsCount,
  getTotalBlogsCount,
  getUnreadMessagesCount,
} from "@/app/admin/actions" // Import new actions

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)
  const [totalBlogs, setTotalBlogs] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setTotalProducts(await getTotalProductsCount())
      setTotalProjects(await getTotalProjectsCount())
      setTotalBlogs(await getTotalBlogsCount())
      setUnreadMessages(await getUnreadMessagesCount())
    }
    fetchData()
    // Optionally, set up an interval to refresh data periodically
    const interval = setInterval(fetchData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003300]">Dashboard</h1>
          <p className="text-gray-600">Overview of your website content and activity</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Products listed on your site</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">Case studies and completed projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBlogs}</div>
              <p className="text-xs text-muted-foreground">Published blog posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadMessages}</div>
              <p className="text-xs text-muted-foreground">New inquiries from visitors</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Placeholder for Recent Activity */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
                <div>
                  <p className="text-sm font-medium">New project "Solar Village Water Project" added.</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
                <div>
                  <p className="text-sm font-medium">Website settings updated by Admin.</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
                <div>
                  <p className="text-sm font-medium">New message received from John Doe.</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for Top Categories */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Project Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Municipal</p>
                <Badge variant="secondary">5 projects</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Humanitarian</p>
                <Badge variant="secondary">3 projects</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Commercial</p>
                <Badge variant="secondary">4 projects</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
