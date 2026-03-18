"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, User, Search } from "lucide-react" // Import icons
import Link from "next/link"
import type { Project, ProjectCategory } from "@/app/projects/actions" // Ensure correct types are imported

interface ProjectListClientProps {
  initialProjects: Project[]
  projectCategories: ProjectCategory[]
}

export function ProjectListClient({ initialProjects, projectCategories }: ProjectListClientProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter projects based on category and search term
  const filteredProjects = initialProjects.filter((project) => {
    const matchesCategory = activeCategory === "all" || project.category === activeCategory // Filter by category name
    const matchesSearch =
      searchTerm === "" ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) || // Use project.title
      project.executive_summary?.toLowerCase().includes(searchTerm.toLowerCase()) || // Use executive_summary
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) || // Use description
      project.category.toLowerCase().includes(searchTerm.toLowerCase()) || // Use project.category
      project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-[#f6f4f3]">
      {/* Hero Section - This section is likely part of app/projects/page.tsx now, but keeping for context */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Filter Tabs and Search */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeCategory === "all"
                    ? "bg-[#003300] text-white hover:bg-[#003300]/90"
                    : "border-gray-300 text-gray-700 hover:border-[#003300] hover:text-[#003300]"
                }`}
                onClick={() => setActiveCategory("all")}
              >
                All Projects
              </Button>
              {projectCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.name ? "default" : "outline"} // Filter by category name
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeCategory === category.name
                      ? "bg-[#003300] text-white hover:bg-[#003300]/90"
                      : "border-gray-300 text-gray-700 hover:border-[#003300] hover:text-[#003300]"
                  }`}
                  onClick={() => setActiveCategory(category.name)} // Set selected category by name
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#003300] focus:ring-[#003300]"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="relative">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.main_image_url || "/placeholder.svg?height=300&width=400&text=Project Image"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {project.category && (
                    <Badge className="absolute top-4 left-4 bg-[#003300] text-white text-xs px-2 py-1">
                      {project.category}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#003300] mb-2">{project.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-2 mb-2">
                    {project.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {project.location}
                      </span>
                    )}
                    {project.client && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" /> {project.client}
                      </span>
                    )}
                    {project.rating !== null && project.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {project.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {(project.executive_summary || project.description) && (
                    <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
                      {project.executive_summary || project.description}
                    </p>
                  )}
                  <Button className="w-full bg-[#003300] hover:bg-[#003300]/90 text-white" asChild>
                    <Link href={`/projects/${project.slug}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results Message */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No projects found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => {
                  setActiveCategory("all")
                  setSearchTerm("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
