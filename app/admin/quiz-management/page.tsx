'use client'

import { useEffect, useState } from "react"
import { fetchQuizzes, deleteQuiz } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  HelpCircle,
} from "lucide-react"

type Quiz = {
  id: string
  title: string
  description: string
  type: "mcq" | "drag-and-drop"
  quizQuestion: string[]
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await fetchQuizzes()
        setQuizzes(data)
      } catch (err) {
        console.error("Failed to load quizzes:", err)
      }
    }

    loadQuizzes()
  }, [])

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteQuiz = async (id: string) => {
    await deleteQuiz(id)
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id))
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage quizzes for your courses</p>
        </div>
        <Link href="/admin/quiz-management/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>

      <div className="relative flex-1 max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
                  <p className="text-muted-foreground mb-4">{quiz.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Type</p>
                      <div className="text-sm text-muted-foreground capitalize">{quiz.type}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Questions</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <HelpCircle className="w-4 h-4 mr-1" />
                        <span>{quiz.quizQuestion?.length ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-6">
                  <Link href={`/admin/quiz-management/${quiz.id}/questions`}>
                    <Button variant="outline" size="sm">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Questions
                    </Button>
                  </Link>
                  <Link href={`/admin/quiz-management/${quiz.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-black">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first quiz"}
            </p>
            {!searchTerm && (
              <Link href="/admin/quiz-management/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quiz
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
