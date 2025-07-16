'use client'

import { SidebarLinks } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type SectionType = 'CryptoSeven'

const Sidebar = () => {
  const router = useRouter()
  const [activeSection] = useState<SectionType>('CryptoSeven')
  const [activeLink, setActiveLink] = useState<string>('')

  useEffect(() => {
    const links = SidebarLinks
    const firstLink = Object.values(links)[0]?.[0]
    if (firstLink) {
      setActiveLink(firstLink.href)
      router.push(firstLink.href)
    }
  }, [activeSection])

  const renderLinks = () => {
    const links = SidebarLinks

    return Object.entries(links).map(([section, items]) => (
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
                  ? 'bg-gradient-to-r from-[#6B6CFC] to-[#4C51BF] text-white shadow-md'
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
    <aside className="w-16 md:w-64 h-screen fixed top-0 left-0 z-40 bg-white/5 border-r border-white/10 backdrop-blur-md shadow-lg flex flex-col p-4">
      {/* Logo + Title */}
      <div className="flex items-center gap-3 px-2">
        <Image src="/icons/logo.png" alt="CryptoSeven Logo" width={36} height={36} />
        <h1 className="text-white text-lg font-bold hidden md:block">{activeSection}</h1>
      </div>

      {/* Navigation Links */}
      <nav className="mt-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {renderLinks()}
      </nav>
    </aside>
  )
}

export default Sidebar
