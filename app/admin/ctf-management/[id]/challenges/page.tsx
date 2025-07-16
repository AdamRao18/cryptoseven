'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, Pencil, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { fetchCTFQuestionsByCTFId, deleteCTFQuestion, updateCTFQuestion, addCTFQuestion } from '@/lib/firestore'
import type { CTFQuestion } from '@/lib/firestore'
import { toast } from 'sonner'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import UploadFile from '@/components/UploadFile'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/database/firebase'

const CTFChallengesPage = () => {
  const { id } = useParams()
  const router = useRouter()

  const [questions, setQuestions] = useState<CTFQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<CTFQuestion | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(0)
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [hints, setHints] = useState('')
  const [secretMessage, setSecretMessage] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [flagHash, setFlagHash] = useState('')

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPoints(0)
    setCategory('')
    setDifficulty('easy')
    setHints('')
    setSecretMessage('')
    setFileUrl('')
    setFlagHash('')
  }

  useEffect(() => {
    const loadQuestions = async () => {
      const q = await fetchCTFQuestionsByCTFId(id as string)
      setQuestions(q)
      setLoading(false)
    }
    if (id) loadQuestions()
  }, [id])

  const handleCreate = async () => {
    try {
      const data = {
        ctfId: id,
        title,
        description: description || '',
        points,
        category,
        difficulty,
        flagHash,
        hints: hints || undefined,
        secretMessage: secretMessage || undefined,
        fileUrl: fileUrl || undefined,
      }

      const newId = await addCTFQuestion(data)

      const ctfRef = doc(db, 'ctf', id as string)
      const ctfSnap = await getDoc(ctfRef)
      const ctfData = ctfSnap.data()

      const questions = new Set([...(ctfData?.questions || []), newId])
      const categories = new Set([...(ctfData?.categories || []), category])

      await updateDoc(ctfRef, {
        questions: Array.from(questions),
        categories: Array.from(categories),
      })

      toast.success('Challenge created!')
      setOpenCreate(false)
      resetForm()
      const updated = await fetchCTFQuestionsByCTFId(id as string)
      setQuestions(updated)
    } catch (err) {
      toast.error('Create failed')
      console.error(err)
    }
  }

  const handleEdit = async () => {
    if (!editingQuestion) return

    try {
      const data = {
        title,
        description: description || '',
        points,
        category,
        difficulty,
        flagHash,
        hints: hints || undefined,
        secretMessage: secretMessage || undefined,
        fileUrl: fileUrl || undefined,
      }

      await updateCTFQuestion(editingQuestion.id, data)

      toast.success('Challenge updated')
      setOpenEdit(false)
      resetForm()
      setEditingQuestion(null)
      const updated = await fetchCTFQuestionsByCTFId(id as string)
      setQuestions(updated)
    } catch (err) {
      toast.error('Update failed')
      console.error(err)
    }
  }

  const handleDelete = async (qid: string) => {
    try {
      await deleteCTFQuestion(id as string, qid)

      const ctfRef = doc(db, 'ctf', id as string)
      const snap = await getDoc(ctfRef)
      const ctf = snap.data()
      const newQ = (ctf?.questions || []).filter((q: string) => q !== qid)
      await updateDoc(ctfRef, { questions: newQ })

      toast.success('Challenge deleted')
      const updated = await fetchCTFQuestionsByCTFId(id as string)
      setQuestions(updated)
    } catch (err) {
      toast.error('Delete failed')
      console.error(err)
    }
  }

  const openEditModal = (q: CTFQuestion) => {
    setEditingQuestion(q)
    setTitle(q.title)
    setDescription(q.description || '')
    setPoints(q.points)
    setCategory(q.category)
    setDifficulty(q.difficulty)
    setHints(q.hints || '')
    setSecretMessage(q.secretMessage || '')
    setFileUrl(q.fileUrl || '')
    setFlagHash(q.flagHash || '')
    setOpenEdit(true)
  }

  const filtered = questions.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Challenges</h1>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2" />Create Challenge</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg text-black">
            <DialogHeader><DialogTitle className='text-black'>New Challenge</DialogTitle></DialogHeader>
            <div className="space-y-3 text-black">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              <Label>Points</Label>
              <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(val) => setDifficulty(val as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Label>Flag</Label>
              <Input value={flagHash} onChange={(e) => setFlagHash(e.target.value)} />
              <Label>Hints</Label>
              <Textarea value={hints} onChange={(e) => setHints(e.target.value)} />
              <Label>Secret Message</Label>
              <Textarea value={secretMessage} onChange={(e) => setSecretMessage(e.target.value)} />
              <UploadFile label="Attach File (optional)" currentFile={fileUrl} onUploaded={setFileUrl} />
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleCreate}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="max-w-lg text-black">
            <DialogHeader><DialogTitle className='text-black'>Edit Challenge</DialogTitle></DialogHeader>
            <div className="space-y-3 text-black">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              <Label>Points</Label>
              <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(val) => setDifficulty(val as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Label>Flag</Label>
              <Input value={flagHash} onChange={(e) => setFlagHash(e.target.value)} />
              <Label>Hints</Label>
              <Textarea value={hints} onChange={(e) => setHints(e.target.value)} />
              <Label>Secret Message</Label>
              <Textarea value={secretMessage} onChange={(e) => setSecretMessage(e.target.value)} />
              <UploadFile label="Attach File (optional)" currentFile={fileUrl} onUploaded={setFileUrl} />
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 w-full md:w-1/3" />

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No challenges found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{q.title}</h2>
                <p className="text-sm text-muted-foreground">{q.description}</p>
                <p className="text-sm">Points: {q.points}</p>
                <p className="text-sm">Category: {q.category}</p>
                <p className="text-sm">Difficulty: {q.difficulty}</p>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(q)}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CTFChallengesPage
