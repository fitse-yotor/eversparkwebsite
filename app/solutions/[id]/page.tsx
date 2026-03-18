import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSolutionById, type Solution } from "@/app/admin/content/actions" // Updated import
import { CheckCircle } from "lucide-react"

interface PageProps {
  params: {
    id: string
  }
}

export default async function SolutionDetailPage({ params }: PageProps) {
  const solution: Solution | null = await getSolutionById(params.id)

  if (!solution) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-[#003300] text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              solution.image_url || `/placeholder.svg?height=600&width=1200&query=${encodeURIComponent(solution.title)}`
            }
            alt={solution.title}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{solution.title}</h1>
            {/* Subtitle can be part of description or a new field if added to DB */}
            {/* <p className="text-xl md:text-2xl text-gray-200 mb-8">{solution.subtitle}</p> */}
            <Button size="lg" className="bg-[#663300] hover:bg-[#663300]/90 text-white px-8" asChild>
              <Link href="/contact">Request Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Solution Description & Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-1 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[#003300] mb-6">Solution Overview</h2>
              {solution.description ? (
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{solution.description}</p>
              ) : (
                <p className="text-lg text-gray-500">Detailed description not available.</p>
              )}
            </div>

            {solution.benefits && solution.benefits.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-[#003300] mb-6 pt-8">Key Benefits</h2>
                <ul className="space-y-4">
                  {solution.benefits.map((benefit, index) => (
                    <li key={benefit.id || index} className="flex items-start text-lg text-gray-700">
                      <CheckCircle className="w-6 h-6 text-[#663300] mr-3 mt-1 flex-shrink-0" />
                      <span>{benefit.benefit_text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Placeholder for other sections if schema is extended in future */}
      {/* 
      <section className="py-16 bg-[#f6f4f3]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#003300] mb-12 text-center">More Details (Future Section)</h2>
          <p className="text-center text-gray-600">
            Additional details like key features, case studies, or product specifications would appear here 
            if the database schema is extended to support them.
          </p>
        </div>
      </section>
      */}

      {/* CTA Section */}
      <section className="py-16 bg-[#003300] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-200 mb-8">
              Contact our experts to discuss how our {solution.title.toLowerCase()} solutions can meet your specific
              needs.
            </p>
            <div className="space-x-0 sm:space-x-4 space-y-4 sm:space-y-0 flex flex-col sm:flex-row justify-center items-center">
              <Button size="lg" className="bg-[#663300] hover:bg-[#663300]/90 text-white px-8 w-full sm:w-auto" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#003300] px-8 w-full sm:w-auto"
                asChild
              >
                <Link href="/projects">View Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
