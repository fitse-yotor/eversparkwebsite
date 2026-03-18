import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar, User, Tag } from "lucide-react" // Added Tag icon
import Link from "next/link"
import { getProjectBySlug } from "@/app/projects/actions"
import { getEmbedUrl, isValidVideoUrl } from "@/lib/video-utils"

interface PageProps {
  params: {
    id: string // This is the slug
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await getProjectBySlug(params.id)

  if (!project) {
    notFound()
  }

  const renderStars = (rating: number | null) => {
    if (rating === null) return null
    const stars = []
    const maxRating = 5 // Assuming max rating is always 5
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />)
    }

    const emptyStars = maxRating - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Image */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={project.main_image_url || "/placeholder.svg?height=500&width=800&text=Main Project Image"}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-8 left-8">
          <Badge className="mb-4 bg-[#003300] text-white">{project.category}</Badge>
          <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
          <div className="flex items-center text-white">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{project.location}</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      {project.client && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-600">Client: {project.client}</span>
                        </div>
                      )}
                      {project.completed_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-600">Completed: {project.completed_date}</span>
                        </div>
                      )}
                    </div>
                    {project.rating !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(project.rating)}
                          <span className="text-sm text-gray-600 ml-1">{project.rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Executive Summary */}
            {project.executive_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{project.executive_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Subtitle and Description */}
            {(project.subtitle || project.description) && (
              <Card>
                <CardHeader>
                  {project.subtitle && <CardTitle className="text-[#003300]">{project.subtitle}</CardTitle>}
                </CardHeader>
                <CardContent>
                  {project.description && <p className="text-gray-700 leading-relaxed">{project.description}</p>}
                </CardContent>
              </Card>
            )}

            {/* Sample Pictures */}
            {project.sample_images && project.sample_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Project Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {project.sample_images.map((image, index) => (
                      <div key={index} className="aspect-video overflow-hidden rounded-lg">
                        <img
                          src={image || "/placeholder.svg?height=300&width=400&text=Sample Image"}
                          alt={`Project image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {project.video_url && isValidVideoUrl(project.video_url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Project Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <iframe
                      src={getEmbedUrl(project.video_url)}
                      title="Project Video"
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Results */}
            {project.key_results && project.key_results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Key Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {project.key_results.map((result, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-[#003300] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{result}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Technical Specifications */}
            {project.technical_specs && Object.keys(project.technical_specs).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(project.technical_specs).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-2">
                        <div className="font-medium text-gray-700">{key}:</div>
                        <div className="text-gray-600">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                        <Tag className="w-3 h-3 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#003300] mb-4">Interested in a Similar Project?</h3>
                <p className="text-gray-600 mb-4">
                  Contact our team to discuss how we can help with your water treatment needs.
                </p>
                <Button className="w-full bg-[#003300] hover:bg-[#003300]/90 text-white" asChild>
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
