// components/admin/CourseFormModal.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { addCourse, updateCourse } from "@/lib/firestore"
import { toast } from "sonner"

type Props = {
  open: boolean
  onClose: () => void
  editData?: any
}

export const CourseFormModal = ({ open, onClose, editData }: Props) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "Beginner",
    instructorName: "",
    category: "",
    type: "Video",
    point: 0,
  })

  useEffect(() => {
    if (editData) setForm(editData)
  }, [editData])

  const handleSubmit = async () => {
    try {
      if (editData) {
        await updateCourse(editData.id, form)
        toast.success("Course updated!")
      } else {
        await addCourse({ ...form, modules: [] })
        toast.success("Course added!")
      }
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Failed to save course.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Course" : "Add New Course"}</DialogTitle>
        </DialogHeader>

        {["title", "description", "instructorName", "category"].map((field) => (
          <div key={field} className="space-y-1">
            <Label htmlFor={field}>{field}</Label>
            <Input
              id={field}
              value={form[field as keyof typeof form]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
            />
          </div>
        ))}

        <div className="space-y-1">
          <Label>Level</Label>
          <select
            className="w-full bg-slate-700 rounded px-3 py-2"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label>Type</Label>
          <select
            className="w-full bg-slate-700 rounded px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>Video</option>
            <option>Text</option>
            <option>Mixed</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label>Point</Label>
          <Input
            type="number"
            value={form.point}
            onChange={(e) => setForm({ ...form, point: parseInt(e.target.value) })}
          />
        </div>

        <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700" onClick={handleSubmit}>
          {editData ? "Update Course" : "Create Course"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
