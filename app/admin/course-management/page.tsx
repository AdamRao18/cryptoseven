"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/database/firebase"
import { z } from "zod"
import { courseSchema, moduleSchema } from "@/database/schema"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react"
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<z.infer<typeof courseSchema>[]>([])
  const [modulesMap, setModulesMap] = useState<Record<string, z.infer<typeof moduleSchema>>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoursesAndModules = async () => {
      setLoading(true)
      try {
        const courseSnapshot = await getDocs(collection(db, "courses"))
        const moduleSnapshot = await getDocs(collection(db, "modules"))

        const fetchedCourses: z.infer<typeof courseSchema>[] = []
        const moduleMap: Record<string, z.infer<typeof moduleSchema>> = {}

        moduleSnapshot.forEach((docSnap) => {
          const parsed = moduleSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
          if (parsed.success) {
            moduleMap[parsed.data.id] = parsed.data
          }
        })

        courseSnapshot.forEach((docSnap) => {
          const parsed = courseSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
          if (parsed.success) {
            fetchedCourses.push(parsed.data)
          }
        })

        setCourses(fetchedCourses)
        setModulesMap(moduleMap)
      } catch (error) {
        console.error("Error fetching courses/modules:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoursesAndModules()
  }, [])

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, "courses", id))
      setCourses((prev) => prev.filter((course) => course.id !== id))
    } catch (error) {
      console.error("Error deleting course:", error)
    }
  }

  const getTotalDuration = (moduleIds: string[]) => {
    const totalMinutes = moduleIds.reduce((sum, id) => {
      const module = modulesMap[id]
      return sum + (module?.duration || 0)
    }, 0)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground mt-2">Manage your courses and modules</p>
        </div>
        <Link href="/admin/course-management/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading courses...</p>
      ) : filteredCourses.length > 0 ? (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{course.title}</h3>
                      <Badge>{course.level}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{course.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Instructor</p>
                        <p className="text-sm text-muted-foreground">{course.instructorName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Modules</p>
                        <p className="text-sm text-muted-foreground">{course.modules.length}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Points</p>
                        <p className="text-sm text-muted-foreground">{course.point}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Total Duration</p>
                        <p className="text-sm text-muted-foreground">{getTotalDuration(course.modules)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-6">
                    <Link href={`/admin/course-management/${course.id}/modules`}>
                      <Button variant="outline" size="sm">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Modules
                      </Button>
                    </Link>
                    <Link href={`/admin/course-management/${course.id}/edit`}>
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
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{course.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-black">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first course"}
            </p>
            {!searchTerm && (
              <Link href="/admin/course-management/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
