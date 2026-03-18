"use client"

import { SelectItem } from "@/components/ui/select"
import { SelectContent } from "@/components/ui/select"
import { SelectValue } from "@/components/ui/select"
import { SelectTrigger } from "@/components/ui/select"
import { Select } from "@/components/ui/select"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useFormState, useFormStatus } from "react-dom"
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { getEmbedUrl, isValidVideoUrl } from "@/lib/video-utils"
import {
  getProjects,
  getProjectBySlug,
  addProject,
  updateProject,
  deleteProject,
  getProjectCategories,
  type Project,
  type ProjectInput,
  type ProjectCategory,
} from "@/app/projects/actions"

// Submit Button Component
function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  )
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectInput | null>(null)
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null)
  const [dialogTitle, setDialogTitle] = useState("Add New Project")

  // Form state for add/edit operations
  const [formState, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    const projectInput: ProjectInput = {
      slug: formData.get("slug") as string,
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string | null,
      executive_summary: formData.get("executive_summary") as string | null,
      subtitle: formData.get("subtitle") as string | null,
      main_image_url: formData.get("main_image_url") as string | null,
      video_url: formData.get("video_url") as string | null,
      rating: Number.parseFloat(formData.get("rating") as string) || null,
      client: formData.get("client") as string | null,
      completed_date: formData.get("completed_date") as string | null,
      tags:
        (formData.get("tags") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || null,
      status: (formData.get("status") as string) || "completed",
      featured: formData.get("featured") === "on",
      sample_images:
        (formData.get("sample_images") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || null,
      key_results:
        (formData.get("key_results") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || null,
      technical_specs: JSON.parse((formData.get("technical_specs") as string) || "{}") || null,
    }

    let result
    if (currentProjectSlug) {
      // Update existing project
      result = await updateProject(currentProjectSlug, projectInput)
    } else {
      // Add new project
      result = await addProject(projectInput)
    }

    if (result.success) {
      toast({ title: result.message, description: "Project saved successfully." })
      setIsDialogOpen(false)
      fetchProjects() // Re-fetch projects to update the list
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to save project.",
        variant: "destructive",
      })
    }
    return result
  }, null)

  const fetchProjects = async () => {
    const data = await getProjects({})
    setProjects(data)
  }

  const fetchCategories = async () => {
    const data = await getProjectCategories()
    setCategories(data)
  }

  useEffect(() => {
    fetchProjects()
    fetchCategories()
  }, [])

  const handleAddProject = () => {
    setEditingProject({
      slug: "",
      title: "",
      category: "",
      location: "",
      description: null,
      executive_summary: null,
      subtitle: null,
      main_image_url: null,
      video_url: null,
      rating: null,
      client: null,
      completed_date: null,
      tags: null,
      status: "completed",
      featured: false,
      sample_images: null,
      key_results: null,
      technical_specs: null,
    })
    setCurrentProjectSlug(null)
    setDialogTitle("Add New Project")
    setIsDialogOpen(true)
  }

  const handleEditProject = async (projectSlug: string) => {
    const project = await getProjectBySlug(projectSlug)
    if (project) {
      setEditingProject(project)
      setCurrentProjectSlug(project.slug)
      setDialogTitle("Edit Project")
      setIsDialogOpen(true)
    } else {
      toast({
        title: "Error",
        description: "Project not found for editing.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectSlug: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const result = await deleteProject(projectSlug)
      if (result.success) {
        toast({ title: result.message, description: "Project deleted successfully." })
        fetchProjects()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete project.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003300]">Projects Management</h1>
          <p className="text-gray-600">Manage your project portfolio and case studies</p>
        </div>

        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#003300]">Manage Projects</h1>
            <Button onClick={handleAddProject} className="bg-[#003300] hover:bg-[#003300]/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        No projects found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{project.category || "N/A"}</TableCell>
                        <TableCell>{project.location || "N/A"}</TableCell>
                        <TableCell>{project.featured ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProject(project.slug)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.slug)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              {editingProject && (
                <form action={formAction} className="grid gap-4 py-4">
                  <input type="hidden" name="id" value={editingProject.slug || ""} />
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="title" className="text-right">
                      Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={editingProject.title || ""}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="slug" className="text-right">
                      Slug
                    </label>
                    <Input
                      id="slug"
                      name="slug"
                      defaultValue={editingProject.slug || ""}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="category" className="text-right">
                      Category
                    </label>
                    <Select
                      name="category"
                      defaultValue={editingProject.category || ""}
                      onValueChange={(value) => {
                        setEditingProject((prev) => ({
                          ...(prev as ProjectInput),
                          category: value,
                        }))
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="location" className="text-right">
                      Location
                    </label>
                    <Input
                      id="location"
                      name="location"
                      defaultValue={editingProject.location || ""}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="executive_summary" className="text-right">
                      Executive Summary
                    </label>
                    <Textarea
                      id="executive_summary"
                      name="executive_summary"
                      defaultValue={editingProject.executive_summary || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingProject.description || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="subtitle" className="text-right">
                      Subtitle
                    </label>
                    <Input
                      id="subtitle"
                      name="subtitle"
                      defaultValue={editingProject.subtitle || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="main_image_url" className="text-right">
                      Main Image URL
                    </label>
                    <Input
                      id="main_image_url"
                      name="main_image_url"
                      defaultValue={editingProject.main_image_url || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="video_url" className="text-right">
                      Video URL
                    </label>
                    <Input
                      id="video_url"
                      name="video_url"
                      defaultValue={editingProject.video_url || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="rating" className="text-right">
                      Rating (0.0-5.0)
                    </label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      defaultValue={editingProject.rating || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="client" className="text-right">
                      Client
                    </label>
                    <Input
                      id="client"
                      name="client"
                      defaultValue={editingProject.client || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="completed_date" className="text-right">
                      Completed Date (e.g., "2023", "Q4 2023")
                    </label>
                    <Input
                      id="completed_date"
                      name="completed_date"
                      defaultValue={editingProject.completed_date || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="tags" className="text-right">
                      Tags (comma-separated)
                    </label>
                    <Textarea
                      id="tags"
                      name="tags"
                      defaultValue={editingProject.tags?.join(", ") || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="status" className="text-right">
                      Status
                    </label>
                    <Select
                      name="status"
                      defaultValue={editingProject.status || "completed"}
                      onValueChange={(value) => {
                        setEditingProject((prev) => ({
                          ...(prev as ProjectInput),
                          status: value,
                        }))
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On-Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="featured" className="text-right">
                      Featured
                    </label>
                    <Input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      defaultChecked={editingProject.featured}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="sample_images" className="text-right">
                      Sample Image URLs (comma-separated)
                    </label>
                    <Textarea
                      id="sample_images"
                      name="sample_images"
                      defaultValue={editingProject.sample_images?.join(", ") || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="key_results" className="text-right">
                      Key Results (comma-separated)
                    </label>
                    <Textarea
                      id="key_results"
                      name="key_results"
                      defaultValue={editingProject.key_results?.join(", ") || ""}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="technical_specs" className="text-right">
                      Technical Specs (JSON)
                    </label>
                    <Textarea
                      id="technical_specs"
                      name="technical_specs"
                      defaultValue={JSON.stringify(editingProject.technical_specs, null, 2) || "{}"}
                      className="col-span-3 font-mono text-xs"
                      rows={6}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <SubmitButton>Save Project</SubmitButton>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
