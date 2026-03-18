"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { getProjects, getProjectCategories, type Project, type ProjectCategory } from "@/app/projects/actions"
import { MapPin, Star, User } from "lucide-react" // Import icons

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, categoriesData] = await Promise.all([
          getProjects({ featured: true }), // Only show featured projects on homepage
          getProjectCategories(),
        ])
        setProjects(projectsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProjects =
    selectedCategory === "all" ? projects : projects.filter((project) => project.category === selectedCategory)

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">Our Projects</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our successful projects showcasing our expertise in water treatment and related solutions.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-[#003300] hover:bg-[#003300]/90" : ""}
            >
              All Projects
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"} // Filter by category name
                onClick={() => setSelectedCategory(category.name)} // Set selected category by name
                className={selectedCategory === category.name ? "bg-[#003300] hover:bg-[#003300]/90" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No projects found for the selected category.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <Link href={`/projects/${project.slug}`}>
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={
                        project.main_image_url ||
                        `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(project.title) || "project image"}`
                      }
                      alt={project.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    {project.category && (
                      <Badge className="bg-[#003300] text-white text-xs px-2 py-1">{project.category}</Badge>
                    )}
                    {project.featured && <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">Featured</Badge>}
                  </div>
                  <CardTitle className="text-xl font-bold text-[#003300]">
                    <Link href={`/projects/${project.slug}`} className="hover:underline">
                      {project.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 gap-2">
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
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">
                    {project.executive_summary || project.description}
                  </p>
                  <Button className="w-full bg-[#003300] hover:bg-[#003300]/90 text-white" asChild>
                    <Link href={`/projects/${project.slug}`}>View Project</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View All Projects Button */}
        <div className="text-center mt-12">
          <Button className="bg-[#663300] hover:bg-[#663300]/90 text-white px-8 py-3" asChild>
            <Link href="/projects">View All Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
