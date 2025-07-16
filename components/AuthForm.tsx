"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Github, Mail } from "lucide-react"
import { handleFormSubmit, handleOAuthLogin } from "@/constants/auth"

export default function AuthForm() {
  const pathname = usePathname()
  const isSignup = pathname.includes("sign-up")
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setLoading(true)
    const success = await handleFormSubmit({
      isSignup,
      email,
      password,
      username,
      confirmPassword,
    })
    setLoading(false)
    if (success) router.push("/dashboard")
  }

  const onOAuthClick = async (provider: "google" | "github") => {
    setLoading(true)
    const success = await handleOAuthLogin(provider, isSignup)
    setLoading(false)
    if (success) router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Form */}
      <div className="space-y-4">
        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="username" style={{ color: "#cad7db" }}>Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 border-0 text-white placeholder:text-gray-400"
              style={{ backgroundColor: "#26262F" }}
              placeholder="Enter your username"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" style={{ color: "#cad7db" }}>Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 border-0 text-white placeholder:text-gray-400"
            style={{ backgroundColor: "#26262F" }}
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" style={{ color: "#cad7db" }}>Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-12 border-0 pr-10 placeholder:text-gray-500"
              style={{ backgroundColor: "#26262F", color: "#aab8bc" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="confirm-password" style={{ color: "#cad7db" }}>Re-type Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="h-12 border-0 pr-10 placeholder:text-gray-500"
                style={{ backgroundColor: "#26262F", color: "#aab8bc" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        disabled={loading}
        onClick={onSubmit}
        className="w-full h-12 font-medium bg-[#6969fc] hover:bg-[#6969fc]/90"
      >
        {loading ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
      </Button>

      {/* Switch + Social */}
      <div className="text-center space-y-4">
        <p className="text-sm" style={{ color: "#cad7db" }}>
          {isSignup ? (
            <>Have an account already? <Link href="/sign-in" className="underline hover:no-underline">Login</Link></>
          ) : (
            <>Don’t have an account? <Link href="/sign-up" className="underline hover:no-underline">Register</Link></>
          )}
        </p>

        <div className="flex items-center gap-2 justify-center">
          <span className="w-12 h-px bg-gray-600" />
          <span className="text-sm text-gray-400">OR</span>
          <span className="w-12 h-px bg-gray-600" />
        </div>

        <div className="flex flex-row gap-4">
          <Button
            disabled={loading}
            onClick={() => onOAuthClick("github")}
            className="flex-1 h-12 font-medium bg-[#6969fc] hover:bg-[#6969fc]/90"
          >
            <Github className="h-5 w-5 mr-2" />
            GitHub
          </Button>
          <Button
            disabled={loading}
            onClick={() => onOAuthClick("google")}
            className="flex-1 h-12 font-medium bg-[#6969fc] hover:bg-[#6969fc]/90"
          >
            <Mail className="h-5 w-5 mr-2" />
            Google
          </Button>
        </div>
      </div>
    </div>
  )
}
