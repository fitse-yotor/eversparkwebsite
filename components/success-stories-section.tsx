"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const successStories = [
  {
    title: "Municipal Water Treatment Plant - City of Riverside",
    description: "Successfully implemented a large-scale electrochlorination system serving 100,000 residents.",
    image: "/placeholder.svg?height=300&width=400",
    outcome: "99.9% pathogen reduction achieved",
    client: "City of Riverside Water Department",
  },
  {
    title: "Solar-Powered Water System - Remote Village Project",
    description: "Deployed solar-powered water disinfection system in remote African village.",
    image: "/placeholder.svg?height=300&width=400",
    outcome: "Clean water access for 2,000 villagers",
    client: "International Development Agency",
  },
  {
    title: "Industrial Water Treatment - Manufacturing Facility",
    description: "Custom electrochlorination solution for large manufacturing facility cooling systems.",
    image: "/placeholder.svg?height=300&width=400",
    outcome: "40% reduction in chemical costs",
    client: "Global Manufacturing Corp",
  },
  {
    title: "Hospital Water Disinfection System",
    description: "Advanced water disinfection system ensuring highest safety standards for medical facility.",
    image: "/placeholder.svg?height=300&width=400",
    outcome: "Zero waterborne incidents in 3 years",
    client: "Regional Medical Center",
  },
]

export function SuccessStoriesSection() {
  const [currentStory, setCurrentStory] = useState(0)

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % successStories.length)
  }

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + successStories.length) % successStories.length)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">Success Stories</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how our solutions have made a positive impact on communities and organizations worldwide.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-square md:aspect-auto">
                <img
                  src={successStories[currentStory].image || "/placeholder.svg"}
                  alt={successStories[currentStory].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-[#003300] mb-4">{successStories[currentStory].title}</h3>
                <p className="text-gray-600 mb-4">{successStories[currentStory].description}</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-semibold text-[#003300] mr-2">Outcome:</span>
                    <span className="text-gray-600">{successStories[currentStory].outcome}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-[#003300] mr-2">Client:</span>
                    <span className="text-gray-600">{successStories[currentStory].client}</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Navigation */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:bg-gray-50"
            onClick={prevStory}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:bg-gray-50"
            onClick={nextStory}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {successStories.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStory ? "bg-[#003300]" : "bg-gray-300"
                }`}
                onClick={() => setCurrentStory(index)}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-[#003300] hover:bg-[#003300]/90 text-white px-8" asChild>
            <Link href="/projects">View More Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
