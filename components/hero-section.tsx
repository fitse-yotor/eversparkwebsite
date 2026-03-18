"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getHeroImages, type HeroImage } from "@/app/admin/content/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function HeroSection() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getHeroImages()
      setHeroImages(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (heroImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [heroImages.length])

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? heroImages.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === heroImages.length - 1 ? 0 : currentIndex + 1)
  }

  if (loading) {
    return (
      <section className="relative h-[600px] overflow-hidden bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4">
            <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
            <Skeleton className="h-12 w-40 mx-auto" />
          </div>
        </div>
      </section>
    )
  }

  if (!heroImages.length) {
    return (
      <section className="relative h-[600px] overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No hero images available.</p>
      </section>
    )
  }

  const currentImage = heroImages[currentIndex]

  return (
    <section className="relative h-[600px] overflow-hidden">
      <div className="relative w-full h-full">
        <img
          src={currentImage.imageUrl || "/placeholder.svg?height=600&width=1200&query=modern+technology"}
          alt={currentImage.title}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {heroImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{currentImage.title}</h1>
          <p className="text-xl md:text-2xl mb-6 text-gray-200">{currentImage.subtitle}</p>
          {currentImage.description && (
            <p className="text-md md:text-lg mb-8 text-gray-300">{currentImage.description}</p>
          )}
          <Button
            size="lg"
            className="bg-[#663300] hover:bg-[#663300]/90 text-white px-8 py-3"
            onClick={scrollToContact}
          >
            Get in Touch
          </Button>
        </div>
      </div>

      {heroImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
