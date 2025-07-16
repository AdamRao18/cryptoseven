'use client'

import { AdminSidebarLinks } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '@/database/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { LogOut } from 'lucide-react'

type SectionType = 'Admin Panel'

export const AdminSidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [activeSection] = useState<SectionType>('Admin Panel')
  const [activeLink, setActiveLink] = useState<string>('')
  const [username, setUsername] = useState<string>('')

  // Load user data from Firestore
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser
      if (!currentUser) return

      const userRef = doc(db, 'users', currentUser.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const userData = userSnap.data()
        setUsername(userData.username || '')
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const links = AdminSidebarLinks
    const firstLink = Object.values(links)[0]?.[0]
    if (firstLink) {
      setActiveLink(firstLink.href)
    }
  }, [activeSection])

  useEffect(() => {
    setActiveLink(pathname)
  }, [pathname])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/sign-in')
  }

  const renderLinks = () => {
    return Object.entries(AdminSidebarLinks).map(([section, items]) => (
      <div key={section} className="mb-6">
        <h3 className="text-xs text-gray-400 uppercase mb-2 pl-3 hidden md:block tracking-widest">
          {section}
        </h3>
        <div className="flex flex-col">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActiveLink(item.href)}
              className={`flex items-center gap-3 py-2 px-4 mx-2 rounded-lg transition-all duration-300 ${
                activeLink === item.href
                  ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 min-w-[20px]" />
              <span className="hidden md:inline text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    ))
  }

  return (
    <aside className="w-16 md:w-64 h-screen fixed top-0 left-0 z-40 bg-black border-r border-white/10 backdrop-blur-md shadow-lg flex flex-col justify-between p-4">
      {/* Top: Logo + Nav */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <Image src="/icons/logo.png" alt="CryptoSeven Logo" width={36} height={36} />
          <h1 className="text-white text-lg font-bold hidden md:block">{activeSection}</h1>
        </div>

        {/* Navigation Links */}
        <nav className="mt-10 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {renderLinks()}
        </nav>
      </div>

      {/* Bottom: Username + Logout */}
      <div className="flex items-center justify-between px-2 text-sm text-gray-300 mt-6">
        <span className="truncate max-w-[60%] hidden md:inline">{username}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-400 hover:text-red-500 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  )
}
