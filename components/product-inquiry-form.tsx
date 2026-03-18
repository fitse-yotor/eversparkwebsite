"use client"

import type React from "react"
import { ShoppingCart } from "lucide-react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface ProductInquiryFormProps {
  productSlug?: string
  productName: string
  triggerButton?: React.ReactNode
}

export function ProductInquiryForm({ productSlug, productName, triggerButton }: ProductInquiryFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    inquiryType: "quote",
    quantity: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          subject: `${formData.inquiryType === "quote" ? "Quote Request" : "Product Inquiry"} - ${productName}`,
          message: `Product: ${productName}\nInquiry Type: ${formData.inquiryType}\n${formData.quantity ? `Quantity: ${formData.quantity}\n` : ""}Message: ${formData.message}`,
          ...(productSlug ? { product_slug: productSlug } : {}),
          inquiry_type: formData.inquiryType,
        }),
      })

      if (response.ok) {
        alert("Your inquiry has been sent successfully! We'll get back to you soon.")
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          inquiryType: "quote",
          quantity: "",
          message: "",
        })
        setOpen(false)
      } else {
        throw new Error("Failed to send inquiry")
      }
    } catch (error) {
      console.error("Error sending inquiry:", error)
      alert("Failed to send inquiry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="flex-1 bg-[#663300] hover:bg-[#663300]/90 text-white">
      <ShoppingCart className="w-4 h-4 mr-2" /> Request Quote
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#003300]">Product Inquiry - {productName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inquiryType">Inquiry Type</Label>
              <Select
                value={formData.inquiryType}
                onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote">Request Quote</SelectItem>
                  <SelectItem value="info">Product Information</SelectItem>
                  <SelectItem value="demo">Request Demo</SelectItem>
                  <SelectItem value="order">Place Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity (if applicable)</Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 5 units"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Please provide details about your requirements..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#003300] hover:bg-[#003300]/90 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Inquiry"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Also export as default so existing default-import code keeps working.
export default ProductInquiryForm
