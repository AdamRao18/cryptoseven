"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCTF } from "@/lib/firestore"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import UploadImage from "@/components/UploadImage" // adjust the path if needed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Upload } from "lucide-react"
import Link from "next/link"

export default function CreateCTFPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    format: "jeopardy",
    status: "upcoming",
    image: "",
  })

  const [uploading, setUploading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadImageToCloudinary(file)
      setFormData((prev) => ({ ...prev, image: url }))
    } catch (err) {
      console.error("Image upload failed:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCTF(formData)
      router.push("/admin/ctf-management")
    } catch (err) {
      console.error("Failed to create CTF:", err)
    }
  }

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const form = new FormData()
    form.append("file", file)
    form.append("upload_preset", "your_upload_preset") // ← replace with your Cloudinary preset

    const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
      method: "POST",
      body: form,
    })

    const data = await res.json()
    return data.secure_url
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/ctf-management">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New CTF</h1>
          <p className="text-muted-foreground mt-2">Set up a new Capture The Flag competition</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CTF Information</CardTitle>
          <CardDescription>Fill in details for the new CTF event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Format *</Label>
              <Select value={formData.format} onValueChange={(value) => handleChange("format", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jeopardy">Jeopardy</SelectItem>
                  <SelectItem value="attack-defense">Attack & Defense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image *</Label>
              <UploadImage
                label="CTF Banner Image"
                currentImage={formData.image}
                onUploaded={(url) => handleChange("image", url)}
              />
              {uploading && <p className="text-sm text-muted-foreground">Uploading image...</p>}
            </div>

            <Button type="submit" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Create CTF
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
