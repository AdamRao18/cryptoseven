"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, collection, getDocs, query, where, updateDoc, increment, arrayUnion } from "firebase/firestore"
import { db } from "@/database/firebase"
import { getAuth } from "firebase/auth"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function CTFPage() {
  const { id } = useParams()
  const auth = getAuth()
  const [userData, setUserData] = useState<any | null>(null)
  const [ctfName, setCtfName] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [groupedChallenges, setGroupedChallenges] = useState<Record<string, any[]>>({})
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null)
  const [flagInput, setFlagInput] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchUserAndCTFData = async () => {
    const currentUser = auth.currentUser
    if (!currentUser || !id) return

    const userRef = doc(db, "users", currentUser.uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return

    const user = userSnap.data()
    setUserData(user)

    const ctfDoc = await getDoc(doc(db, "ctf", id as string))
    if (!ctfDoc.exists()) return

    const ctf = ctfDoc.data()
    setCtfName(ctf.title)
    setCategories(ctf.categories || [])
    setSelectedCategory(ctf.categories?.[0] || "")

    const questionIds: string[] = ctf.questions || []
    const questionChunks = []
    for (let i = 0; i < questionIds.length; i += 10) {
      questionChunks.push(questionIds.slice(i, i + 10))
    }

    const allQuestions: any[] = []
    for (const chunk of questionChunks) {
      const qSnap = await getDocs(
        query(collection(db, "ctfQuestion"), where("id", "in", chunk))
      )
      allQuestions.push(...qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }

    const grouped: Record<string, any[]> = {}
    allQuestions.forEach(q => {
      if (!grouped[q.category]) grouped[q.category] = []
      grouped[q.category].push({
        ...q,
        name: q.title,
        solved: user.ctfProgress?.[id as string]?.questionsSolved?.[q.id] || false,
      })
    })
    setGroupedChallenges(grouped)
  }

  useEffect(() => {
    fetchUserAndCTFData()
  }, [id])

  const handleSubmitFlag = async () => {
    if (!selectedQuestion || !userData || !id) return

    const correctFlag = selectedQuestion.flagHash
    const questionId = selectedQuestion.id
    const currentUser = auth.currentUser
    if (!currentUser) return

    if (flagInput.trim() === correctFlag) {
      const userRef = doc(db, "users", currentUser.uid)
      const globalLeaderboardRef = doc(db, "globalLeaderboard", currentUser.uid)
      const ctfLeaderboardRef = doc(db, "ctfLeaderboard", `${id}_${currentUser.uid}`)

      await updateDoc(userRef, {
        [`ctfProgress.${id}.questionsSolved.${questionId}`]: true,
        [`ctfProgress.${id}.capturedFlags`]: arrayUnion(questionId),
        [`ctfProgress.${id}.score`]: increment(selectedQuestion.points),
        cummulativePoint: increment(selectedQuestion.points),
      })

      await updateDoc(globalLeaderboardRef, {
        totalCTFPoint: increment(selectedQuestion.points),
        totalPoint: increment(selectedQuestion.points),
      })

      await updateDoc(ctfLeaderboardRef, {
        score: increment(selectedQuestion.points),
      })

      toast.success("✅ Flag Correct!", { position: "top-right" })
      setDialogOpen(false)
      setFlagInput("")
      setSelectedQuestion(null)
      fetchUserAndCTFData()
    } else {
      toast.error("Incorrect flag", { position: "top-right" })
    }
  }

  const totalChallenges = Object.values(groupedChallenges).reduce((acc, list) => acc + list.length, 0)
  const totalSolved = Object.values(groupedChallenges).reduce((acc, list) => acc + list.filter(ch => ch.solved).length, 0)
  const totalPoints = Object.values(groupedChallenges).reduce((acc, list) => acc + list.filter(ch => ch.solved).reduce((sum, q) => sum + q.points, 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-6 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{ctfName}</h1>
            <p className="text-slate-300 mt-1">Capture The Flag Competition</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Score:</span>
              <span className="font-bold text-yellow-400">{totalPoints}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Solved:</span>
              <span className="font-bold text-green-400">
                {totalSolved}/{totalChallenges}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 bg-slate-800 border border-slate-700">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-white data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedChallenges[cat]?.map((challenge) => (
                  <Dialog key={challenge.id} open={dialogOpen && selectedQuestion?.id === challenge.id} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) {
                      setFlagInput("")
                      fetchUserAndCTFData()
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Card
                        onClick={() => {
                          setSelectedQuestion(challenge)
                          setDialogOpen(true)
                        }}
                        className={`bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer ${
                          challenge.solved ? "border-green-500/50" : ""
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between text-white">
                            <CardTitle className="text-lg">{challenge.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="flex justify-between text-white">
                          <Badge variant="outline" className={challenge.solved ? "border-green-400 text-green-400" : "border-cyan-400 text-cyan-400"}>
                            {challenge.points} pts
                          </Badge>
                          <span className="text-sm">{challenge.solved ? "Solved" : "Unsolved"}</span>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 text-white max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{selectedQuestion?.title}</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-gray-300 mb-2">{selectedQuestion?.description}</p>
                      <p className="text-sm text-cyan-400 mb-1">Points: {selectedQuestion?.points}</p>
                      {selectedQuestion?.fileUrl && (
                        <a
                          href={selectedQuestion.fileUrl}
                          download
                          target="_blank"
                          className="inline-flex items-center gap-2 text-blue-400 hover:underline mt-2"
                        >
                          <FileDown size={16} /> Download Attachment
                        </a>
                      )}
                      <Textarea
                        className="mt-4"
                        placeholder="Enter your flag here"
                        value={selectedQuestion?.solved ? selectedQuestion.flagHash : flagInput}
                        disabled={selectedQuestion?.solved}
                        onChange={(e) => setFlagInput(e.target.value)}
                      />
                      <Button onClick={handleSubmitFlag} className="mt-4 w-full" disabled={selectedQuestion?.solved}>
                        Submit Flag
                      </Button>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}