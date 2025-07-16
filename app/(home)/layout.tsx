"use client"

import { useAuthRedirect } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ReactNode } from "react"
import Sidebar from '@/components/common/Sidebar'
import Header from '@/components/common/Header'

export default function HomeLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthRedirect()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/sign-in")
      } else if (user.role === "admin") {
        router.push("/admin/course-management")
      }
    }
  }, [loading, user, router])

  if (loading || !user || user.role === "admin") return null

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="fixed top-0 left-0 h-screen w-60 z-40">
        <Sidebar />
      </div>

      <div className="ml-64 flex flex-col w-full overflow-hidden">
        <div className="fixed top-0 left-64 right-0 h-16 z-30 bg-transparent">
          <Header />
        </div>

        <main className="mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
