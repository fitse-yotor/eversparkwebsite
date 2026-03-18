import Link from "next/link"
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import type { GeneralSettingsData } from "@/app/admin/settings/actions" // Import the type

interface FooterProps {
  generalSettings: GeneralSettingsData | null
}

export function Footer({ generalSettings }: FooterProps) {
  const siteName = generalSettings?.siteName || "Ever Spark"
  const siteDescription =
    generalSettings?.siteDescription ||
    "Leading provider of electrochlorination, solar, and water disinfection solutions."
  const siteLogoUrl = generalSettings?.siteLogoUrl
  const contactEmail = generalSettings?.contactEmail || "info@everspark.com"
  const contactPhone = generalSettings?.contactPhone || "+1 (555) 123-4567"
  const address = generalSettings?.address || "123 Technology Street, Innovation City, Techland 12345"
  const socialMediaLinks = generalSettings?.socialMediaLinks || {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
  }

  return (
    <footer className="bg-[#003300] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              {siteLogoUrl ? (
                <img
                  src={siteLogoUrl || "/placeholder.svg"}
                  alt={siteName}
                  className="w-10 h-10 object-contain rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-[#003300] font-bold text-lg">ES</span>
                </div>
              )}
              <span className="text-xl font-bold">{siteName}</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm">{siteDescription}</p>
            <div className="flex space-x-3">
              <Link
                href={socialMediaLinks.facebook}
                target="_blank"
                aria-label="Facebook"
                className="text-gray-300 hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href={socialMediaLinks.twitter}
                target="_blank"
                aria-label="Twitter"
                className="text-gray-300 hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href={socialMediaLinks.linkedin}
                target="_blank"
                aria-label="LinkedIn"
                className="text-gray-300 hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-start-2">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-gray-300 hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-300 hover:text-white">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-gray-300 hover:text-white">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <address className="space-y-3 text-sm text-gray-300 not-italic">
              <p className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <span>{address}</span>
              </p>
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                <a href={`tel:${contactPhone}`} className="hover:text-white">
                  {contactPhone}
                </a>
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white">
                  {contactEmail}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-xs">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-xs">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
