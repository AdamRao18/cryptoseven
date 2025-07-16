'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/database/firebase'
import { useAuthRedirect } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type LeaderboardEntry = {
  userId: string
  username: string
  avatarPicture?: string
  score: number
  rank: number
  displayAt10th?: boolean
}

export default function CTFLeaderboardPage() {
  const { id } = useParams()
  const { user } = useAuthRedirect()
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [currentUserData, setCurrentUserData] = useState<LeaderboardEntry | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!id) return
      const q = query(collection(db, 'ctfLeaderboard'), where('ctfId', '==', String(id)))
      const snapshot = await getDocs(q)

      const rawData = snapshot.docs.map(doc => ({
        ...(doc.data() as Omit<LeaderboardEntry, 'rank'>),
      }))

      const sorted = rawData
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))

      setLeaderboardData(sorted)

      const found = sorted.find(entry => entry.userId === user?.uid)
      if (found) setCurrentUserData(found)
    }

    fetchLeaderboard()
  }, [id, user?.uid])

  const getDisplayData = () => {
    if (!currentUserData) return leaderboardData.slice(0, 10)

    if (currentUserData.rank <= 10) return leaderboardData

    const top9 = leaderboardData.slice(0, 9)
    const currentVisual = {
      ...currentUserData,
      displayAt10th: true,
    }
    const othersBelow = leaderboardData.slice(9)
    return [...top9, currentVisual, ...othersBelow]
  }

  const displayData = getDisplayData()
  const isUserInTop10 = currentUserData?.rank && currentUserData.rank <= 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0" />
      <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full blur-sm opacity-80" />
      <div className="absolute bottom-20 left-16 w-1 h-1 bg-white rounded-full blur-sm opacity-80" />
      {/* Add more if needed */}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl w-full">
          {/* Continue Button */}
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-light text-white mb-8 text-center tracking-wide">
              Welcome Hackers
            </h2>
            <Button
              size="lg"
              onClick={() => router.push(`/ctf/${id}/page`)}
              className="px-16 py-8 text-lg font-light bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 backdrop-blur-md shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl"
            >
              Continue
            </Button>
          </div>

          {/* Leaderboard Card */}
          <Card className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-6 pt-8 px-8">
              <CardTitle className="text-3xl font-light text-white text-center tracking-wide">
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto px-8 pb-8">
                {displayData.map((player, index) => {
                  const isCurrentUser =
                    player.userId === user?.uid || player.displayAt10th
                  const displayRank = player.displayAt10th ? currentUserData?.rank : player.rank
                  const showAt10th = player.displayAt10th

                  return (
                    <div
                      key={`${player.rank}-${player.userId}-${index}`}
                      className={`flex items-center justify-between py-4 border-b border-white/10 last:border-b-0 transition-all duration-200 ${
                        isCurrentUser
                          ? 'bg-white/10 backdrop-blur-sm rounded-lg px-4 -mx-4 border-white/20'
                          : 'hover:bg-white/5 rounded-lg px-4 -mx-4'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-sm font-mono w-8 text-center ${
                            isCurrentUser
                              ? 'text-blue-300 font-medium'
                              : 'text-white/60'
                          }`}
                        >
                          {showAt10th ? '10' : displayRank}
                        </span>
                        <span
                          className={`font-light text-lg ${
                            isCurrentUser
                              ? 'text-white font-medium'
                              : 'text-white/90'
                          }`}
                        >
                          {player.username}
                        </span>
                        {showAt10th && (
                          <span className="text-blue-300/60 text-xs font-light">
                            (#{displayRank})
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono text-lg ${
                            isCurrentUser
                              ? 'text-blue-300 font-medium'
                              : 'text-white/80'
                          }`}
                        >
                          {player.score.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {!isUserInTop10 && currentUserData && (
                <div className="px-8 pb-4">
                  <div className="text-center text-white/40 text-sm font-light">
                    You appear at position 10, actual rank #{currentUserData.rank}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
