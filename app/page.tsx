'use client';

import { useEffect } from "react";
import { useAuthRedirect } from "@/lib/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Linkedin, Mail, Clock, Code, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import Header from "@/components/Rootheader";
import { ReactNode } from "react"

export default function landingPage({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthRedirect()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect authenticated users away from public auth routes
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin/course-management");
      } else {
        router.push("/dashboard");
      }
    }}, [user, loading, router])

    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div>
          <Header />
          <div>
          {/* Hero Section */}
          <section className="py-33 px-4 lg:px-6">
            <div className="container mx-auto text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Master the Art of Cybersecurity Through
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {" "}
                    Interactive Learning
                  </span>
                </h1>

                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join CryptoSeven and learn cybersecurity through Expert-Guided Lesson, Quizzes, and CTFs.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button size="lg" className="font-medium bg-[#6969fc] hover:bg-[#6969fc]/90">
                    <Link href='/sign-up'>Let's Learn Together!</Link>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="text-center max-w-2xl mx-auto">
                  <div className="text-lg text-slate-300 mb-6">In Collaboration With:</div>
                    <div className="grid md:grid-cols-3 gap-40">
                      <img src="/Images/UKM.png" alt="UKM Logo" className="w-50 h-auto" />
                      <img src="/Images/CyberHack.png" alt="CyberHack" className="w-50 h-auto" />
                      <img src="/Images/MyOPECS.png" alt="MyOPECS" className="w-50 h-auto" />
                    </div>   
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-5 mt-15 px-4 lg:px-6 bg-slate-800/30">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">Comprehensive Features</h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  CryptoSeven is designed effectively to help users prepare for Capture The Flag (CTF) competitions through structured learning and practical challenges.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature Card 1 */}
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                    <Clock className="h-8 w-8 text-red-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Flexible</CardTitle>
                  <CardDescription className="text-slate-300">
                    Learn at your own pace with 24/7 access to all course materials.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                        Self-paced learning modules
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                        Anytime, anywhere access
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                        Progress tracking system
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 2*/}
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <Code className="h-8 w-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Hands-on</CardTitle>
                  <CardDescription className="text-slate-300">
                    Get hands-on experience with our quizzes and public or private CTFs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                      Interactive quizzes
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                      Public and private CTF challenges
                    </li>
                  </ul>
                </CardContent>
              </Card>


              {/* Feature Card 3 - Access Control */}
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                    <Users className="h-8 w-8 text-green-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Compete & Connect</CardTitle>
                  <CardDescription className="text-slate-300">
                    Test your skills in competitive Capture-The-Flag events and connect with like-minded individuals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      Participate in timed CTF competitions
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      Join team-based or solo challenges
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      Ask other user in community section
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-15 py-5 w-full text-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="w-full max-w-sm mx-auto md:mx-0 relative">
                <div className="absolute top-3 left-3 w-full h-full bg-[#4bafa8] rounded-[20px] z-0" />
                <div className="absolute top-1 left-1 w-full h-full bg-[#6969fc] rounded-[20px] z-10" />
                <div className="relative bg-[#ffffff] rounded-[20px] shadow-2xl p-8 z-20 w-full">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6969fc] to-[#4bafa8]">
                    Start Learning?
                  </h2>
                  <p className="text-gray-600 mt-2 mb-6 text-sm font-medium">That's What We Offer.</p>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="p-[2px] rounded-full bg-gradient-to-r from-[#6969fc] to-[#4bafa8] shrink-0">
                      <Button className="bg-[#1d1e25] text-white text-sm font-medium px-6 py-2 rounded-full">
                        <Link href="/sign-up">Get Started</Link>
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <a href="#" aria-label="LinkedIn">
                        <Linkedin className="text-black h-5 w-5" />
                      </a>
                      <a href="#" aria-label="Email">
                        <Mail className="text-black h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-start gap-24 text-sm">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-widest">Resources</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="#">Documentation</a></li>
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Community</a></li>
                    <li><a href="#">API</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-widest">Legal</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="#">Privacy</a></li>
                    <li><a href="#">Terms</a></li>
                    <li><a href="#">Security</a></li>
                    <li><a href="#">Compliance</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400 mt-16">
              © 2025 CryptoSeven. All rights reserved.
            </div>
          </footer>
          </div>
        </div>
      </main>
    )    
  }
