"use client"

import { useState, useEffect } from "react"
import { HRSidebar } from "@/components/hr-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getLeaveRequests,
  getLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest,
  type LeaveRequest
} from "../actions"

export default function LeaveManagementPage() {
  const { toast } = useToast()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [comments, setComments] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    loadLeaveRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [leaveRequests, activeTab, searchTerm])

  async function loadLeaveRequests() {
    setIsLoading(true)
    try {
      const data = await getLeaveRequests({})
      setLeaveRequests(data)
    } catch (error) {
      console.error("Error loading leave requests:", error)
      toast({
        title: "Error",
        description: "Failed to load leave requests",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  function filterRequests() {
    let filtered = leaveRequests

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(req => req.status === activeTab)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(req => {
        const employee = req.employee as any
        const searchLower = searchTerm.toLowerCase()
        return (
          employee?.first_name?.toLowerCase().includes(searchLower) ||
          employee?.last_name?.toLowerCase().includes(searchLower) ||
          employee?.employee_id?.toLowerCase().includes(searchLower)
        )
      })
    }

    setFilteredRequests(filtered)
  }

  async function handleViewDetails(id: string) {
    try {
      const request = await getLeaveRequestById(id)
      if (request) {
        setSelectedRequest(request)
        setIsDetailDialogOpen(true)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load request details",
        variant: "destructive"
      })
    }
  }

  async function handleApprove() {
    if (!selectedRequest) return

    try {
      const result = await approveLeaveRequest(selectedRequest.id, comments)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        setIsApproveDialogOpen(false)
        setIsDetailDialogOpen(false)
        setComments("")
        loadLeaveRequests()
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
        description: "Failed to approve leave request",
        variant: "destructive"
      })
    }
  }

  async function handleReject() {
    if (!selectedRequest || !rejectionReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await rejectLeaveRequest(selectedRequest.id, rejectionReason)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        setIsRejectDialogOpen(false)
        setIsDetailDialogOpen(false)
        setRejectionReason("")
        loadLeaveRequests()
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
        description: "Failed to reject leave request",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; icon?: any }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      approved: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
      cancelled: { bg: "bg-gray-100", text: "text-gray-800" }
    }
    const variant = variants[status] || variants.pending
    const Icon = variant.icon

    return (
      <Badge className={`${variant.bg} ${variant.text} flex items-center gap-1`}>
        {Icon && <Icon className="w-3 h-3" />}
        {status.toUpperCase()}
      </Badge>
    )
  }

  const statusCounts = {
    all: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === "pending").length,
    approved: leaveRequests.filter(r => r.status === "approved").length,
    rejected: leaveRequests.filter(r => r.status === "rejected").length
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <HRSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003300]">Leave Management</h1>
          <p className="text-gray-600">Review and manage employee leave requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                  <p className="text-3xl font-bold text-[#003300]">{statusCounts.all}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{statusCounts.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{statusCounts.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{statusCounts.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by employee name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-gray-500">Loading leave requests...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No leave requests found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {request.employee?.first_name} {request.employee?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.employee?.employee_id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: request.leave_type?.color }}
                          />
                          <span>{request.leave_type?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.is_half_day ? (
                          <Badge variant="outline">Half Day</Badge>
                        ) : (
                          <Badge variant="outline">Full Day</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(request.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(request.end_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{request.total_days}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(request.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setIsApproveDialogOpen(true)
                                }}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setIsRejectDialogOpen(true)
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Employee</Label>
                    <p className="font-medium">
                      {(selectedRequest.employee as any)?.first_name} {(selectedRequest.employee as any)?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedRequest.employee as any)?.employee_id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="font-medium">{(selectedRequest.employee as any)?.email}</p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Leave Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: (selectedRequest.leave_type as any)?.color }}
                      />
                      <p className="font-medium">{(selectedRequest.leave_type as any)?.name}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Duration</Label>
                    <p className="font-medium">{selectedRequest.total_days} days</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Start Date</Label>
                    <p className="font-medium">
                      {new Date(selectedRequest.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">End Date</Label>
                    <p className="font-medium">
                      {new Date(selectedRequest.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <Label className="text-gray-600">Reason</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRequest.reason}</p>
                </div>

                {selectedRequest.notes && (
                  <div>
                    <Label className="text-gray-600">Additional Notes</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRequest.notes}</p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>

                {/* Actions */}
                {selectedRequest.status === "pending" && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => {
                        setIsDetailDialogOpen(false)
                        setIsRejectDialogOpen(true)
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        setIsDetailDialogOpen(false)
                        setIsApproveDialogOpen(true)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to approve this leave request?
              </p>
              <div>
                <Label>Comments (Optional)</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any comments..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                >
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please provide a reason for rejecting this leave request.
              </p>
              <div>
                <Label>Rejection Reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleReject}
                  disabled={!rejectionReason}
                >
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
