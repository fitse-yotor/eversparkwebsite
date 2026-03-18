"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, Reply, Archive, Star, Calendar, User, Mail, Phone, RefreshCw } from "lucide-react"

interface Message {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  subject: string
  message: string
  status: "unread" | "read" | "replied" | "archived"
  priority: "low" | "medium" | "high"
  category: "sales" | "support" | "general" | "partnership"
  starred: boolean
  created_at: string
  updated_at: string
}

export default function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  const statuses = [
    { id: "all", name: "All Messages" },
    { id: "unread", name: "Unread" },
    { id: "read", name: "Read" },
    { id: "replied", name: "Replied" },
    { id: "archived", name: "Archived" },
  ]

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "sales", name: "Sales Inquiry" },
    { id: "support", name: "Technical Support" },
    { id: "general", name: "General Inquiry" },
    { id: "partnership", name: "Partnership" },
  ]

  const priorities = [
    { id: "low", name: "Low", color: "bg-gray-500" },
    { id: "medium", name: "Medium", color: "bg-yellow-500" },
    { id: "high", name: "High", color: "bg-red-500" },
  ]

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        console.error("Failed to fetch messages")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const filteredMessages = messages.filter((message) => {
    const statusMatch = filterStatus === "all" || message.status === filterStatus
    const categoryMatch = filterCategory === "all" || message.category === filterCategory
    return statusMatch && categoryMatch
  })

  const updateMessage = async (id: string, updates: Partial<Message>) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, ...updates } : m)))
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, ...updates })
        }
      }
    } catch (error) {
      console.error("Error updating message:", error)
    }
  }

  const handleMarkAsRead = (id: string) => {
    const message = messages.find((m) => m.id === id)
    if (message) {
      updateMessage(id, { status: message.status === "unread" ? "read" : "unread" })
    }
  }

  const handleStarMessage = (id: string) => {
    const message = messages.find((m) => m.id === id)
    if (message) {
      updateMessage(id, { starred: !message.starred })
    }
  }

  const handleArchiveMessage = (id: string) => {
    updateMessage(id, { status: "archived" })
  }

  const handleDeleteMessage = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await fetch(`/api/messages/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setMessages(messages.filter((m) => m.id !== id))
          setSelectedMessage(null)
        }
      } catch (error) {
        console.error("Error deleting message:", error)
      }
    }
  }

  const handleReply = (messageId: string) => {
    if (replyText.trim()) {
      updateMessage(messageId, { status: "replied" })
      setReplyText("")
      alert("Reply sent successfully!")
    }
  }

  const getUnreadCount = () => {
    return messages.filter((m) => m.status === "unread").length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f6f4f3]">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border-b">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-8 text-center">
                  <Skeleton className="h-12 w-12 mx-auto mb-4" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#003300]">Messages Management</h1>
              <p className="text-gray-600">
                Manage customer inquiries and support requests ({getUnreadCount()} unread)
              </p>
            </div>
            <Button onClick={fetchMessages} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#003300]">Messages</CardTitle>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredMessages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No messages found for the selected filters.</div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedMessage?.id === message.id ? "bg-blue-50" : ""
                        } ${message.status === "unread" ? "bg-blue-25" : ""}`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`font-semibold ${message.status === "unread" ? "text-[#003300]" : "text-gray-700"}`}
                              >
                                {message.name}
                              </h4>
                              {message.starred && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                              <Badge
                                className={`text-xs ${
                                  priorities.find((p) => p.id === message.priority)?.color
                                } text-white`}
                              >
                                {message.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {categories.find((c) => c.id === message.category)?.name}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{message.company || "No company"}</p>
                            <p
                              className={`text-sm mb-2 ${message.status === "unread" ? "font-medium text-gray-900" : "text-gray-700"}`}
                            >
                              {message.subject}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2">{message.message}</p>
                          </div>
                          <div className="text-xs text-gray-500 ml-4">{formatDate(message.created_at)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#003300]">Message Details</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStarMessage(selectedMessage.id)}
                        className={selectedMessage.starred ? "text-yellow-500" : ""}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(selectedMessage.id)}>
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleArchiveMessage(selectedMessage.id)}>
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#003300] mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{selectedMessage.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedMessage.email}</span>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{selectedMessage.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDate(selectedMessage.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#003300] mb-2">Subject</h4>
                    <p className="text-sm text-gray-700">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#003300] mb-2">Message</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#003300] mb-2">Reply</h4>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={4}
                    />
                    <Button
                      onClick={() => handleReply(selectedMessage.id)}
                      className="mt-2 bg-[#003300] hover:bg-[#003300]/90 text-white"
                      disabled={!replyText.trim()}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a message to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
