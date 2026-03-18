import { SolutionsSection, SolutionsSectionSkeleton } from "@/components/solutions-section" // Updated import
import { Suspense } from "react"

export default function SolutionsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-[#003300] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Solutions</h1>
            <p className="text-xl text-gray-200">
              Comprehensive water treatment and disinfection solutions for every application
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Content */}
      <Suspense fallback={<SolutionsSectionSkeleton />}>
        <SolutionsSection />
      </Suspense>
    </main>
  )
}
