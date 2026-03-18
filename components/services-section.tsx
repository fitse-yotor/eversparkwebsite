"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Wrench, Droplets, Zap, Shield, Recycle, Settings } from "lucide-react"

interface ServiceItem {
  id: string
  title: string
  description: string
  icon: string
  sort_order: number
}

interface ServicePageData {
  subtitle: string | null
}

interface ServicesData {
  services: ServiceItem[]
  pageContent: ServicePageData
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  wrench: Wrench,
  droplets: Droplets,
  zap: Zap,
  shield: Shield,
  recycle: Recycle,
  settings: Settings,
}

export function ServicesSection() {
  const [data, setData] = useState<ServicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch("/api/services")
        if (!response.ok) {
          throw new Error("Failed to fetch services")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("Error fetching services:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="text-center">
                <CardHeader>
                  <Skeleton className="h-12 w-12 mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">Error loading services: {error}</p>
        </div>
      </section>
    )
  }

  if (!data) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">Our Services</h2>
          {data.pageContent.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{data.pageContent.subtitle}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.services.map((service) => {
            const IconComponent = iconMap[service.icon] || Settings
            return (
              <Card key={service.id} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-[#003300] rounded-full w-fit">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-[#003300]">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
