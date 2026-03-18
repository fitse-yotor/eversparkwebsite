"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, User, Clock } from "lucide-react"
import Link from "next/link"
import type { BlogPost } from "@/app/blogs/actions" // Import BlogPost type from actions

interface BlogListClientProps {
  initialBlogPosts: BlogPost[]
}

export function BlogListClient({ initialBlogPosts }: BlogListClientProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Derive categories from initialBlogPosts
  const blogCategories = [
    { id: "all", name: "All Posts" },
    ...Array.from(new Set(initialBlogPosts.map((post) => post.category))).map((cat) => ({
      id: cat,
      name: initialBlogPosts.find((p) => p.category === cat)?.categoryName || cat,
    })),
  ]

  // Filter blog posts based on category and search term
  const filteredPosts = initialBlogPosts.filter((post) => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory
    const matchesSearch =
      searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredPosts = initialBlogPosts.filter((post) => post.featured)
  const recentPosts = initialBlogPosts.slice(0, 3) // Get the 3 most recent published posts

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Filter Tabs and Search */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {blogCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={`px-4 py-2 rounded-full transition-all ${
                    activeCategory === category.id
                      ? "bg-[#003300] text-white hover:bg-[#003300]/90"
                      : "border-gray-300 text-gray-700 hover:border-[#003300] hover:text-[#003300]"
                  }`}
                  onClick={() => setActiveCategory(category.id)}
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
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#003300] focus:ring-[#003300]"
              />
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="space-y-8">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No articles found matching your criteria.</p>
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
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <div className="aspect-video md:aspect-square overflow-hidden">
                        <img
                          src={post.imageUrl || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-[#003300] text-white text-xs px-2 py-1">{post.categoryName}</Badge>
                        {post.featured && (
                          <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-[#003300] mb-3 hover:text-[#003300]/80 transition-colors">
                        <Link href={`/blogs/${post.id}`}>{post.title}</Link>
                      </h2>

                      <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="border-[#003300] text-[#003300] hover:bg-[#003300] hover:text-white bg-transparent"
                          asChild
                        >
                          <Link href={`/blogs/${post.id}`}>Read More</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Featured Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300]">Featured Articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-[#003300] mb-2 hover:text-[#003300]/80 transition-colors">
                    <Link href={`/blogs/${post.id}`}>{post.title}</Link>
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300]">Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-[#003300] mb-2 hover:text-[#003300]/80 transition-colors">
                    <Link href={`/blogs/${post.id}`}>{post.title}</Link>
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300]">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blogCategories
                  .filter((cat) => cat.id !== "all")
                  .map((category) => {
                    const count = initialBlogPosts.filter((post) => post.category === category.id).length
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-700">{category.name}</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{count}</span>
                      </button>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Signup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003300]">Stay Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm">
                Subscribe to our newsletter for the latest water treatment insights and industry updates.
              </p>
              <div className="space-y-3">
                <Input placeholder="Your email address" type="email" />
                <Button className="w-full bg-[#003300] hover:bg-[#003300]/90 text-white">Subscribe</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
