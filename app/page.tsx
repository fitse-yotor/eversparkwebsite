import { HeroSection } from "@/components/hero-section"
import { ProductsSection } from "@/components/products-section"
import { SolutionsSection } from "@/components/solutions-section"
import { ServicesSection } from "@/components/services-section"
import { PartnersSection } from "@/components/partners-section"
import { ProjectsSection } from "@/components/projects-section"

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ProductsSection />
      <SolutionsSection />
      <ServicesSection />
      <ProjectsSection />
      <PartnersSection />
    </main>
  )
}
