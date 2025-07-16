"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { db } from "@/database/firebase"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Trash2, Edit } from "lucide-react"

export default function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params)
  const router = useRouter()
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    videoUrl: "",
    duration: 0,
    order: 0,
  })

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const q = query(collection(db, "modules"), where("courseId", "==", courseId))
        const snapshot = await getDocs(q)
        const moduleList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setModules(moduleList)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchModules()
  }, [courseId])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({ id: "", title: "", videoUrl: "", duration: 0, order: 0 })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { id, ...moduleData } = formData
      const moduleRef = await addDoc(collection(db, "modules"), {
        courseId,
        ...moduleData,
        order: modules.length + 1,
      })
      await updateDoc(doc(db, "courses", courseId), {
        modules: arrayUnion(moduleRef.id),
      })
      setModules([...modules, { id: moduleRef.id, courseId, ...moduleData, order: modules.length + 1 }])
      resetForm()
    } catch (err) {
      console.error("Error creating module:", err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { id, ...moduleData } = formData
      await updateDoc(doc(db, "modules", formData.id), moduleData)
      setModules(modules.map((m) => (m.id === formData.id ? { ...m, ...moduleData } : m)))
      resetForm()
    } catch (err) {
      console.error("Error updating module:", err)
    }
  }

  const handleDelete = async (moduleId: string) => {
    try {
      await deleteDoc(doc(db, "modules", moduleId))
      await updateDoc(doc(db, "courses", courseId), {
        modules: arrayRemove(moduleId),
      })
      setModules(modules.filter((m) => m.id !== moduleId))
      if (formData.id === moduleId) {
        resetForm()
      }
    } catch (err) {
      console.error("Error deleting module:", err)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/course-management">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Manage Modules</h1>
          <p className="text-muted-foreground mt-2">Add, edit, or remove modules for this course</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{formData.id ? "Edit Module" : "Add Module"}</CardTitle>
          <CardDescription>
            {formData.id ? "Update module details." : "Fill in details to add a new module."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formData.id ? handleEdit : handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input id="videoUrl" value={formData.videoUrl} onChange={(e) => handleChange("videoUrl", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input id="duration" type="number" value={formData.duration} onChange={(e) => handleChange("duration", Number(e.target.value))} required />
            </div>
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {formData.id ? "Update Module" : "Add Module"}
              </Button>
              {formData.id && (
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p>Loading modules...</p>
        ) : (
          modules.map((mod) => (
            <Card key={mod.id} className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{mod.title}</h3>
                <p className="text-muted-foreground text-sm">{mod.videoUrl}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => setFormData(mod)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(mod.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
