"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, Edit, Plus, Save, Eye, Upload, FileText, RefreshCw } from "lucide-react"
import {
  getProducts,
  getProductCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type ProductCategory,
  type ProductInput,
} from "@/app/admin/content/actions"
import { ProductCategoryManagement } from "@/components/product-category-management" // Import the new component

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<ProductInput>({
    slug: "",
    name: "",
    category_id: "",
    short_description: "",
    full_description: "",
    main_image_url: "",
    data_sheet_url: "",
    featured: false,
    status: "active",
    specifications: {},
    feature_texts: [""],
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([getProducts(), getProductCategories()])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Update newProduct's category_id when categories load
  useEffect(() => {
    if (categories.length > 0 && !newProduct.category_id) {
      setNewProduct((prev) => ({ ...prev, category_id: categories[0].id }))
    }
  }, [categories, newProduct.category_id])

  const handleSaveProduct = async (productData: ProductInput) => {
    try {
      if (editingProduct) {
        const result = await updateProduct(editingProduct.slug, productData)
        if (result.success) {
          alert("Product updated successfully!")
          setEditingProduct(null)
          fetchData()
        } else {
          alert(`Error: ${result.message}`)
        }
      } else {
        const result = await addProduct(productData)
        if (result.success) {
          alert("Product added successfully!")
          setNewProduct({
            slug: "",
            name: "",
            category_id: categories.length > 0 ? categories[0].id : "", // Reset to first category or empty
            short_description: "",
            full_description: "",
            main_image_url: "",
            data_sheet_url: "",
            featured: false,
            status: "active",
            specifications: {},
            feature_texts: [""],
          })
          fetchData()
        } else {
          alert(`Error: ${result.message}`)
        }
      }
    } catch (error) {
      console.error("Error saving product:", error)
      alert("An error occurred while saving the product")
    }
  }

  const handleDeleteProduct = async (slug: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const result = await deleteProduct(slug)
        if (result.success) {
          alert("Product deleted successfully!")
          fetchData()
        } else {
          alert(`Error: ${result.message}`)
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("An error occurred while deleting the product")
      }
    }
  }

  const toggleProductStatus = async (product: Product) => {
    const newStatus = product.status === "active" ? "inactive" : "active"
    try {
      const result = await updateProduct(product.slug, {
        ...product,
        status: newStatus,
        feature_texts: product.features.map((f) => f.feature_text),
      })
      if (result.success) {
        fetchData()
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error("Error updating product status:", error)
    }
  }

  const handleFileUpload = async (file: File, type: "image" | "datasheet") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("File upload failed")
      return null
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f6f4f3]">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#003300]">Products Management</h1>
              <p className="text-gray-600">Manage your product catalog and specifications</p>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="manage-products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {" "}
            {/* Changed to 3 columns */}
            <TabsTrigger value="manage-products">Manage Products</TabsTrigger>
            <TabsTrigger value="add-product">Add New Product</TabsTrigger>
            <TabsTrigger value="manage-categories">Manage Categories</TabsTrigger> {/* New Tab */}
          </TabsList>

          <TabsContent value="manage-products">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={product.main_image_url || "/placeholder.svg?height=300&width=400"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#003300]">{product.name}</CardTitle>
                      <div className="flex gap-1">
                        {product.featured && <Badge className="bg-yellow-500 text-white">Featured</Badge>}
                        <Badge
                          className={product.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                        >
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{product.category_name}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{product.short_description}</p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-[#003300] mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {product.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-2 h-2 bg-[#663300] rounded-full mr-2"></span>
                            {feature.feature_text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {product.data_sheet_url && (
                      <div className="mb-4">
                        <Badge variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          Datasheet Available
                        </Badge>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)} className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProductStatus(product)}
                        className={product.status === "active" ? "text-orange-600" : "text-green-600"}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.slug)}
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

          <TabsContent value="add-product">
            {" "}
            {/* Renamed value from "add" to "add-product" */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">Add New Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProductForm
                  product={newProduct}
                  setProduct={setNewProduct}
                  onSave={handleSaveProduct}
                  categories={categories}
                  onFileUpload={handleFileUpload}
                  isEditing={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-categories">
            {" "}
            {/* New Tab Content */}
            <ProductCategoryManagement categories={categories} refreshCategories={fetchData} />
          </TabsContent>
        </Tabs>

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-[#003300]">Edit Product</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductForm
                  product={{
                    slug: editingProduct.slug,
                    name: editingProduct.name,
                    category_id: editingProduct.category_id,
                    short_description: editingProduct.short_description,
                    full_description: editingProduct.full_description,
                    main_image_url: editingProduct.main_image_url,
                    data_sheet_url: editingProduct.data_sheet_url,
                    featured: editingProduct.featured,
                    status: editingProduct.status,
                    specifications: editingProduct.specifications || {},
                    feature_texts: editingProduct.features.map((f) => f.feature_text),
                  }}
                  setProduct={(product) => {
                    // This is a bit complex for editing, but we'll handle it in the form
                  }}
                  onSave={handleSaveProduct}
                  categories={categories}
                  onFileUpload={handleFileUpload}
                  isEditing={true}
                />
                <Button variant="outline" onClick={() => setEditingProduct(null)} className="mt-4">
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

interface ProductFormProps {
  product: ProductInput
  setProduct: (product: ProductInput) => void
  onSave: (product: ProductInput) => void
  categories: ProductCategory[]
  onFileUpload: (file: File, type: "image" | "datasheet") => Promise<string | null>
  isEditing: boolean
}

function ProductForm({ product, setProduct, onSave, categories, onFileUpload, isEditing }: ProductFormProps) {
  const [localProduct, setLocalProduct] = useState<ProductInput>(product)
  const [uploading, setUploading] = useState<{ image: boolean; datasheet: boolean }>({
    image: false,
    datasheet: false,
  })

  // Update localProduct when the prop changes (e.g., when editingProduct is set)
  useEffect(() => {
    setLocalProduct(product)
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(localProduct)
  }

  const addFeature = () => {
    setLocalProduct({ ...localProduct, feature_texts: [...localProduct.feature_texts, ""] })
  }

  const updateFeature = (index: number, value: string) => {
    const updated = [...localProduct.feature_texts]
    updated[index] = value
    setLocalProduct({ ...localProduct, feature_texts: updated })
  }

  const removeFeature = (index: number) => {
    setLocalProduct({
      ...localProduct,
      feature_texts: localProduct.feature_texts.filter((_, i) => i !== index),
    })
  }

  const updateSpecification = (key: string, value: string) => {
    setLocalProduct({
      ...localProduct,
      specifications: { ...localProduct.specifications, [key]: value },
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading({ ...uploading, image: true })
      const url = await onFileUpload(file, "image")
      if (url) {
        setLocalProduct({ ...localProduct, main_image_url: url })
      }
      setUploading({ ...uploading, image: false })
    }
  }

  const handleDatasheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading({ ...uploading, datasheet: true })
      const url = await onFileUpload(file, "datasheet")
      if (url) {
        setLocalProduct({ ...localProduct, data_sheet_url: url })
      }
      setUploading({ ...uploading, datasheet: false })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
          <Input
            value={localProduct.name}
            onChange={(e) => setLocalProduct({ ...localProduct, name: e.target.value })}
            placeholder="Product name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Slug</label>
          <Input
            value={localProduct.slug}
            onChange={(e) => setLocalProduct({ ...localProduct, slug: e.target.value })}
            placeholder="product-slug"
            required
            disabled={isEditing}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <Select
          value={localProduct.category_id}
          onValueChange={(value) => setLocalProduct({ ...localProduct, category_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
        <Textarea
          value={localProduct.short_description || ""}
          onChange={(e) => setLocalProduct({ ...localProduct, short_description: e.target.value })}
          placeholder="Brief product description"
          rows={2}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
        <Textarea
          value={localProduct.full_description || ""}
          onChange={(e) => setLocalProduct({ ...localProduct, full_description: e.target.value })}
          placeholder="Detailed product description"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Image</label>
          <div className="space-y-2">
            <Input
              value={localProduct.main_image_url || ""}
              onChange={(e) => setLocalProduct({ ...localProduct, main_image_url: e.target.value })}
              placeholder="Image URL or upload file"
            />
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={uploading.image}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading.image ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Datasheet</label>
          <div className="space-y-2">
            <Input
              value={localProduct.data_sheet_url || ""}
              onChange={(e) => setLocalProduct({ ...localProduct, data_sheet_url: e.target.value })}
              placeholder="Datasheet URL or upload file"
            />
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleDatasheetUpload}
                className="hidden"
                id="datasheet-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("datasheet-upload")?.click()}
                disabled={uploading.datasheet}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading.datasheet ? "Uploading..." : "Upload Datasheet"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
        {localProduct.feature_texts.map((feature: string, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              placeholder="Feature description"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeFeature(index)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addFeature}>
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
        <div className="space-y-2">
          {Object.entries(localProduct.specifications || {}).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 gap-2">
              <Input placeholder="Specification name" value={key} disabled />
              <Input
                placeholder="Specification value"
                value={String(value)}
                onChange={(e) => updateSpecification(key, e.target.value)}
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="New specification name"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  const input = e.target as HTMLInputElement
                  if (input.value) {
                    updateSpecification(input.value, "")
                    input.value = ""
                  }
                }
              }}
            />
            <div className="text-sm text-gray-500 flex items-center">Press Enter to add</div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={localProduct.featured}
            onChange={(e) => setLocalProduct({ ...localProduct, featured: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Featured Product
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <Select
            value={localProduct.status}
            onValueChange={(value: "active" | "inactive") => setLocalProduct({ ...localProduct, status: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="bg-[#003300] hover:bg-[#003300]/90 text-white">
        <Save className="w-4 h-4 mr-2" />
        {isEditing ? "Update Product" : "Add Product"}
      </Button>
    </form>
  )
}
