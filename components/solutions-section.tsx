import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getSolutions, type Solution } from "@/app/admin/content/actions"
import { Skeleton } from "@/components/ui/skeleton"

export async function SolutionsSection() {
  const solutions: Solution[] = await getSolutions()

  if (!solutions || solutions.length === 0) {
    return (
      <section className="py-16 bg-[#f6f4f3]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">Our Solutions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Innovative water treatment and disinfection solutions designed to meet the diverse needs of our clients
              worldwide.
            </p>
          </div>
          <p className="text-center text-gray-500">No solutions available at the moment. Please check back later.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-[#f6f4f3]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003300] mb-4">Our Solutions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Innovative water treatment and disinfection solutions designed to meet the diverse needs of our clients
            worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution) => (
            <Card key={solution.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="aspect-video overflow-hidden">
                <img
                  src={
                    solution.image_url ||
                    `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(solution.title) || "/placeholder.svg"}`
                  }
                  alt={solution.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="text-[#003300]">{solution.title}</CardTitle>
                {solution.description && (
                  <CardDescription className="line-clamp-3">{solution.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {solution.benefits && solution.benefits.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-[#003300] mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {solution.benefits.slice(0, 3).map(
                        (
                          benefit,
                          index, // Show first 3 benefits
                        ) => (
                          <li key={benefit.id || index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-2 h-2 bg-[#663300] rounded-full mr-2 flex-shrink-0"></span>
                            {benefit.benefit_text}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-[#003300] text-[#003300] hover:bg-[#003300] hover:text-white mt-auto bg-transparent"
                  asChild
                >
                  <Link href={`/solutions/${solution.id}`}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// It's good practice to provide a loading component or skeleton for Suspense boundaries
export function SolutionsSectionSkeleton() {
  return (
    <section className="py-16 bg-[#f6f4f3]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <ul className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </ul>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
