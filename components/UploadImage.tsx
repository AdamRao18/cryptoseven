"use client"

import { useState } from "react"
import axios from "axios"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface UploadImageProps {
  label: string
  onUploaded: (url: string) => void
  currentImage?: string
}

export default function UploadImage({ label, onUploaded, currentImage }: UploadImageProps) {
  const [preview, setPreview] = useState(currentImage || "")
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      console.error("Only image files are allowed.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      setUploading(true)
      const res = await axios.post("/api/cloudinary/upload", formData)
      const url = res.data.secure_url
      setPreview(url)
      onUploaded(url)
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <Input type="file" accept="image/*" onChange={handleChange} />
      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
      {preview && (
        <Image
          src={preview}
          alt="Preview"
          width={200}
          height={120}
          className="rounded border border-muted"
        />
      )}
    </div>
  )
}
