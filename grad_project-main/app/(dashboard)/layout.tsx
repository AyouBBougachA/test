"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 lg:pt-4">
          {children}
        </main>
      </div>
    </div>
  )
}
