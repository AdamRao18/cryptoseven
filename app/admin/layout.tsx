"use client"

import { useAuthRedirect } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ReactNode } from "react"
import { AdminSidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthRedirect()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/sign-in")
      } else if (user.role !== "admin") {
        router.push("/dashboard")
      }
    }
  }, [loading, user, router])

  if (loading || !user || user.role !== "admin") return null

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white text-black">
      <div className="fixed top-0 left-0 h-screen w-60 z-40">
        <AdminSidebar />
      </div>

      <div className="ml-64 flex flex-col w-full overflow-hidden">
        <main className="mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
