"use server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export interface Department {
  id: string
  name: string
  code: string | null
  description: string | null
  head_id: string | null
  parent_department_id: string | null
  budget: number | null
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  title: string
}

export interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  department_id: string | null
  position_id: string | null
  status: string
  join_date: string
  employment_type: string
  basic_salary: number | null
  currency: string
  department?: Department
  position?: Position
}

export interface EmployeeInput {
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  department_id?: string
  position_id?: string
  manager_id?: string
  employment_type: string
  join_date: string
  basic_salary?: number
  currency?: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  total_days: number
  status: string
  reason: string
  is_half_day: boolean
  notes: string | null
  requested_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  reviewer_comments: string | null
  employee?: Employee
  leave_type?: any
}

export async function getDepartments() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("departments").select("*").order("name")
  if (error) return []
  return data as Department[]
}

export async function addDepartment(department: any) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("departments").insert([department])
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Department added" }
}

export async function updateDepartment(id: string, department: any) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("departments").update(department).eq("id", id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Department updated" }
}

export async function deleteDepartment(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("departments").delete().eq("id", id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Department deleted" }
}

export async function getPositions() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("positions").select("*").order("title")
  if (error) return []
  return data as Position[]
}

export async function getEmployees() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("employees").select("*, department:departments!employees_department_id_fkey(*), position:positions(*)").order("created_at", { ascending: false })
  if (error) {
    console.error("getEmployees error:", error)
    return []
  }
  console.log("getEmployees success:", data?.length || 0, "employees")
  return data as Employee[]
}

export async function addEmployee(employee: EmployeeInput) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("employees").insert([employee])
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Employee added" }
}

export async function updateEmployee(id: string, employee: Partial<EmployeeInput>) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("employees").update(employee).eq("id", id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Employee updated" }
}

export async function deleteEmployee(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("employees").update({ status: "terminated" }).eq("id", id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Employee terminated" }
}

export async function generateEmployeeId() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("employees").select("employee_id").order("employee_id", { ascending: false }).limit(1)
  if (error || !data || data.length === 0) return "EMP001"
  const lastId = data[0].employee_id
  const match = lastId.match(/EMP(\d+)/)
  if (match) {
    const nextNum = parseInt(match[1]) + 1
    return `EMP${nextNum.toString().padStart(3, "0")}`
  }
  return "EMP001"
}

export async function getLeaveRequests(filters: { status?: string }) {
  const supabase = getSupabaseAdmin()
  let query = supabase.from("leave_requests").select("*, employee:employees(*), leave_type:leave_types(*)").order("requested_at", { ascending: false })
  if (filters.status) query = query.eq("status", filters.status)
  const { data, error } = await query
  if (error) return []
  return data as LeaveRequest[]
}

export async function getLeaveRequestById(id: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("leave_requests").select("*, employee:employees(*), leave_type:leave_types(*)").eq("id", id).single()
  if (error) return null
  return data as LeaveRequest
}

export async function approveLeaveRequest(id: string, comments?: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("leave_requests").update({ status: "approved", reviewed_at: new Date().toISOString(), reviewer_comments: comments }).eq("id", id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Leave approved" }
}

export async function rejectLeaveRequest(id: string, reason: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("leave_requests").update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewer_comments: reason }).eq("id", id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Leave rejected" }
}

export async function getHRDashboardStats() {
  const supabase = getSupabaseAdmin()
  const { count: totalEmployees } = await supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active")
  const { count: pendingLeaves } = await supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending")
  const today = new Date().toISOString().split("T")[0]
  const { count: onLeaveToday } = await supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "approved").lte("start_date", today).gte("end_date", today)
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  const { count: newEmployees } = await supabase.from("employees").select("*", { count: "exact", head: true }).gte("join_date", firstDayOfMonth.toISOString().split("T")[0])
  return { totalEmployees: totalEmployees || 0, pendingLeaves: pendingLeaves || 0, onLeaveToday: onLeaveToday || 0, newEmployees: newEmployees || 0 }
}

// ============================================
// LEAVE TYPES MANAGEMENT
// ============================================

export interface LeaveType {
  id: string
  name: string
  code: string
  description: string | null
  is_paid: boolean
  requires_approval: boolean
  requires_document: boolean
  max_days_per_request: number | null
  min_notice_days: number
  color: string
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  year: number
  opening_balance: number
  earned: number
  taken: number
  pending: number
  adjusted: number
  encashed: number
  available: number
  last_updated: string
}

export async function getLeaveTypes() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("leave_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  if (error) return []
  return data as LeaveType[]
}

export async function getAllLeaveTypes() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("leave_types")
    .select("*")
    .order("sort_order")
  if (error) return []
  return data as LeaveType[]
}

export async function addLeaveType(leaveType: Partial<LeaveType>) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("leave_types").insert([leaveType])
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Leave type added successfully" }
}

export async function updateLeaveType(id: string, leaveType: Partial<LeaveType>) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("leave_types")
    .update(leaveType)
    .eq("id", id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Leave type updated successfully" }
}

export async function deleteLeaveType(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("leave_types")
    .update({ is_active: false })
    .eq("id", id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Leave type deactivated successfully" }
}

export async function getEmployeeLeaveBalances(employeeId: string) {
  const supabase = getSupabaseAdmin()
  const currentYear = new Date().getFullYear()
  const { data, error } = await supabase
    .from("employee_leave_balances")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("year", currentYear)
  if (error) return []
  return data as LeaveBalance[]
}

export async function getEmployeeByUserId(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", userId)
    .single()
  if (error) return null
  return data as Employee
}

export async function createLeaveRequest(employeeId: string, requestData: any) {
  const supabase = getSupabaseAdmin()
  
  // Calculate total days
  const startDate = new Date(requestData.start_date)
  const endDate = new Date(requestData.end_date)
  let totalDays = requestData.is_half_day ? 0.5 : 0
  
  if (!requestData.is_half_day) {
    let current = new Date(startDate)
    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++
      }
      current.setDate(current.getDate() + 1)
    }
  }
  
  const { error } = await supabase.from("leave_requests").insert([{
    employee_id: employeeId,
    leave_type_id: requestData.leave_type_id,
    start_date: requestData.start_date,
    end_date: requestData.end_date,
    is_half_day: requestData.is_half_day,
    half_day_period: requestData.half_day_period || null,
    total_days: totalDays,
    reason: requestData.reason,
    notes: requestData.notes || null,
    contact_number: requestData.contact_number || null,
    emergency_contact: requestData.emergency_contact || null,
    attachment_url: requestData.attachment_url || null,
    status: "pending"
  }])
  
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Leave request submitted successfully" }
}
