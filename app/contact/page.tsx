"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getContactInfoData, type ContactInfoData } from "@/app/admin/content/actions"
import { Facebook, Linkedin, Twitter, MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getContactInfoData()
      setContactInfo(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        alert("Thank you for your message! We will get back to you soon.")
        setFormData({ name: "", email: "", company: "", phone: "", subject: "", message: "" })
      } else {
        alert(`Error: ${result.error || "Failed to send message"}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("An error occurred while sending your message. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const renderSocialLinks = () => {
    if (!contactInfo?.socialMedia) return null
    const { facebook, twitter, linkedin } = contactInfo.socialMedia
    return (
      <div className="flex space-x-4 mt-4">
        {facebook && (
          <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-[#003300] hover:text-[#663300]">
            <Facebook size={24} /> <span className="sr-only">Facebook</span>
          </a>
        )}
        {twitter && (
          <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-[#003300] hover:text-[#663300]">
            <Twitter size={24} /> <span className="sr-only">Twitter</span>
          </a>
        )}
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-[#003300] hover:text-[#663300]">
            <Linkedin size={24} /> <span className="sr-only">LinkedIn</span>
          </a>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Skeleton className="h-48 w-full bg-[#003300]" />
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="aspect-video w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-[#003300] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-gray-200">Get in touch with our team to discuss your water treatment needs</p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company/Organization
                      </label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please describe your requirements or questions..."
                      disabled={submitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#003300] hover:bg-[#003300]/90 text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo ? (
                    <>
                      <div className="flex items-start space-x-3">
                        <MapPin className="text-[#663300] h-5 w-5 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-[#003300]">Address</h4>
                          <p className="text-gray-600">
                            {contactInfo.address || "N/A"} <br />
                            {contactInfo.city || ""}
                            {contactInfo.city && contactInfo.country ? ", " : ""}
                            {contactInfo.country || ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="text-[#663300] h-5 w-5 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-[#003300]">Phone</h4>
                          {contactInfo.mainPhone && <p className="text-gray-600">Main: {contactInfo.mainPhone}</p>}
                          {contactInfo.supportPhone && (
                            <p className="text-gray-600">Support: {contactInfo.supportPhone}</p>
                          )}
                          {!contactInfo.mainPhone && !contactInfo.supportPhone && <p className="text-gray-600">N/A</p>}
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Mail className="text-[#663300] h-5 w-5 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-[#003300]">Email</h4>
                          {contactInfo.email ? (
                            <a href={`mailto:${contactInfo.email}`} className="text-gray-600 hover:text-[#663300]">
                              {contactInfo.email}
                            </a>
                          ) : (
                            <p className="text-gray-600">N/A</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="text-[#663300] h-5 w-5 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-[#003300]">Business Hours</h4>
                          <p className="text-gray-600 whitespace-pre-line">
                            Monday - Friday: 8:00 AM - 6:00 PM <br />
                            Saturday: 9:00 AM - 2:00 PM <br />
                            Sunday: Closed
                          </p>
                        </div>
                      </div>
                      {renderSocialLinks()}
                    </>
                  ) : (
                    <p className="text-gray-500">Contact information not available.</p>
                  )}
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Find Us</CardTitle>
                </CardHeader>
                <CardContent>
                  {contactInfo?.mapUrl ? (
                    <iframe
                      src={contactInfo.mapUrl}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Company Location"
                      className="rounded-lg"
                    ></iframe>
                  ) : (
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Map not available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
