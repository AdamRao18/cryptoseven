"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Flag, Users, Calendar } from "lucide-react"
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
import { fetchCTFs, deleteCTF as deleteCTFFromFirestore } from "@/lib/firestore" // ✅ import your Firestore fetch logic
import type { CTF } from "@/lib/firestore"

export default function CTFPage() {
  const [ctfs, setCTFs] = useState<CTF[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter] = useState("all")

  useEffect(() => {
    const loadCTFs = async () => {
      const data = await fetchCTFs()
      setCTFs(data)
    }
    loadCTFs()
  }, [])

  const filteredCTFs = ctfs.filter((ctf) => {
    const matchesSearch =
      ctf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctf.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ctf.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const deleteCTF = async (id: string) => {
  try {
    // Delete from Firestore
    await deleteCTFFromFirestore(id)

    // Optimistically update UI
    setCTFs((prev) => prev.filter((ctf) => ctf.id !== id))
  } catch (error) {
    console.error("Failed to delete CTF:", error)
    alert("Failed to delete CTF. Please try again.")
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFormatColor = (format: string) => {
    switch (format.toLowerCase()) {
      case "jeopardy":
        return "bg-blue-100 text-blue-800"
      case "attack-defense":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">CTF Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage Capture The Flag competitions</p>
        </div>
        <Link href="/admin/ctf-management/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create CTF
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search CTFs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCTFs.map((ctf) => (
          <Card key={ctf.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{ctf.title}</h3>
                    <Badge className={getStatusColor(ctf.status)}>{ctf.status}</Badge>
                    <Badge variant="outline" className={getFormatColor(ctf.format)}>{ctf.format}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{ctf.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {formatDate(ctf.startDate)} - {formatDate(ctf.endDate)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Challenges</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Flag className="w-4 h-4 mr-1" />
                        <span>{ctf.questions?.length ?? 0}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Participants</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{ctf.players?.length ?? 0}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Categories</p>
                      <p className="text-sm text-muted-foreground">{ctf.categories?.join(", ") || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">{formatDate(ctf.createdAt ?? ctf.startDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-6">
                  <Link href={`/admin/ctf-management/${ctf.id}/challenges`}>
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4 mr-2" />
                      Challenges
                    </Button>
                  </Link>
                  <Link href={`/admin/ctf-management/${ctf.id}/edit`}>
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
                        <AlertDialogTitle>Delete CTF</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{ctf.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-black">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteCTF(ctf.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCTFs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Flag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No CTFs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search terms or filters"
                : "Get started by creating your first CTF competition"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link href="/admin/ctf-management/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create CTF
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
