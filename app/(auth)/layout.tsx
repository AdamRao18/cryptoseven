"use client"

import { useAuthRedirect } from "@/lib/useAuth"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { ReactNode } from "react"
import { Toaster } from "sonner"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthRedirect()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }}, [user, loading, router])

  // Determine current auth page type
  const isSignup = pathname.includes("sign-up")
  const title = isSignup ? "Create Your CryptoSeven Account" : "Welcome Back!"
  const description = isSignup
    ? "Please complete all fields to gain access to CryptoSeven."
    : "Enter your credentials to access CryptoSeven. We're happy to see you again."

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Auth Form Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
        <Toaster richColors />
      </div>

      {/* Branding / Description Section */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center">
        <Image
          src="/icons/logo.png"
          alt="CryptoSeven Logo"
          width={150}
          height={150}
        />
        <h1 className="text-3xl font-bold mb-4 text-white">{title}</h1>
        <p className="text-lg max-w-md leading-relaxed text-slate-300">
          {description}
        </p>
      </div>
    </div>
  )
}
