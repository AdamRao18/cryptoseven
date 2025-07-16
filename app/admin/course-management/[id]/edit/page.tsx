"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/database/firebase"
import UploadImage from "@/components/UploadImage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import React from "react"

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructorName: "",
    instructorAvatar: "",
    level: "",
    category: "",
    type: "",
    point: 0,
    courseImage: "",
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, "courses", id)
        const courseSnap = await getDoc(courseRef)

        if (courseSnap.exists()) {
          const data = courseSnap.data()
          setFormData({
            title: data.title || "",
            description: data.description || "",
            instructorName: data.instructorName || "",
            instructorAvatar: data.instructorAvatar || "",
            level: data.level || "",
            category: data.category || "",
            type: data.type || "",
            point: data.point || 0,
            courseImage: data.courseImage || "",
          })
        } else {
          console.error("Course not found.")
          router.push("/admin/course-management")
        }
      } catch (error) {
        console.error("Failed to fetch course:", error)
        router.push("/admin/course-management")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, router])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const courseRef = doc(db, "courses", id)
      await updateDoc(courseRef, {
        ...formData,
      })
      router.push("/admin/course-management")
    } catch (error) {
      console.error("Failed to update course:", error)
      alert("Failed to update course. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-center py-20">Loading course data...</p>
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/course-management">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground mt-2">Update course information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Update the information for this course</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="instructorName">Instructor Name *</Label>
                <Input
                  id="instructorName"
                  value={formData.instructorName}
                  onChange={(e) => handleChange("instructorName", e.target.value)}
                  required
                />
              </div>

              <UploadImage
                label="Instructor Avatar"
                currentImage={formData.instructorAvatar}
                onUploaded={(url) => handleChange("instructorAvatar", url)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => handleChange("level", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Skills">Skills</SelectItem>
                      <SelectItem value="Path">Path</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Red Teaming">Red Teaming</SelectItem>
                      <SelectItem value="Blue Teaming">Blue Teaming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="point">Point *</Label>
                <Input
                  id="point"
                  type="number"
                  value={formData.point}
                  onChange={(e) => handleChange("point", Number(e.target.value))}
                  required
                />
              </div>

              <UploadImage
                label="Course Image"
                currentImage={formData.courseImage}
                onUploaded={(url) => handleChange("courseImage", url)}
              />
            </div>

            <div className="flex space-x-4 pt-6">
              <Button type="submit" className="flex-1" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Updating..." : "Update Course"}
              </Button>
              <Link href="/admin/course-management" className="flex-1">
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
