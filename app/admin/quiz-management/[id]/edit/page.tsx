"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/database/firebase"
import { quizSchema } from "@/database/schema"
import { updateQuiz } from "@/lib/firestore"
import type { z } from "zod"

type QuizForm = z.infer<typeof quizSchema>

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [formData, setFormData] = useState<Partial<QuizForm>>({
    title: "",
    description: "",
    type: "mcq",
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) return
      try {
        const snap = await getDoc(doc(db, "quiz", quizId))
        if (!snap.exists()) throw new Error("Quiz not found")
        const quiz = snap.data()
        const parsed = quizSchema.partial().parse(quiz)
        setFormData(parsed)
        setLoading(false)
      } catch (err) {
        console.error("Error loading quiz:", err)
        alert("Failed to load quiz data.")
        router.push("/admin/quiz-management")
      }
    }
    loadQuiz()
  }, [quizId, router])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!quizId) throw new Error("Quiz ID is missing")

      await updateQuiz(quizId, {
        ...formData,
      })

      alert("Quiz updated successfully!")
      router.push("/admin/quiz-management")
    } catch (err) {
      console.error("Error updating quiz:", err)
      alert("Failed to update quiz. Please try again.")
    }
  }

  if (loading) return <p className="p-6">Loading...</p>

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
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
          <p className="text-muted-foreground mt-2">Modify quiz details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Edit quiz details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
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
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Quiz Type *</Label>
                <Select value={formData.type} onValueChange={(val) => handleChange("type", val)}>
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
            Save Changes
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
