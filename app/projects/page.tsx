import { getProjects, getProjectCategories, type Project, type ProjectCategory } from "@/app/projects/actions"
import { ProjectListClient } from "@/components/project-list-client"

export default async function ProjectsPage() {
  const initialProjects: Project[] = await getProjects()
  const projectCategories: ProjectCategory[] = await getProjectCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-[#003300]">Our Projects</h1>
      <ProjectListClient initialProjects={initialProjects} projectCategories={projectCategories} />
    </div>
  )
}
