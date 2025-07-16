/*
  This component was updated to:
  - Use Firestore for storing quiz questions
  - Follow the quizQuestionSchema (id, quizId, question, options, answer, explanation, point)
  - Properly create, update, and delete questions from Firestore
  - Append and remove quizQuestion ID from parent quiz document
*/

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Edit, Plus } from "lucide-react"
import {
  fetchQuizQuestionsByQuizId,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "@/lib/firestore"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/database/firebase"

export type QuizQuestion = {
  id: string
  quizId: string
  question: string
  options: string[]
  answer: number
  explanation?: string
  point: number
}

export default function QuestionsPage() {
  const params = useParams<{ id: string }>()
  const quizId = params.id
  const router = useRouter()

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [form, setForm] = useState({
    id: "",
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
    point: 1,
  })
  const [editMode, setEditMode] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const data = await fetchQuizQuestionsByQuizId(quizId)
      setQuestions(data)
    }
    load()
  }, [quizId])

  const resetForm = () => {
    setForm({
      id: "",
      question: "",
      options: ["", "", "", ""],
      answer: 0,
      explanation: "",
      point: 1,
    })
    setEditMode(false)
  }

  const handleSubmit = async () => {
    const payload = {
      quizId,
      question: form.question,
      options: form.options,
      answer: form.answer,
      explanation: form.explanation,
      point: form.point,
    }

    if (editMode) {
      await updateQuizQuestion(form.id, payload)
      setQuestions((prev) => prev.map((q) => (q.id === form.id ? { ...q, ...payload } : q)))
    } else {
      const id = await addQuizQuestion(payload)
      setQuestions((prev) => [...prev, { id, ...payload }])
    }
    resetForm()
    setOpen(false)
  }

  const handleEdit = (q: QuizQuestion) => {
    setForm({
      id: q.id,
      question: q.question,
      options: q.options || ["", "", "", ""],
      answer: q.answer,
      explanation: q.explanation || "",
      point: q.point,
    })
    setEditMode(true)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteQuizQuestion(id)
    setQuestions((prev) => prev.filter((q) => q.id !== id))

    const quizRef = doc(db, "quiz", quizId)
    const quizSnap = await getDoc(quizRef)
    const quizData = quizSnap.data()
    const updatedIds = (quizData?.quizQuestion as string[] || []).filter((qid) => qid !== id)
    await updateDoc(quizRef, { quizQuestion: updatedIds })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <h1 className="text-2xl font-bold text-black">Manage Questions</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-black">
                {editMode ? "Edit Question" : "Add Question"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label className="text-black">Question</Label>
              <Textarea
                placeholder="Enter the question here"
                className="text-black placeholder:text-gray-400"
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              />

              <Label className="text-black">Options</Label>
              {form.options.map((opt, i) => (
                <Input
                  key={i}
                  value={opt}
                  placeholder={`Option ${i + 1}`}
                  className="text-black placeholder:text-gray-400"
                  onChange={(e) => {
                    const opts = [...form.options]
                    opts[i] = e.target.value
                    setForm((f) => ({ ...f, options: opts }))
                  }}
                />
              ))}

              <Label className="text-black">Correct Answer</Label>
              <RadioGroup
                value={form.answer.toString()}
                className="text-black"
                onValueChange={(val) => setForm((f) => ({ ...f, answer: parseInt(val) }))}
              >
                {form.options.map((opt, i) => (
                  <div className="flex items-center space-x-2" key={i}>
                    <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>

              <Label className="text-black">Explanation (Optional)</Label>
              <Textarea
                placeholder="Enter explanation (optional)"
                className="text-black placeholder:text-gray-400"
                value={form.explanation}
                onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
              />

              <Label className="text-black">Points</Label>
              <Input
                type="number"
                className="text-black"
                value={isNaN(form.point) ? "" : form.point.toString()}
                onChange={(e) => setForm((f) => ({ ...f, point: parseInt(e.target.value) }))}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>{editMode ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <Card key={q.id} className="p-4">
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <h2 className="font-semibold">
                  {i + 1}. {q.question}
                </h2>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(q)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <ul className="list-disc list-inside">
                {q.options.map((opt, idx) => (
                  <li
                    key={idx}
                    className={idx === q.answer ? "text-green-600 font-medium" : ""}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <p className="text-sm text-muted-foreground">
                  Explanation: {q.explanation}
                </p>
              )}
              <p className="text-sm">Points: {q.point}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}