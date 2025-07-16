'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, updateDoc, getDoc, collectionGroup, writeBatch, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/database/firebase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import UploadImage from '@/components/UploadImage'
import { toast } from 'sonner'

export default function SettingsPage() {
  const auth = getAuth()
  const currentUser = auth.currentUser
  const [username, setUsername] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) return
      const snap = await getDoc(doc(db, 'users', currentUser.uid))
      if (snap.exists()) {
        const data = snap.data()
        setUsername(data.username || currentUser.displayName || '')
        setPhotoURL(data.photoURL || currentUser.photoURL || '')
      }
    }

    fetchUser()
  }, [currentUser])

  const handleSave = async () => {
    if (!currentUser) return
    setSaving(true)

    try {
      const uid = currentUser.uid
      const newUsername = username.trim()
      const newAvatar = photoURL

      // Update in `users`
      await updateDoc(doc(db, 'users', uid), {
        username: newUsername,
        photoURL: newAvatar,
      })

      // Update in `globalLeaderboard`
      await updateDoc(doc(db, 'globalLeaderboard', uid), {
        username: newUsername,
        avatarPicture: newAvatar,
      })

      toast.success('✅ Profile updated successfully')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('❌ Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Display Name</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <UploadImage
          label="Profile Picture"
          currentImage={photoURL}
          onUploaded={(url) => setPhotoURL(url)}
        />

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
