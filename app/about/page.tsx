"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getAboutUsData, getTeamMembers, type AboutUsData, type TeamMember } from "@/app/admin/content/actions"

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutUsData | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [about, team] = await Promise.all([getAboutUsData(), getTeamMembers()])
      setAboutData(about)
      setTeamMembers(team)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen container mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <Skeleton className="h-8 w-1/3 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
          </div>
          <Skeleton className="aspect-square rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="items-center">
                <Skeleton className="h-10 w-10 mb-4" />
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-8 w-1/2 mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="text-center">
              <CardHeader>
                <Skeleton className="w-32 h-32 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-5/6 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-[#003300] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {aboutData?.title || "About Ever Spark Technologies"}
            </h1>
            {aboutData?.subtitle && <p className="text-xl text-gray-200">{aboutData.subtitle}</p>}
          </div>
        </div>
      </section>

      {/* Company Story */}
      {aboutData && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#003300] mb-6">{aboutData.storyTitle || "Our Story"}</h2>
                <div
                  className="space-y-4 text-gray-600 prose lg:prose-lg"
                  dangerouslySetInnerHTML={{ __html: aboutData.storyContent || "<p>Company story not available.</p>" }}
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={aboutData.storyImageUrl || "/placeholder.svg?height=500&width=500&query=company+history"}
                  alt={aboutData.storyTitle || "Company Story"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-[#f6f4f3]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">🎯</div>
                <CardTitle className="text-[#003300]">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  To provide innovative, sustainable water treatment solutions that ensure safe, clean water access for
                  communities worldwide while protecting our environment.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">👁️</div>
                <CardTitle className="text-[#003300]">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  To be the global leader in sustainable water treatment technologies, creating a world where everyone
                  has access to safe, clean water.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">⭐</div>
                <CardTitle className="text-[#003300]">Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Innovation, sustainability, integrity, and excellence guide everything we do. We are committed to
                  making a positive impact on communities and the environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">Our Leadership Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Meet the experienced professionals driving innovation and excellence at Ever Spark Technologies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                      <img
                        src={member.image || "/placeholder.svg?height=200&width=200&query=team+member"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-[#003300]">{member.name}</CardTitle>
                    <p className="text-[#663300] font-medium">{member.position}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Company Stats */}
      <section className="py-16 bg-[#003300] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-gray-300">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-gray-300">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-gray-300">People Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-gray-300">Years Experience</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
