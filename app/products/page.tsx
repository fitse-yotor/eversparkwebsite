import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { getProductCategories, getProducts, type ProductCategory, type Product } from "@/app/admin/content/actions"
import { CheckCircle } from "lucide-react"

interface CategoryWithProducts extends ProductCategory {
  products: Product[]
}

async function ProductCategoriesList() {
  const categories = await getProductCategories()
  if (!categories || categories.length === 0) {
    return <p className="text-center text-gray-600">No product categories found.</p>
  }

  const categoriesWithProducts: CategoryWithProducts[] = await Promise.all(
    categories.map(async (category) => {
      const products = await getProducts({ categorySlug: category.slug })
      return { ...category, products: products.slice(0, 3) } // Show up to 3 products per category on this page
    }),
  )

  return (
    <>
      {categoriesWithProducts.map((category, categoryIndex) => (
        <section
          key={category.id}
          id={category.slug}
          className={`py-16 ${categoryIndex % 2 === 0 ? "bg-white" : "bg-[#f6f4f3]"}`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">{category.name}</h2>
              {category.description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">{category.description}</p>
              )}
            </div>

            {category.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={
                          product.main_image_url ||
                          `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(product.name)}`
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-[#003300]">{product.name}</CardTitle>
                      {product.short_description && <CardDescription>{product.short_description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {product.features && product.features.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-[#003300] mb-1">Key Features:</h4>
                          <ul className="space-y-1">
                            {product.features.slice(0, 2).map((feature, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-2 text-[#663300] flex-shrink-0" />
                                {feature.feature_text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div>
                          <span className="font-semibold text-sm text-[#003300]">
                            {Object.keys(product.specifications)[0]}:
                          </span>
                          <span className="text-xs text-gray-600 ml-1">
                            {(product.specifications as any)[Object.keys(product.specifications)[0]]}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-[#003300] text-[#003300] hover:bg-[#003300] hover:text-white"
                        asChild
                      >
                        <Link href={`/products/${category.slug}/${product.slug}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No products found in this category yet.</p>
            )}
            {/* Link to view all products in this category if there are more than 3 */}
            {(async () => {
              const allProductsInCategory = await getProducts({ categorySlug: category.slug })
              if (allProductsInCategory.length > 3) {
                return (
                  <div className="text-center mt-12">
                    <Button asChild className="bg-[#003300] hover:bg-[#003300]/90 text-white">
                      <Link href={`/products/${category.slug}`}>View All {category.name}</Link>
                    </Button>
                  </div>
                )
              }
              return null
            })()}
          </div>
        </section>
      ))}
    </>
  )
}

function ProductCategoriesListSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <section key={i} className={`py-16 ${i % 2 === 0 ? "bg-white" : "bg-[#f6f4f3]"}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((j) => (
                <Card key={j} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-[#003300] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Products</h1>
            <p className="text-xl text-gray-200">
              Comprehensive range of water treatment and disinfection products for every application
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<ProductCategoriesListSkeleton />}>
        <ProductCategoriesList />
      </Suspense>

      {/* CTA Section */}
      <section className="py-16 bg-[#003300] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Need Help Choosing the Right Product?</h2>
            <p className="text-xl text-gray-200 mb-8">
              Our experts are here to help you find the perfect water treatment solution for your specific needs.
            </p>
            <div className="space-x-4">
              <Button size="lg" className="bg-[#663300] hover:bg-[#663300]/90 text-white px-8" asChild>
                <Link href="/contact">Contact Our Experts</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#003300] px-8"
                asChild
              >
                <Link href="/projects">View Case Studies</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
