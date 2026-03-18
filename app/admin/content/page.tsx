"use client"

import { useState, useEffect, useTransition } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Upload, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getHeroData,
  updateHeroData,
  getAboutUsData,
  updateAboutUsData,
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getServicesPageContent,
  updateServicesPageContent,
  getServiceItems,
  addServiceItem,
  updateServiceItem,
  deleteServiceItem,
  getPartnerItems,
  addPartnerItem,
  updatePartnerItem,
  deletePartnerItem,
  getContactInfoData,
  updateContactInfoData,
  getHeroImages,
  addHeroImage,
  updateHeroImage,
  deleteHeroImage,
  type HeroData,
  type AboutUsData,
  type TeamMember,
  type ServicePageData,
  type ServiceItem,
  type PartnerItem,
  type ContactInfoData,
  type HeroImage,
} from "./actions"

const initialHeroData: HeroData = {
  title: "",
  subtitle: "",
  description: "",
  mainImageUrl: "",
}

const initialAboutData: AboutUsData = {
  title: "",
  subtitle: "",
  storyTitle: "",
  storyContent: "",
  storyImageUrl: "",
}

const initialNewTeamMember: Omit<TeamMember, "id"> = {
  name: "",
  position: "",
  image: "",
  bio: "",
}

const initialServicesPageContent: ServicePageData = { subtitle: "" }

const initialNewServiceItem: Omit<ServiceItem, "id"> = {
  title: "",
  description: "",
  icon: "✨", // Default icon
}

const initialNewPartnerItem: Omit<PartnerItem, "id"> = {
  name: "",
  logoUrl: "",
  websiteUrl: "",
  description: "",
}

const initialContactInfo: ContactInfoData = {
  address: "",
  city: "",
  country: "",
  mainPhone: "",
  supportPhone: "",
  email: "",
  mapUrl: "",
  socialMedia: { facebook: "", twitter: "", linkedin: "" },
}

const initialHeroImage: Omit<HeroImage, "id"> = {
  imageUrl: "",
  title: "",
  subtitle: "",
  description: "",
  sortOrder: 0,
  isActive: true,
}

export default function ContentManagement() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)

  const [heroData, setHeroData] = useState<HeroData>(initialHeroData)
  const [aboutData, setAboutData] = useState<AboutUsData>(initialAboutData)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newTeamMember, setNewTeamMember] = useState<Omit<TeamMember, "id">>(initialNewTeamMember)

  const [servicesPageContent, setServicesPageContent] = useState<ServicePageData>(initialServicesPageContent)
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [newServiceItem, setNewServiceItem] = useState<Omit<ServiceItem, "id">>(initialNewServiceItem)

  const [partnerItems, setPartnerItems] = useState<PartnerItem[]>([])
  const [newPartnerItem, setNewPartnerItem] = useState<Omit<PartnerItem, "id">>(initialNewPartnerItem)

  const [contactInfo, setContactInfo] = useState<ContactInfoData>(initialContactInfo)

  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [editingHeroImage, setEditingHeroImage] = useState<HeroImage | null>(null)
  const [newHeroImage, setNewHeroImage] = useState<Omit<HeroImage, "id">>(initialHeroImage)

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true)
      console.log("page.tsx: Starting to load initial data for all sections...")
      try {
        const [
          heroRes,
          aboutRes,
          teamRes,
          servicesContentRes,
          servicesListRes,
          partnersListRes,
          contactRes,
          heroImagesData,
        ] = await Promise.all([
          getHeroData(),
          getAboutUsData(),
          getTeamMembers(),
          getServicesPageContent(),
          getServiceItems(),
          getPartnerItems(),
          getContactInfoData(),
          getHeroImages(),
        ])

        console.log("page.tsx: All data fetched from server actions.")

        if (heroRes) {
          setHeroData(heroRes)
          console.log("page.tsx: Hero data set.")
        } else {
          console.warn("page.tsx: No hero data received.")
        }
        if (aboutRes) {
          setAboutData(aboutRes)
          console.log("page.tsx: About Us data set.")
        } else {
          console.warn("page.tsx: No About Us data received.")
        }
        setTeamMembers(teamRes || [])
        console.log(`page.tsx: Team members set (${(teamRes || []).length} members).`)
        if (servicesContentRes) {
          setServicesPageContent(servicesContentRes)
          console.log("page.tsx: Services page content set.")
        } else {
          console.warn("page.tsx: No services page content received.")
        }
        setServiceItems(servicesListRes || [])
        console.log(`page.tsx: Service items set (${(servicesListRes || []).length} items).`)
        setPartnerItems(partnersListRes || [])
        console.log(`page.tsx: Partner items set (${(partnersListRes || []).length} items).`)
        if (contactRes) {
          setContactInfo(contactRes)
          console.log("page.tsx: Contact info set.")
        } else {
          console.warn(
            "page.tsx: No contact info received. This might be expected if the table is empty or an error occurred during fetch.",
          )
        }
        setHeroImages(heroImagesData || [])
        console.log(`page.tsx: Hero images set (${(heroImagesData || []).length} images).`)
      } catch (error) {
        console.error(
          "page.tsx: Failed to load initial data due to an error in Promise.all or subsequent processing",
          error,
        )
        toast({
          title: "Error Loading Page Data",
          description: "Could not load all content from the database. Please ensure tables exist and try refreshing.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        console.log("page.tsx: Finished loading initial data (isLoading set to false).")
      }
    }
    loadInitialData()
  }, [toast])

  const handleSaveHero = () => {
    startTransition(async () => {
      const result = await updateHeroData(heroData)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleSaveAboutUs = () => {
    startTransition(async () => {
      const result = await updateAboutUsData(aboutData)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleAddTeamMember = () => {
    if (!newTeamMember.name || !newTeamMember.position) {
      toast({
        title: "Missing Info",
        description: "Name and Position are required for a new team member.",
        variant: "destructive",
      })
      return
    }
    startTransition(async () => {
      const result = await addTeamMember(newTeamMember)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
      if (result.success && result.member) {
        setTeamMembers((prev) => [...prev, result.member as TeamMember])
        setNewTeamMember(initialNewTeamMember)
      }
    })
  }

  const handleEditTeamMember = (member: TeamMember) => {
    const updatedBio = prompt("Enter new bio for " + member.name, member.bio)
    if (updatedBio !== null && member.id) {
      startTransition(async () => {
        const result = await updateTeamMember(member.id!, { bio: updatedBio })
        toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        if (result.success) {
          setTeamMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, bio: updatedBio } : m)))
        }
      })
    }
  }

  const handleDeleteTeamMember = (memberId: string) => {
    if (!memberId) return
    if (confirm("Are you sure you want to remove this team member?")) {
      startTransition(async () => {
        const result = await deleteTeamMember(memberId)
        toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        if (result.success) {
          setTeamMembers((prev) => prev.filter((m) => m.id !== memberId))
        }
      })
    }
  }

  const handleSaveServicesPageContent = () => {
    startTransition(async () => {
      const result = await updateServicesPageContent(servicesPageContent)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleAddServiceItem = () => {
    if (!newServiceItem.title) {
      toast({ title: "Missing Info", description: "Title is required for a new service.", variant: "destructive" })
      return
    }
    startTransition(async () => {
      const result = await addServiceItem(newServiceItem)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
      if (result.success && result.item) {
        setServiceItems((prev) => [...prev, result.item as ServiceItem])
        setNewServiceItem(initialNewServiceItem)
      }
    })
  }

  const handleEditServiceItem = (item: ServiceItem) => {
    const newTitle = prompt("Enter new title for service:", item.title)
    if (newTitle !== null && item.id) {
      startTransition(async () => {
        const result = await updateServiceItem(item.id!, { title: newTitle })
        toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        if (result.success) {
          setServiceItems((prev) => prev.map((s) => (s.id === item.id ? { ...s, title: newTitle } : s)))
        }
      })
    }
  }

  const handleDeleteServiceItem = (itemId: string) => {
    if (!itemId) return
    if (confirm("Are you sure you want to remove this service item?")) {
      startTransition(async () => {
        const result = await deleteServiceItem(itemId)
        toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        if (result.success) {
          setServiceItems((prev) => prev.filter((item) => item.id !== itemId))
        }
      })
    }
  }

  const handleAddPartnerItem = () => {
    if (!newPartnerItem.name) {
      toast({ title: "Missing Info", description: "Name is required for a new partner.", variant: "destructive" })
      return
    }
    startTransition(async () => {
      const result = await addPartnerItem(newPartnerItem)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
      if (result.success && result.item) {
        setPartnerItems((prev) => [...prev, result.item as PartnerItem])
        setNewPartnerItem(initialNewPartnerItem)
      }
    })
  }

  const handleEditPartnerItem = (item: PartnerItem) => {
    const newName = prompt("Enter new name for partner:", item.name)
    if (newName !== null && item.id) {
      startTransition(async () => {
        const result = await updatePartnerItem(item.id!, { name: newName })
        toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        if (result.success) {
          setPartnerItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, name: newName } : p)))
        }
      })
    }
  }

  const handleDeletePartnerItem = (itemId: string) => {
    if (!itemId) return
    if (confirm("Are you sure you want to remove this partner?")) {
      startTransition(async () => {
        const result = await deletePartnerItem(itemId)
        toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        if (result.success) {
          setPartnerItems((prev) => prev.filter((item) => item.id !== itemId))
        }
      })
    }
  }

  const handleSaveContactInfo = () => {
    startTransition(async () => {
      const result = await updateContactInfoData(contactInfo)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleAddHeroImage = async () => {
    const result = await addHeroImage(newHeroImage)
    if (result.success) {
      const updatedImages = await getHeroImages()
      setHeroImages(updatedImages)
      setNewHeroImage(initialHeroImage)
    }
  }

  const handleUpdateHeroImage = async () => {
    if (!editingHeroImage?.id) return
    const { id, ...imageData } = editingHeroImage
    const result = await updateHeroImage(id, imageData)
    if (result.success) {
      const updatedImages = await getHeroImages()
      setHeroImages(updatedImages)
      setEditingHeroImage(null)
    }
  }

  const handleDeleteHeroImage = async (id: string) => {
    const result = await deleteHeroImage(id)
    if (result.success) {
      const updatedImages = await getHeroImages()
      setHeroImages(updatedImages)
    }
  }

  const handleImageUpload = async (file: File, type: "new" | "edit") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "hero")

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (data.url) {
        if (type === "new") {
          setNewHeroImage({ ...newHeroImage, imageUrl: data.url })
        } else if (editingHeroImage) {
          setEditingHeroImage({ ...editingHeroImage, imageUrl: data.url })
        }
      }
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#f6f4f3]">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center">Loading content data...</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4f3]">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003300]">Content Management</h1>
          <p className="text-gray-600">Manage your website content and information</p>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="hero">Hero Slider</TabsTrigger>
            <TabsTrigger value="about">About Us</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          {/* Hero Section Tab */}
          <TabsContent value="hero">
            <div className="space-y-6">
              {/* Add New Hero Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Add New Hero Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <Input
                        value={newHeroImage.title}
                        onChange={(e) => setNewHeroImage({ ...newHeroImage, title: e.target.value })}
                        placeholder="Hero image title"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                      <Input
                        value={newHeroImage.subtitle}
                        onChange={(e) => setNewHeroImage({ ...newHeroImage, subtitle: e.target.value })}
                        placeholder="Hero image subtitle"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea
                      value={newHeroImage.description}
                      onChange={(e) => setNewHeroImage({ ...newHeroImage, description: e.target.value })}
                      placeholder="Hero image description"
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <Input
                          value={newHeroImage.imageUrl}
                          onChange={(e) => setNewHeroImage({ ...newHeroImage, imageUrl: e.target.value })}
                          placeholder="Image URL"
                          disabled={isPending}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "new")}
                          className="hidden"
                          id="new-hero-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("new-hero-upload")?.click()}
                          disabled={isPending}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                      <Input
                        type="number"
                        value={newHeroImage.sortOrder}
                        onChange={(e) =>
                          setNewHeroImage({ ...newHeroImage, sortOrder: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Sort order"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddHeroImage}
                    className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                    disabled={isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hero Image
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Hero Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003300]">Manage Hero Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {heroImages.map((image) => (
                      <div key={image.id} className="border rounded-lg p-4">
                        {editingHeroImage?.id === image.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={editingHeroImage.title}
                                onChange={(e) => setEditingHeroImage({ ...editingHeroImage, title: e.target.value })}
                                placeholder="Title"
                                disabled={isPending}
                              />
                              <Input
                                value={editingHeroImage.subtitle}
                                onChange={(e) => setEditingHeroImage({ ...editingHeroImage, subtitle: e.target.value })}
                                placeholder="Subtitle"
                                disabled={isPending}
                              />
                            </div>
                            <Textarea
                              value={editingHeroImage.description}
                              onChange={(e) =>
                                setEditingHeroImage({ ...editingHeroImage, description: e.target.value })
                              }
                              placeholder="Description"
                              disabled={isPending}
                            />
                            <div className="flex gap-2">
                              <Input
                                value={editingHeroImage.imageUrl}
                                onChange={(e) => setEditingHeroImage({ ...editingHeroImage, imageUrl: e.target.value })}
                                placeholder="Image URL"
                                disabled={isPending}
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "edit")}
                                className="hidden"
                                id={`edit-hero-upload-${image.id}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById(`edit-hero-upload-${image.id}`)?.click()}
                                disabled={isPending}
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleUpdateHeroImage} size="sm" disabled={isPending}>
                                Save
                              </Button>
                              <Button
                                onClick={() => setEditingHeroImage(null)}
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <img
                                src={image.imageUrl || "/placeholder.svg"}
                                alt={image.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <h3 className="font-semibold">{image.title}</h3>
                                <p className="text-sm text-gray-600">{image.subtitle}</p>
                                <Badge variant="secondary">Order: {image.sortOrder}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setEditingHeroImage(image)}
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => image.id && handleDeleteHeroImage(image.id)}
                                variant="destructive"
                                size="sm"
                                disabled={isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* About Us Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">About Us Section Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold text-[#003300] mb-2">Page Details</h3>
                  <div>
                    <label htmlFor="aboutPageTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Page Title
                    </label>
                    <Input
                      id="aboutPageTitle"
                      value={aboutData.title}
                      onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                      placeholder="About us page title"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="aboutSubtitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <Input
                      id="aboutSubtitle"
                      value={aboutData.subtitle}
                      onChange={(e) => setAboutData({ ...aboutData, subtitle: e.target.value })}
                      placeholder="About us subtitle"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="aboutStoryTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Story Section Title
                    </label>
                    <Input
                      id="aboutStoryTitle"
                      value={aboutData.storyTitle}
                      onChange={(e) => setAboutData({ ...aboutData, storyTitle: e.target.value })}
                      placeholder="Story section title"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="aboutStoryContent" className="block text-sm font-medium text-gray-700 mb-1">
                      Story Content
                    </label>
                    <Textarea
                      id="aboutStoryContent"
                      rows={6}
                      value={aboutData.storyContent}
                      onChange={(e) => setAboutData({ ...aboutData, storyContent: e.target.value })}
                      placeholder="Company story content"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="aboutStoryImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Story Image URL
                    </label>
                    <Input
                      id="aboutStoryImageUrl"
                      value={aboutData.storyImageUrl}
                      onChange={(e) => setAboutData({ ...aboutData, storyImageUrl: e.target.value })}
                      placeholder="Story image URL"
                      disabled={isPending}
                    />
                  </div>
                  <Button
                    onClick={handleSaveAboutUs}
                    disabled={isPending}
                    className="bg-[#003300] hover:bg-[#003300]/90 text-white mt-2"
                  >
                    {isPending ? "Saving..." : "Save Page Details"}
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#003300] mb-4">Team Members</h3>
                  <div className="p-4 border rounded-md mb-6 space-y-3 bg-slate-50">
                    <h4 className="text-md font-semibold text-[#003300]">Add New Team Member</h4>
                    <Input
                      placeholder="Name"
                      value={newTeamMember.name}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                      disabled={isPending}
                    />
                    <Input
                      placeholder="Position"
                      value={newTeamMember.position}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, position: e.target.value })}
                      disabled={isPending}
                    />
                    <Input
                      placeholder="Image URL"
                      value={newTeamMember.image}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, image: e.target.value })}
                      disabled={isPending}
                    />
                    <Textarea
                      placeholder="Bio"
                      value={newTeamMember.bio}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, bio: e.target.value })}
                      disabled={isPending}
                    />
                    <Button onClick={handleAddTeamMember} disabled={isPending} variant="outline">
                      {isPending ? "Adding..." : "Add Team Member"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-white rounded-lg border"
                      >
                        <img
                          src={member.image || "/placeholder.svg?height=80&width=80&query=profile"}
                          alt={member.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.position}</p>
                          <p className="text-xs text-gray-500 mt-1">{member.bio}</p>
                        </div>
                        <div className="flex space-x-2 self-start sm:self-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTeamMember(member)}
                            disabled={isPending}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            outline
                            size="sm"
                            onClick={() => handleDeleteTeamMember(member.id!)}
                            disabled={isPending}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {teamMembers.length === 0 && <p className="text-gray-500">No team members yet.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">Services Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-md space-y-3">
                  <h3 className="text-lg font-semibold text-[#003300] mb-2">Services Page Details</h3>
                  <div>
                    <label htmlFor="servicesPageSubtitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Section Subtitle
                    </label>
                    <Input
                      id="servicesPageSubtitle"
                      value={servicesPageContent.subtitle}
                      onChange={(e) => setServicesPageContent({ ...servicesPageContent, subtitle: e.target.value })}
                      placeholder="Subtitle for the services section"
                      disabled={isPending}
                    />
                  </div>
                  <Button
                    onClick={handleSaveServicesPageContent}
                    disabled={isPending}
                    className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                  >
                    {isPending ? "Saving..." : "Save Page Details"}
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#003300] mb-4">Service Items</h3>
                  <div className="p-4 border rounded-md mb-6 space-y-3 bg-slate-50">
                    <h4 className="text-md font-semibold text-[#003300]">Add New Service Item</h4>
                    <Input
                      placeholder="Service Title"
                      value={newServiceItem.title}
                      onChange={(e) => setNewServiceItem({ ...newServiceItem, title: e.target.value })}
                      disabled={isPending}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newServiceItem.description}
                      onChange={(e) => setNewServiceItem({ ...newServiceItem, description: e.target.value })}
                      disabled={isPending}
                    />
                    <Input
                      placeholder="Icon (e.g., emoji ✨ or FontAwesome class)"
                      value={newServiceItem.icon}
                      onChange={(e) => setNewServiceItem({ ...newServiceItem, icon: e.target.value })}
                      disabled={isPending}
                    />
                    <Button onClick={handleAddServiceItem} disabled={isPending} variant="outline">
                      {isPending ? "Adding..." : "Add Service Item"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {serviceItems.map((service) => (
                      <div key={service.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border">
                        <div className="text-3xl pt-1">{service.icon || "✨"}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{service.title}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditServiceItem(service)}
                            disabled={isPending}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            outline
                            size="sm"
                            onClick={() => handleDeleteServiceItem(service.id!)}
                            disabled={isPending}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {serviceItems.length === 0 && <p className="text-gray-500">No service items yet.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">Partners Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#003300] mb-4">Partner Items</h3>
                  <div className="p-4 border rounded-md mb-6 space-y-3 bg-slate-50">
                    <h4 className="text-md font-semibold text-[#003300]">Add New Partner</h4>
                    <Input
                      placeholder="Partner Name"
                      value={newPartnerItem.name}
                      onChange={(e) => setNewPartnerItem({ ...newPartnerItem, name: e.target.value })}
                      disabled={isPending}
                    />
                    <Input
                      placeholder="Logo URL"
                      value={newPartnerItem.logoUrl}
                      onChange={(e) => setNewPartnerItem({ ...newPartnerItem, logoUrl: e.target.value })}
                      disabled={isPending}
                    />
                    <Input
                      placeholder="Website URL"
                      value={newPartnerItem.websiteUrl}
                      onChange={(e) => setNewPartnerItem({ ...newPartnerItem, websiteUrl: e.target.value })}
                      disabled={isPending}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newPartnerItem.description}
                      onChange={(e) => setNewPartnerItem({ ...newPartnerItem, description: e.target.value })}
                      disabled={isPending}
                    />
                    <Button onClick={handleAddPartnerItem} disabled={isPending} variant="outline">
                      {isPending ? "Adding..." : "Add Partner"}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {partnerItems.map((partner) => (
                      <div key={partner.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border">
                        <img
                          src={partner.logoUrl || "/placeholder.svg?height=40&width=80&query=logo"}
                          alt={partner.name}
                          className="w-20 h-10 object-contain"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{partner.name}</h4>
                          <p className="text-sm text-gray-600">{partner.description}</p>
                          {partner.websiteUrl && (
                            <a
                              href={partner.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Visit Website
                            </a>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPartnerItem(partner)}
                            disabled={isPending}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            outline
                            size="sm"
                            onClick={() => handleDeletePartnerItem(partner.id!)}
                            disabled={isPending}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {partnerItems.length === 0 && <p className="text-gray-500">No partners yet.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Info Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#003300]">Contact Information Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Input
                      id="contactAddress"
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      placeholder="Street address"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactCity" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <Input
                      id="contactCity"
                      value={contactInfo.city}
                      onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                      placeholder="City"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactCountry" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <Input
                      id="contactCountry"
                      value={contactInfo.country}
                      onChange={(e) => setContactInfo({ ...contactInfo, country: e.target.value })}
                      placeholder="Country"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactMainPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Main Phone
                    </label>
                    <Input
                      id="contactMainPhone"
                      value={contactInfo.mainPhone}
                      onChange={(e) => setContactInfo({ ...contactInfo, mainPhone: e.target.value })}
                      placeholder="Main phone number"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactSupportPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Support Phone
                    </label>
                    <Input
                      id="contactSupportPhone"
                      value={contactInfo.supportPhone}
                      onChange={(e) => setContactInfo({ ...contactInfo, supportPhone: e.target.value })}
                      placeholder="Support phone number"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      placeholder="Email address"
                      disabled={isPending}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contactMapUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Map URL
                  </label>
                  <Input
                    id="contactMapUrl"
                    value={contactInfo.mapUrl}
                    onChange={(e) => setContactInfo({ ...contactInfo, mapUrl: e.target.value })}
                    placeholder="Google Maps URL"
                    disabled={isPending}
                  />
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-[#003300] mb-2">Social Media Links</h3>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="socialFacebook" className="block text-xs font-medium text-gray-600">
                        Facebook URL
                      </label>
                      <Input
                        id="socialFacebook"
                        value={contactInfo.socialMedia.facebook}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            socialMedia: { ...contactInfo.socialMedia, facebook: e.target.value },
                          })
                        }
                        placeholder="Facebook URL"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <label htmlFor="socialTwitter" className="block text-xs font-medium text-gray-600">
                        Twitter URL
                      </label>
                      <Input
                        id="socialTwitter"
                        value={contactInfo.socialMedia.twitter}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            socialMedia: { ...contactInfo.socialMedia, twitter: e.target.value },
                          })
                        }
                        placeholder="Twitter URL"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <label htmlFor="socialLinkedIn" className="block text-xs font-medium text-gray-600">
                        LinkedIn URL
                      </label>
                      <Input
                        id="socialLinkedIn"
                        value={contactInfo.socialMedia.linkedin}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            socialMedia: { ...contactInfo.socialMedia, linkedin: e.target.value },
                          })
                        }
                        placeholder="LinkedIn URL"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSaveContactInfo}
                  disabled={isPending}
                  className="bg-[#003300] hover:bg-[#003300]/90 text-white"
                >
                  {isPending ? "Saving..." : "Save Contact Information"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
