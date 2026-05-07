import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getGeneralSettings } from "@/app/admin/settings/actions" // Import the action

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ever Spark Technologies - Water Treatment Solutions",
  description:
    "Leading provider of electrochlorination, solar, and water disinfection solutions for communities worldwide.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Gracefully handle DB errors so a missing table never breaks the whole site
  const generalSettings = await getGeneralSettings().catch(() => null)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header generalSettings={generalSettings} /> {/* Pass settings to Header */}
        {children}
        <Footer generalSettings={generalSettings} /> {/* Pass settings to Footer */}
      </body>
    </html>
  )
}
