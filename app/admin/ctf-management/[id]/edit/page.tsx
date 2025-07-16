"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/database/firebase"
import UploadImage from "@/components/UploadImage"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"

export default function EditCTFPageClient() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    format: "jeopardy",
    status: "upcoming",
    image: "",
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchCTF = async () => {
      try {
        const ctfRef = doc(db, "ctf", id)
        const ctfSnap = await getDoc(ctfRef)

        if (ctfSnap.exists()) {
          const data = ctfSnap.data()
          setFormData({
            title: data.title || "",
            description: data.description || "",
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            format: data.format || "jeopardy",
            status: data.status || "upcoming",
            image: data.image || "",
          })
        } else {
          console.error("CTF not found.")
          router.push("/admin/ctf-management")
        }
      } catch (error) {
        console.error("Failed to fetch CTF:", error)
        router.push("/admin/ctf-management")
      } finally {
        setLoading(false)
      }
    }

    fetchCTF()
  }, [id, router])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      const validatedData = {
        ...formData,
        format: formData.format.toLowerCase(),
        status: formData.status.toLowerCase(),
      }

      const ctfRef = doc(db, "ctf", id)
      await updateDoc(ctfRef, validatedData)
      router.push("/admin/ctf-management")
    } catch (error) {
      console.error("Failed to update CTF:", error)
      alert("Failed to update CTF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-center py-20">Loading CTF data...</p>
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
          <h1 className="text-3xl font-bold">Edit CTF</h1>
          <p className="text-muted-foreground mt-2">Update CTF information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CTF Details</CardTitle>
          <CardDescription>Update the information for this CTF</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Format *</Label>
                <Select value={formData.format} onValueChange={(value) => handleChange("format", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jeopardy">Jeopardy</SelectItem>
                    <SelectItem value="attack-defense">Attack & Defend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <UploadImage
                label="CTF Banner Image"
                currentImage={formData.image}
                onUploaded={(url) => handleChange("image", url)}
              />
            </div>

            <div className="flex space-x-4 pt-6">
              <Button type="submit" className="flex-1" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Updating..." : "Update CTF"}
              </Button>
              <Link href="/admin/ctf-management" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
