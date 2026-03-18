"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { getProducts, getProductCategories, type Product, type ProductCategory } from "@/app/admin/content/actions"

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts({ featured: true }), // Only show featured products on homepage
          getProductCategories(),
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((product) => product.category_slug === selectedCategory)

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">Our Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive range of water treatment solutions designed to meet your specific needs
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-[#003300] hover:bg-[#003300]/90" : ""}
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.slug)}
                className={selectedCategory === category.slug ? "bg-[#003300] hover:bg-[#003300]/90" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No products found for the selected category.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <Link href={`/products/${product.category_slug}/${product.slug}`}>
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={
                        product.main_image_url ||
                        `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-[#003300] text-white text-xs px-2 py-1">{product.category_name}</Badge>
                    {product.featured && <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">Featured</Badge>}
                  </div>
                  <CardTitle className="text-xl font-bold text-[#003300]">
                    <Link href={`/products/${product.category_slug}/${product.slug}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">{product.short_description}</p>
                  {product.features && product.features.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <li key={index} className="text-xs text-gray-500 flex items-center">
                          <span className="w-1.5 h-1.5 bg-[#663300] rounded-full mr-2"></span>
                          {feature.feature_text}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button className="w-full bg-[#003300] hover:bg-[#003300]/90 text-white" asChild>
                    <Link href={`/products/${product.category_slug}/${product.slug}`}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <Button className="bg-[#663300] hover:bg-[#663300]/90 text-white px-8 py-3" asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
