"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  getLeaveTypes,
  getEmployeeLeaveBalances,
  createLeaveRequest,
  getEmployeeByUserId,
  type LeaveType,
  type LeaveBalance
} from "@/app/hr/actions"

export default function LeaveRequestPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [employeeId, setEmployeeId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    is_half_day: false,
    half_day_period: "",
    reason: "",
    notes: "",
    contact_number: "",
    emergency_contact: "",
    attachment_url: ""
  })

  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null)
  const [availableBalance, setAvailableBalance] = useState<number>(0)
  const [calculatedDays, setCalculatedDays] = useState<number>(0)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.leave_type_id) {
      const leaveType = leaveTypes.find(lt => lt.id === formData.leave_type_id)
      setSelectedLeaveType(leaveType || null)

      const balance = leaveBalances.find(lb => lb.leave_type_id === formData.leave_type_id)
      setAvailableBalance(balance?.available || 0)
    }
  }, [formData.leave_type_id, leaveTypes, leaveBalances])

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      calculateDays()
    }
  }, [formData.start_date, formData.end_date, formData.is_half_day])

  async function loadData() {
    setIsLoading(true)
    try {
      // Get current user's employee record
      // In production, get this from auth context
      const leaveTypesData = await getLeaveTypes()
      setLeaveTypes(leaveTypesData)

      // TODO: Get employee ID from authenticated user
      // For now, you'll need to pass the employee ID
      // const employee = await getEmployeeByUserId(userId)
      // setEmployeeId(employee.id)
      // const balances = await getEmployeeLeaveBalances(employee.id)
      // setLeaveBalances(balances)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load leave types",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  function calculateDays() {
    if (formData.is_half_day) {
      setCalculatedDays(0.5)
      return
    }

    const start = new Date(formData.start_date)
    const end = new Date(formData.end_date)
    
    if (start > end) {
      setCalculatedDays(0)
      return
    }

    // Simple calculation (in production, this should call the backend function)
    let days = 0
    const current = new Date(start)
    
    while (current <= end) {
      const dayOfWeek = current.getDay()
      // Exclude weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++
      }
      current.setDate(current.getDate() + 1)
    }
    
    setCalculatedDays(days)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Employee ID not found. Please login again.",
        variant: "destructive"
      })
      return
    }

    if (calculatedDays > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${availableBalance} days available for this leave type.`,
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createLeaveRequest(employeeId, formData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        router.push("/employee/leave/history")
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
        description: "Failed to submit leave request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = 
    formData.leave_type_id &&
    formData.start_date &&
    formData.end_date &&
    formData.reason &&
    calculatedDays > 0 &&
    calculatedDays <= availableBalance

  return (
    <div className="min-h-screen bg-[#f6f4f3] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003300]">Request Leave</h1>
          <p className="text-gray-600">Submit a new leave request</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">Leave Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Leave Type */}
                  <div>
                    <Label>Leave Type *</Label>
                    <Select
                      value={formData.leave_type_id}
                      onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: type.color }}
                              />
                              {type.name} ({type.code})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLeaveType && (
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedLeaveType.description}
                      </p>
                    )}
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label>End Date *</Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        min={formData.start_date || new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>

                  {/* Half Day Option */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Half Day Leave</Label>
                      <p className="text-sm text-gray-500">Request only half day leave</p>
                    </div>
                    <Switch
                      checked={formData.is_half_day}
                      onCheckedChange={(checked) => {
                        setFormData({ 
                          ...formData, 
                          is_half_day: checked,
                          end_date: checked ? formData.start_date : formData.end_date
                        })
                      }}
                    />
                  </div>

                  {formData.is_half_day && (
                    <div>
                      <Label>Half Day Period *</Label>
                      <Select
                        value={formData.half_day_period}
                        onValueChange={(value) => setFormData({ ...formData, half_day_period: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first_half">First Half (Morning)</SelectItem>
                          <SelectItem value="second_half">Second Half (Afternoon)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <Label>Reason *</Label>
                    <Textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Please provide a reason for your leave request..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Number</Label>
                      <Input
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <Label>Emergency Contact</Label>
                      <Input
                        value={formData.emergency_contact}
                        onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  {/* Attachment */}
                  {selectedLeaveType?.requires_document && (
                    <div>
                      <Label>Attachment {selectedLeaveType.requires_document && "*"}</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          Upload medical certificate or supporting document
                        </p>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
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
                      disabled={!canSubmit || isSubmitting}
                      className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Leave Balance & Summary */}
          <div className="space-y-6">
            {/* Leave Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] text-lg">Leave Balance</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLeaveType ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Available</p>
                      <p className="text-3xl font-bold text-[#003300]">
                        {availableBalance}
                      </p>
                      <p className="text-sm text-gray-500">days</p>
                    </div>
                    
                    {leaveBalances.find(lb => lb.leave_type_id === formData.leave_type_id) && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Earned:</span>
                          <span className="font-medium">
                            {leaveBalances.find(lb => lb.leave_type_id === formData.leave_type_id)?.earned || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taken:</span>
                          <span className="font-medium">
                            {leaveBalances.find(lb => lb.leave_type_id === formData.leave_type_id)?.taken || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pending:</span>
                          <span className="font-medium">
                            {leaveBalances.find(lb => lb.leave_type_id === formData.leave_type_id)?.pending || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Select a leave type to view balance
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Request Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300] text-lg">Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Leave Type:</span>
                  <span className="font-medium">
                    {selectedLeaveType?.name || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {calculatedDays} {calculatedDays === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">
                    {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">
                    {formData.end_date ? new Date(formData.end_date).toLocaleDateString() : "-"}
                  </span>
                </div>

                {calculatedDays > 0 && (
                  <div className="pt-3 border-t">
                    {calculatedDays <= availableBalance ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Sufficient balance available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Insufficient balance</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notice Period Warning */}
            {selectedLeaveType && selectedLeaveType.min_notice_days > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-900">Notice Period</p>
                      <p className="text-orange-700">
                        This leave type requires {selectedLeaveType.min_notice_days} days advance notice.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
