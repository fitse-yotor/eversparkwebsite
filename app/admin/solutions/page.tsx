"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getSolutions,
  addSolution,
  updateSolution,
  deleteSolution,
  type Solution,
  type SolutionInput,
} from "../content/actions" // Adjusted path

const initialNewSolutionForm: SolutionInput = {
  title: "",
  description: "",
  image_url: "",
  benefits: [""],
  featured: false,
}

export default function SolutionsManagementPage() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [solutions, setSolutions] = useState<Solution[]>([])
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null)
  const [currentSolutionForm, setCurrentSolutionForm] = useState<SolutionInput>(initialNewSolutionForm)
  const [activeTab, setActiveTab] = useState("manage")

  const fetchSolutions = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const fetchedSolutions = await getSolutions()
      setSolutions(fetchedSolutions)
    } catch (error) {
      console.error("Failed to fetch solutions:", error)
      toast({ title: "Error", description: "Could not load solutions.", variant: "destructive" })
    } finally {
      setIsLoadingData(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSolutions()
  }, [fetchSolutions])

  const handleEditClick = (solution: Solution) => {
    setEditingSolution(solution)
    setCurrentSolutionForm({
      title: solution.title,
      description: solution.description || "",
      image_url: solution.image_url || "",
      featured: solution.featured,
      benefits: solution.benefits.map((b) => b.benefit_text),
    })
    setActiveTab("edit") // Switch to an edit tab or open modal
  }

  const handleCancelEdit = () => {
    setEditingSolution(null)
    setCurrentSolutionForm(initialNewSolutionForm)
    setActiveTab("manage")
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (isPending) return

    startTransition(async () => {
      try {
        if (editingSolution) {
          await updateSolution(editingSolution.id, currentSolutionForm)
          toast({ title: "Success", description: "Solution updated successfully." })
        } else {
          await addSolution(currentSolutionForm)
          toast({ title: "Success", description: "Solution added successfully." })
        }
        fetchSolutions()
      } catch (error) {
        console.error("Failed to save solution:", error)
        toast({ title: "Error", description: "Could not save solution.", variant: "destructive" })
      }
    })
  }

  const handleDeleteSolution = async (id) => {
    if (confirm("Are you sure you want to delete this solution?")) {
      try {
        await deleteSolution(id)
        toast({ title: "Success", description: "Solution deleted successfully." })
        fetchSolutions()
      } catch (error) {
        console.error("Failed to delete solution:", error)
        toast({ title: "Error", description: "Could not delete solution.", variant: "destructive" })
      }
    }
  }

  const addBenefit = () => {
    setCurrentSolutionForm({ ...currentSolutionForm, benefits: [...currentSolutionForm.benefits, ""] })
  }

  const updateBenefit = (index, value) => {
    const updated = [...currentSolutionForm.benefits]
    updated[index] = value
    setCurrentSolutionForm({ ...currentSolutionForm, benefits: updated })
  }

  const removeBenefit = (index) => {
    setCurrentSolutionForm({
      ...currentSolutionForm,
      benefits: currentSolutionForm.benefits.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {isLoadingData && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        )}

        {!isLoadingData && (
          <Tabs defaultValue="manage" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Manage Solutions</TabsTrigger>
              <TabsTrigger value="add">Add New Solution</TabsTrigger>
            </TabsList>

            <TabsContent value="manage">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map((solution) => (
                  <Card key={solution.id} className="overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={solution.image_url || "/placeholder.svg"}
                        alt={solution.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-[#003300]">{solution.title}</CardTitle>
                        {solution.featured && <Badge className="bg-yellow-500 text-white">Featured</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{solution.description}</p>
                      <div className="mb-4">
                        <h4 className="font-semibold text-[#003300] mb-2">Benefits:</h4>
                        <ul className="space-y-1">
                          {solution.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <span className="w-2 h-2 bg-[#663300] rounded-full mr-2"></span>
                              {benefit.benefit_text}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(solution)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSolution(solution.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Add New Solution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SolutionForm
                    solution={currentSolutionForm}
                    setSolution={setCurrentSolutionForm}
                    onSave={handleFormSubmit}
                    isEditing={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit">
              {editingSolution && (
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="text-[#003300]">Edit Solution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SolutionForm
                      solution={currentSolutionForm}
                      setSolution={setCurrentSolutionForm}
                      onSave={handleFormSubmit}
                      isEditing={true}
                    />
                    <Button variant="outline" onClick={handleCancelEdit} className="mt-4">
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

function SolutionForm({ solution, setSolution, onSave, isEditing }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(e)
  }

  const addBenefit = () => {
    setSolution({ ...solution, benefits: [...solution.benefits, ""] })
  }

  const updateBenefit = (index, value) => {
    const updated = [...solution.benefits]
    updated[index] = value
    setSolution({ ...solution, benefits: updated })
  }

  const removeBenefit = (index) => {
    setSolution({ ...solution, benefits: solution.benefits.filter((_, i) => i !== index) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <Input
          value={solution.title}
          onChange={(e) => setSolution({ ...solution, title: e.target.value })}
          placeholder="Solution title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <Textarea
          value={solution.description}
          onChange={(e) => setSolution({ ...solution, description: e.target.value })}
          placeholder="Solution description"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
        <Input
          value={solution.image_url}
          onChange={(e) => setSolution({ ...solution, image_url: e.target.value })}
          placeholder="Image URL"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
        {solution.benefits.map((benefit, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={benefit}
              onChange={(e) => updateBenefit(index, e.target.value)}
              placeholder="Benefit description"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeBenefit(index)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addBenefit}>
          <Plus className="w-4 h-4 mr-2" />
          Add Benefit
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={solution.featured}
          onChange={(e) => setSolution({ ...solution, featured: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="featured" className="text-sm font-medium text-gray-700">
          Featured Solution
        </label>
      </div>

      <Button type="submit" className="bg-[#003300] hover:bg-[#003300]/90 text-white">
        <Save className="w-4 h-4 mr-2" />
        {isEditing ? "Update Solution" : "Add Solution"}
      </Button>
    </form>
  )
}
