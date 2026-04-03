"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  UserPlus,
  LogOut,
  Menu,
  X,
  Briefcase,
  ShieldCheck,
  ExternalLink,
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const hrMenuItems = [
  { href: "/hr/dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { href: "/hr/employees",   label: "Employees",         icon: Users },
  { href: "/hr/departments", label: "Departments",       icon: Building2 },
  { href: "/hr/leaves",      label: "Leave Management",  icon: Calendar },
  { href: "/hr/onboarding",  label: "Onboard HR User",   icon: UserPlus },
]

export function HRSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      if (profile?.role === "admin" || profile?.role === "super_admin") {
        setIsAdmin(true)
      }
    }
    checkRole()
  }, [])

  async function handleLogout() {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
      }
      window.location.href = "/login"
    } catch {
      window.location.href = "/login"
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#003300] rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-[#003300]">HR Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div>
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                HR Management
              </h3>
              <ul className="space-y-2">
                {hrMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                          ${isActive ? "bg-[#003300] text-white" : "text-gray-700 hover:bg-gray-100"}
                        `}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Admin Panel shortcut — only for admin / super_admin */}
            {isAdmin && (
              <div className="mt-6">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Admin Access
                </h3>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-[#003300] hover:bg-[#003300]/10 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span>Go to Admin Panel</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Link>
              </div>
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
