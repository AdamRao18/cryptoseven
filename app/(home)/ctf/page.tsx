'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/database/firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useAuthRedirect } from '@/lib/useAuth';
import Link from 'next/link';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

type CTF = {
  id: string;
  title: string;
  endDate: string;
  startDate: string;
  status: 'upcoming' | 'active' | 'completed';
  players: string[];
};

export default function Page() {
  const [activeCTFs, setActiveCTFs] = useState<any[]>([]);
  const { user } = useAuthRedirect(); // current logged in user

  useEffect(() => {
    const fetchCTFs = async () => {
      const ctfSnapshot = await getDocs(collection(db, 'ctf'));
      const allCTFs = await Promise.all(
        ctfSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() as CTF;
          const ctfId = docSnap.id;

          // Sum total CTF point pool from ctfQuestion collection
          const questionSnap = await getDocs(
            query(collection(db, 'ctfQuestion'), where('ctfId', '==', ctfId))
          );
          const pointPool = questionSnap.docs.reduce((sum, q) => {
            const data = q.data();
            return sum + (data.points || 0);
          }, 0);

          // Get leaderboard and compute current user's rank
          let position = 'N/A';
          if (user) {
            const leaderboardSnap = await getDocs(
              query(collection(db, 'ctfLeaderboard'), where('ctfId', '==', ctfId))
            );

            const leaderboard = leaderboardSnap.docs
              .map((doc) => doc.data())
              .sort((a, b) => b.score - a.score); // sort descending by score

            const index = leaderboard.findIndex((entry) => entry.userId === user.uid);
            if (index !== -1) {
              position = String(index + 1);

            }
          }

          const endsIn =
            data.status === 'active'
              ? formatDistanceToNowStrict(parseISO(data.endDate))
              : null;

          return {
            ...data,
            id: ctfId,
            pointPool,
            participants: data.players.length,
            position,
            endsIn,
            isRegistered: user ? data.players.includes(user.uid) : false,
            isStarted: new Date(data.startDate) <= new Date(),
          };
        })
      );

      const active = allCTFs.filter((ctf) => ctf.status === 'active');
      setActiveCTFs(active);
    };

    fetchCTFs();
  }, [user]);

  return (
    <div className="space-y-8 p-6 text-white">
      {activeCTFs.map((ctf) => (
        <div
          key={ctf.id}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg"
        >
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-2xl font-semibold">{ctf.title}</h3>
            <span className="text-xs bg-green-600/20 text-green-400 px-3 py-1 rounded-full font-medium">
              {ctf.status === 'active' ? 'Active' : 'Upcoming'}
            </span>
          </div>

          {ctf.status === 'active' && (
            <p className="text-sm text-gray-300 mt-2">
              Ends in: {ctf.endsIn}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold">{ctf.participants}</div>
              <div className="text-xs text-gray-400 mt-1">Participants</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-300">
                {ctf.pointPool}
              </div>
              <div className="text-xs text-gray-400 mt-1">Points Prize Pool</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-cyan-300">
                {ctf.position}
              </div>
              <div className="text-xs text-gray-400 mt-1">Your Position</div>
            </div>
          </div>

          <Link
            href={
              !ctf.isRegistered
                ? `/ctf/${ctf.id}/overview`
                : ctf.isStarted
                ? `/ctf/${ctf.id}/leaderboard`
                : '#'
            }
          >
            <button
              className="mt-6 w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:brightness-110 transition duration-300"
              disabled={ctf.isRegistered && !ctf.isStarted}
            >
              {!ctf.isRegistered
                ? 'Register'
                : ctf.isStarted
                ? 'Continue Tournament'
                : 'Registered'}
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}
