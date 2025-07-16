"use client"

import { useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface UploadFileProps {
  label: string
  onUploaded: (url: string) => void
  currentFile?: string
}

export default function UploadFile({ label, onUploaded, currentFile }: UploadFileProps) {
  const [fileName, setFileName] = useState(currentFile || "")
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setUploading(true)
      const res = await axios.post("/api/cloudinary/upload", formData)
      const url = res.data.secure_url
      setFileName(file.name)
      onUploaded(url)
    } catch (err) {
      console.error("File upload failed", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <Input type="file" accept="*/*" onChange={handleChange} />
      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
      {fileName && !uploading && (
        <p className="text-sm text-green-600">Uploaded: {fileName}</p>
      )}
    </div>
  )
}
