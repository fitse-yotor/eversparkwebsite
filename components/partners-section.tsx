"use client"

import { useEffect, useState } from "react"
import { getPartnerItems, type PartnerItem } from "@/app/admin/content/actions"
import { Skeleton } from "@/components/ui/skeleton"

export function PartnersSection() {
  const [partners, setPartners] = useState<PartnerItem[]>([])
  const [loading, setLoading] = useState(true)
  // Carousel state remains, but will be driven by fetched data
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsToShow = 4 // For desktop carousel

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const items = await getPartnerItems()
      setPartners(items)
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (partners.length <= itemsToShow) return // No scroll if not enough items

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (partners.length - itemsToShow + 1))
    }, 3000)
    return () => clearInterval(timer)
  }, [partners, itemsToShow])

  if (loading) {
    return (
      <section className="py-16 bg-[#f6f4f3]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-1/3 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          <div className="hidden md:flex space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="flex-shrink-0 w-1/4 h-24 rounded-lg" />
            ))}
          </div>
          <div className="md:hidden grid grid-cols-2 gap-4 mt-8">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-[#f6f4f3]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">Our Partners</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We collaborate with leading organizations worldwide to deliver exceptional water treatment solutions.
          </p>
        </div>

        {partners.length > 0 ? (
          <>
            {/* Desktop Carousel */}
            <div className="overflow-hidden hidden md:block">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${partners.length > itemsToShow ? currentIndex * (100 / itemsToShow) : 0}%)`,
                  width: `${partners.length * (100 / itemsToShow)}%`, // Ensure container is wide enough
                }}
              >
                {partners.map((partner) => (
                  <div key={partner.id} className="flex-shrink-0 px-4" style={{ width: `${100 / partners.length}%` }}>
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-24">
                      <a
                        href={partner.websiteUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-full"
                      >
                        <img
                          src={partner.logoUrl || `/placeholder.svg?height=80&width=160&query=${partner.name}`}
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
                        />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile view - show partners in a grid */}
            <div className="md:hidden grid grid-cols-2 gap-4 mt-8">
              {partners.slice(0, 6).map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center h-20"
                >
                  <a
                    href={partner.websiteUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full h-full"
                  >
                    <img
                      src={partner.logoUrl || `/placeholder.svg?height=60&width=120&query=${partner.name}`}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Our partners will be listed here soon.</p>
        )}
      </div>
    </section>
  )
}
