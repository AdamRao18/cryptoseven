'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/database/firebase'
import { Settings, LogOut } from 'lucide-react'

const Header = () => {
  const [avatar, setAvatar] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const data = userSnap.data()
        setUsername(data.username ?? null)
        setAvatar(data.avatarPicture ?? null)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/sign-in')
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const handleSettings = () => {
    router.push('/setting')
  }

  const getInitials = (name: string | null) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U'
  }

  return (
    <div className="flex justify-end px-6 py-3 relative">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 text-white border border-slate-500 overflow-hidden shadow-md hover:ring-2 hover:ring-cyan-400 transition"
        >
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-sm font-semibold">
              {getInitials(username)}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg text-white">
            <button
              onClick={handleSettings}
              className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
