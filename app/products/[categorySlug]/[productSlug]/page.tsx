import { notFound } from "next/navigation"
import { getProductBySlug } from "@/app/admin/content/actions"
import { ProductInquiryForm } from "@/components/product-inquiry-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText } from "lucide-react"

interface ProductDetailPageProps {
  params: {
    categorySlug: string
    productSlug: string
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductBySlug(params.productSlug)

  if (!product || product.category_slug !== params.categorySlug) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Product Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#003300]">{product.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{product.short_description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  Category: {product.category_name}
                </Badge>
                {product.featured && <Badge className="bg-yellow-500 text-white">Featured</Badge>}
                <Badge className={product.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                  {product.status === "active" ? "Available" : "Discontinued"}
                </Badge>
              </div>
            </div>
            {product.data_sheet_url && (
              <a
                href={product.data_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#003300] hover:bg-[#003300]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003300]"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download Datasheet
              </a>
            )}
          </div>

          <Separator />

          {/* Product Image */}
          <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.main_image_url || "/placeholder.svg?height=600&width=800"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#003300]">Product Overview</h2>
            <p className="text-gray-700 leading-relaxed">{product.full_description}</p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#003300]">Key Features</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <span className="w-2 h-2 bg-[#663300] rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>{feature.feature_text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#003300]">Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <Card key={key} className="p-4">
                    <CardTitle className="text-md font-semibold text-[#003300] mb-1">{key}</CardTitle>
                    <CardContent className="p-0 text-gray-700">{String(value)}</CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Related Products Section - Removed as per user request */}
          {/*
          {product.related_products && product.related_products.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#003300]">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.related_products.map((related) => (
                  <Link
                    key={related.id}
                    href={`/products/${related.category_slug}/${related.id}`}
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={related.image_url || "/placeholder.svg?height=300&width=400"}
                          alt={related.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg text-[#003300] group-hover:text-[#003300]/90">
                          {related.name}
                        </CardTitle>
                        {related.category_name && (
                          <p className="text-sm text-gray-500">{related.category_name}</p>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
          */}
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-[#003300]">Inquire About This Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductInquiryForm productName={product.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
