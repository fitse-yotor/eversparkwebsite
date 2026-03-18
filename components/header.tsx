"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X, ChevronDown, Facebook, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { GeneralSettingsData } from "@/app/admin/settings/actions" // Import the type

interface HeaderProps {
  generalSettings: GeneralSettingsData | null
}

export function Header({ generalSettings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const siteName = generalSettings?.siteName || "Ever Spark Technologies"
  const siteLogoUrl = generalSettings?.siteLogoUrl

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {siteLogoUrl ? (
              <img src={siteLogoUrl || "/placeholder.svg"} alt={siteName} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-[#003300] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ES</span>
              </div>
            )}
            <span className="text-xl font-bold text-[#003300]">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/" className="text-gray-700 hover:text-[#003300] transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-[#003300] transition-colors">
              About Us
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-[#003300] transition-colors outline-none">
                Products <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/products#electrochlorinators">Electrochlorinators</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products#solar">Solar Solutions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products#water-disinfection">Water Disinfection</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/#services" className="text-gray-700 hover:text-[#003300] transition-colors">
              Services
            </Link>
            <Link href="/projects" className="text-gray-700 hover:text-[#003300] transition-colors">
              Projects
            </Link>
            <Link href="/blogs" className="text-gray-700 hover:text-[#003300] transition-colors">
              Blogs
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#003300] transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Search and Social */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input type="search" placeholder="Search..." className="pl-10 w-48 xl:w-64" />
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={generalSettings?.socialMediaLinks?.facebook || "https://facebook.com"}
                  target="_blank"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-gray-600 hover:text-[#003300]" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={generalSettings?.socialMediaLinks?.twitter || "https://twitter.com"}
                  target="_blank"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-gray-600 hover:text-[#003300]" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={generalSettings?.socialMediaLinks?.linkedin || "https://linkedin.com"}
                  target="_blank"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-gray-600 hover:text-[#003300]" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4 mb-4">
              <Link href="/" className="text-gray-700 hover:text-[#003300]" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-[#003300]" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-[#003300] transition-colors outline-none w-full text-left">
                  Products <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem asChild>
                    <Link href="/products#electrochlorinators" onClick={() => setIsMenuOpen(false)}>
                      Electrochlorinators
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/products#solar" onClick={() => setIsMenuOpen(false)}>
                      Solar Solutions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/products#water-disinfection" onClick={() => setIsMenuOpen(false)}>
                      Water Disinfection
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="/#services"
                className="text-gray-700 hover:text-[#003300]"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/projects"
                className="text-gray-700 hover:text-[#003300]"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
              <Link href="/blogs" className="text-gray-700 hover:text-[#003300]" onClick={() => setIsMenuOpen(false)}>
                Blogs
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-[#003300]" onClick={() => setIsMenuOpen(false)}>
                Contact Us
              </Link>
            </nav>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input type="search" placeholder="Search..." className="pl-10 w-full" />
            </div>
            <div className="flex justify-center space-x-2 mb-4">
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={generalSettings?.socialMediaLinks?.facebook || "https://facebook.com"}
                  target="_blank"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6 text-gray-600 hover:text-[#003300]" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={generalSettings?.socialMediaLinks?.twitter || "https://twitter.com"}
                  target="_blank"
                  aria-label="Twitter"
                >
                  <Twitter className="h-6 w-6 text-gray-600 hover:text-[#003300]" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={generalSettings?.socialMediaLinks?.linkedin || "https://linkedin.com"}
                  target="_blank"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6 text-gray-600 hover:text-[#003300]" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
