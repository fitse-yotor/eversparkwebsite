"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Save } from "lucide-react"
import {
  addProductCategory,
  updateProductCategory,
  deleteProductCategory,
  type ProductCategory,
  type ProductCategoryInput,
} from "@/app/admin/content/actions"

interface ProductCategoryManagementProps {
  categories: ProductCategory[]
  refreshCategories: () => void
}

export function ProductCategoryManagement({ categories, refreshCategories }: ProductCategoryManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState<ProductCategoryInput>({
    name: "",
    description: "",
    slug: "",
  })

  useEffect(() => {
    if (editingCategory) {
      setCategoryForm({
        name: editingCategory.name,
        description: editingCategory.description,
        slug: editingCategory.slug,
      })
    } else {
      setCategoryForm({ name: "", description: "", slug: "" })
    }
  }, [editingCategory])

  const handleOpenDialog = (category?: ProductCategory) => {
    setEditingCategory(category || null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setCategoryForm({ name: "", description: "", slug: "" })
  }

  const handleSaveCategory = async () => {
    try {
      let result
      if (editingCategory) {
        result = await updateProductCategory(editingCategory.id, categoryForm)
      } else {
        result = await addProductCategory(categoryForm)
      }

      if (result.success) {
        alert(result.message)
        handleCloseDialog()
        refreshCategories()
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error("Error saving category:", error)
      alert("An error occurred while saving the category.")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? This cannot be undone.")) {
      try {
        const result = await deleteProductCategory(id)
        if (result.success) {
          alert(result.message)
          refreshCategories()
        } else {
          alert(`Error: ${result.message}`)
        }
      } catch (error) {
        console.error("Error deleting category:", error)
        alert("An error occurred while deleting the category.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Category
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                  No product categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell className="text-sm text-gray-600 line-clamp-2">{category.description || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                id="slug"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                className="col-span-3"
                placeholder="e.g., electronics-components"
                required
                disabled={!!editingCategory} // Disable slug editing for existing categories
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={categoryForm.description || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              <Save className="w-4 h-4 mr-2" />
              {editingCategory ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
