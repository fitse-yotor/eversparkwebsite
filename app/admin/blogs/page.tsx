"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, RefreshCw } from "lucide-react"
import { getBlogs, addBlog, updateBlog, deleteBlog, type BlogPost, type BlogInput } from "@/app/blogs/actions" // Import actions and types
import { uploadFile } from "@/app/api/upload/route" // Assuming this is your upload action

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [formInput, setFormInput] = useState<BlogInput>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    publishedDate: new Date().toISOString().split("T")[0], // Default to today
    readTime: "",
    imageUrl: null,
    tags: [],
    category: "technology", // Default category
    categoryName: "Technology", // Default category name
    featured: false,
    status: "draft", // Default status
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const categories = [
    { id: "technology", name: "Technology" },
    { id: "sustainability", name: "Sustainability" },
    { id: "case-studies", name: "Case Studies" },
    { id: "industry-news", name: "Industry News" },
    { id: "innovation", name: "Innovation" },
  ]

  const fetchBlogs = async () => {
    setLoading(true)
    const data = await getBlogs()
    setBlogs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormInput((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof BlogInput, value: string) => {
    setFormInput((prev) => {
      const newState = { ...prev, [name]: value }
      if (name === "category") {
        newState.categoryName = categories.find((cat) => cat.id === value)?.name || value
      }
      return newState
    })
  }

  const handleCheckboxChange = (name: keyof BlogInput, checked: boolean) => {
    setFormInput((prev) => ({ ...prev, [name]: checked }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormInput((prev) => ({ ...prev, tags: e.target.value.split(",").map((tag) => tag.trim()) }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    } else {
      setImageFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    let imageUrl = formInput.imageUrl

    if (imageFile) {
      try {
        const formData = new FormData()
        formData.append("file", imageFile)
        const uploadResult = await uploadFile(formData) // Call the upload action
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
        } else {
          setFormError(uploadResult.message || "Failed to upload image.")
          return
        }
      } catch (error: any) {
        setFormError(`Image upload failed: ${error.message}`)
        return
      }
    }

    const blogData = { ...formInput, imageUrl }

    let result
    if (editingBlog) {
      result = await updateBlog(editingBlog.id, blogData)
    } else {
      result = await addBlog(blogData)
    }

    if (result.success) {
      setFormSuccess(result.message)
      setFormInput({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        author: "",
        publishedDate: new Date().toISOString().split("T")[0],
        readTime: "",
        imageUrl: null,
        tags: [],
        category: "technology",
        categoryName: "Technology",
        featured: false,
        status: "draft",
      })
      setImageFile(null)
      setEditingBlog(null)
      fetchBlogs()
    } else {
      setFormError(result.message)
    }
  }

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog)
    setFormInput({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      publishedDate: blog.publishedDate,
      readTime: blog.readTime,
      imageUrl: blog.imageUrl,
      tags: blog.tags,
      category: blog.category,
      categoryName: blog.categoryName,
      featured: blog.featured,
      status: blog.status,
    })
    setFormError(null)
    setFormSuccess(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      const result = await deleteBlog(id)
      if (result.success) {
        setFormSuccess(result.message)
        fetchBlogs()
      } else {
        setFormError(result.message)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingBlog(null)
    setFormInput({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "",
      publishedDate: new Date().toISOString().split("T")[0],
      readTime: "",
      imageUrl: null,
      tags: [],
      category: "technology",
      categoryName: "Technology",
      featured: false,
      status: "draft",
    })
    setImageFile(null)
    setFormError(null)
    setFormSuccess(null)
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003300]">Blog Management</h1>
          <p className="text-gray-600">Manage your blog posts, articles, and news updates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#003300]">All Blog Posts</CardTitle>
                <Button onClick={fetchBlogs} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading blogs...</div>
                ) : blogs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No blog posts found.</div>
                ) : (
                  <div className="space-y-0">
                    {blogs.map((blog) => (
                      <div
                        key={blog.id}
                        className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <h4 className="font-semibold text-[#003300]">{blog.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1">{blog.excerpt}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Badge variant="secondary">{blog.categoryName}</Badge>
                            {blog.featured && <Badge variant="outline">Featured</Badge>}
                            <Badge variant="outline">{blog.status}</Badge>
                            <span>{new Date(blog.publishedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 bg-transparent"
                            onClick={() => handleDelete(blog.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add/Edit Blog Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">{editingBlog ? "Edit Blog Post" : "Add New Blog Post"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && <p className="text-red-500 text-sm">{formError}</p>}
                  {formSuccess && <p className="text-green-500 text-sm">{formSuccess}</p>}

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={formInput.title} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" value={formInput.slug} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      value={formInput.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formInput.content}
                      onChange={handleInputChange}
                      rows={8}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" name="author" value={formInput.author} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="publishedDate">Published Date</Label>
                    <Input
                      id="publishedDate"
                      name="publishedDate"
                      type="date"
                      value={formInput.publishedDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="readTime">Read Time (e.g., "5 min read")</Label>
                    <Input id="readTime" name="readTime" value={formInput.readTime} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image</Label>
                    {formInput.imageUrl && (
                      <div className="mb-2">
                        <img
                          src={formInput.imageUrl || "/placeholder.svg"}
                          alt="Current Image"
                          className="max-h-32 object-contain"
                        />
                      </div>
                    )}
                    <Input id="imageUrl" name="imageUrl" type="file" onChange={handleImageChange} />
                    <p className="text-xs text-gray-500 mt-1">Upload a new image or keep existing.</p>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" name="tags" value={formInput.tags.join(", ")} onChange={handleTagsChange} />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formInput.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formInput.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value as "draft" | "published" | "archived")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formInput.featured}
                      onCheckedChange={(checked) => handleCheckboxChange("featured", !!checked)}
                    />
                    <Label htmlFor="featured">Featured Post</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#003300] hover:bg-[#003300]/90 text-white">
                      {editingBlog ? "Update Blog" : "Add Blog"}
                    </Button>
                    {editingBlog && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
