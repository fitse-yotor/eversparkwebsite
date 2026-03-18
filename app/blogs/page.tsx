import { getBlogs, type BlogPost } from "./actions"
import { BlogListClient } from "@/components/blog-list-client"

export default async function BlogsPage() {
  const allBlogPosts: BlogPost[] = await getBlogs()

  // Filter out non-published posts for public view
  const publishedBlogPosts = allBlogPosts.filter((post) => post.status === "published")

  return (
    <main className="min-h-screen bg-[#f6f4f3]">
      {/* Hero Section */}
      <section className="py-16 bg-[#003300] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Blog</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Stay updated with the latest insights, innovations, and success stories in water treatment technology
            </p>
          </div>
        </div>
      </section>

      {/* Pass the fetched and filtered posts to the client component */}
      <BlogListClient initialBlogPosts={publishedBlogPosts} />
    </main>
  )
}
