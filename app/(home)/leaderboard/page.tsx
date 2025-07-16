'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/database/firebase';

interface LeaderboardUser {
  uid: string;
  name: string;
  totalPoints: number;
  totalQuizPoint: number;
  totalCTFPoint: number;
  flags: number;
}

const Page = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboardSnap = await getDocs(collection(db, 'globalLeaderboard'));
      const users: LeaderboardUser[] = [];

      for (const docSnap of leaderboardSnap.docs) {
        const leaderboardData = docSnap.data();
        const userId = leaderboardData.userId;

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) continue;

        const userData = userSnap.data();

        if (userData.role === 'admin') continue;

        const ctfProgress = userData.ctfProgress || {};
        let flags = 0;
        Object.values(ctfProgress).forEach((ctf: any) => {
          flags += ctf?.capturedFlags?.length || 0;
        });

        const totalQuizPoint = leaderboardData.totalQuizPoint || 0;
        const totalCTFPoint = leaderboardData.totalCTFPoint || 0;

        users.push({
          uid: userId,
          name: userData.username,
          totalPoints: totalQuizPoint + totalCTFPoint,
          totalQuizPoint,
          totalCTFPoint,
          flags,
        });
      }

      const sorted = users.sort((a, b) => b.totalPoints - a.totalPoints);
      setLeaderboard(sorted);
    };

    fetchLeaderboard();

    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRowBg = (index: number) => {
    if (index === 0) return 'bg-yellow-500/10 text-yellow-300 font-semibold';
    if (index === 1) return 'bg-gray-300/10 text-gray-300';
    if (index === 2) return 'bg-orange-500/10 text-orange-300';
    return 'bg-white/5 text-white/90';
  };

  return (
    <div className="space-y-10 px-6 text-white">
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-md bg-white/5 backdrop-blur-md">
        <div className="grid grid-cols-12 p-4 font-medium text-xs uppercase tracking-wide border-b border-white/10 bg-white/10">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-2 text-right">Points</div>
          <div className="col-span-2 text-right">Flags</div>
          <div className="col-span-2 text-right">Quizzes</div>
        </div>

        {leaderboard.map((user, index) => (
          <div
            key={user.uid}
            className={`grid grid-cols-12 p-4 text-sm border-b border-white/10 ${getRowBg(index)}`}
          >
            <div className="col-span-1">{index + 1}</div>
            <div className="col-span-5">{user.name}</div>
            <div className="col-span-2 text-right">{user.totalPoints.toLocaleString()}</div>
            <div className="col-span-2 text-right">{user.flags}</div>
            <div className="col-span-2 text-right">{user.totalQuizPoint}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
