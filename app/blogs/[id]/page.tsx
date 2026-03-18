import { notFound } from "next/navigation"
import { getBlogBySlug } from "../actions"
import { Calendar, User, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BlogPageProps {
  params: {
    id: string // This will be the slug
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const blogPost = await getBlogBySlug(params.id) // Fetch by slug

  if (!blogPost || blogPost.status !== "published") {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#f6f4f3] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {blogPost.imageUrl && (
            <img
              src={blogPost.imageUrl || "/placeholder.svg"}
              alt={blogPost.title}
              className="w-full h-80 object-cover"
            />
          )}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-[#003300] text-white text-sm px-3 py-1">{blogPost.categoryName}</Badge>
              {blogPost.featured && (
                <Badge variant="outline" className="text-sm border-yellow-400 text-yellow-600">
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-[#003300] mb-4">{blogPost.title}</h1>
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blogPost.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blogPost.publishedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blogPost.readTime}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {/* Render content, assuming it's plain text or markdown that can be rendered directly */}
              <p>{blogPost.content}</p>
            </div>

            {blogPost.tags && blogPost.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-[#003300] mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {blogPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  )
}
