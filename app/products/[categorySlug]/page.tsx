// This is a new page to display all products for a specific category
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { getProductCategories, getProducts } from "@/app/admin/content/actions"
import { CheckCircle } from "lucide-react"

interface PageProps {
  params: {
    categorySlug: string
  }
}

async function CategoryProductsGrid({ categorySlug }: { categorySlug: string }) {
  const categories = await getProductCategories()
  const category = categories.find((c) => c.slug === categorySlug)

  if (!category) {
    notFound()
  }

  const products = await getProducts({ categorySlug: category.slug })

  if (!products || products.length === 0) {
    return <p className="text-center text-gray-600 py-12">No products found in the "{category.name}" category yet.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
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
                  {product.features.slice(0, 3).map(
                    (
                      feature,
                      index, // Show more features here
                    ) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-[#663300] flex-shrink-0" />
                        {feature.feature_text}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <span className="font-semibold text-sm text-[#003300]">{Object.keys(product.specifications)[0]}:</span>
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
  )
}

function CategoryProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map(
        (
          _,
          j, // Skeleton for 8 items
        ) => (
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
        ),
      )}
    </div>
  )
}

export default async function ProductCategoryPage({ params }: PageProps) {
  const categories = await getProductCategories()
  const category = categories.find((c) => c.slug === params.categorySlug)

  if (!category) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#f6f4f3]">
      <section className="py-12 bg-[#003300] text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
          {category.description && <p className="text-xl text-gray-200 max-w-3xl mx-auto">{category.description}</p>}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Suspense fallback={<CategoryProductsGridSkeleton />}>
            <CategoryProductsGrid categorySlug={params.categorySlug} />
          </Suspense>
        </div>
      </section>

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
