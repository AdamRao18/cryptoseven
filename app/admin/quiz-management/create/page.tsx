"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { addQuiz } from "@/lib/firestore"

export default function CreateQuizPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "", // mcq | drag-and-drop
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newQuiz = {
        ...formData,
        questions: [], // initialize empty array
      }

      await addQuiz(newQuiz)
      router.push("/admin/quiz-management")
    } catch (error) {
      console.error("Error creating quiz:", error)
      alert("Failed to create quiz. Please try again.")
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/quiz-management">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Quiz</h1>
          <p className="text-muted-foreground mt-2">Set up a new quiz for your course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details for your quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter quiz title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this quiz covers"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Quiz Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quiz type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="drag-and-drop">Drag and Drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
          <Link href="/admin/quiz-management" className="flex-1">
            <Button type="button" variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
