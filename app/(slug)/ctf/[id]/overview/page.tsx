'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/database/firebase';
import { useAuthRedirect } from '@/lib/useAuth';

export default function CTFOverviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuthRedirect();

  const [ctf, setCtf] = useState<any | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchCTF = async () => {
      if (!id) return;
      const ctfRef = doc(db, 'ctf', String(id));
      const snap = await getDoc(ctfRef);
      if (snap.exists()) {
        const ctfData = snap.data();
        setCtf(ctfData);

        if (user && ctfData.players?.includes(user.uid)) {
          router.push(`/ctf/${id}/page`);
        }
      }
    };

    if (!loading) fetchCTF();
  }, [id, user, loading, router]);

  const handleRegister = async () => {
    if (!user || !id) return;

    setRegistering(true);

    const userRef = doc(db, 'users', user.uid);
    const ctfRef = doc(db, 'ctf', String(id));
    const ctfLeaderboardRef = doc(db, 'ctfLeaderboard', `${id}_${user.uid}`);
    const globalLeaderboardRef = doc(db, 'globalLeaderboard', user.uid);

    try {
      await updateDoc(ctfRef, {
        players: arrayUnion(user.uid),
      });

      await updateDoc(userRef, {
        [`ctfProgress.${id}`]: {
          score: 0,
          capturedFlags: [],
          questionsSolved: {},
          rewardClaimed: false,
          ctfStatus: 'registered',
          joinedAt: new Date().toISOString(),
        },
      });

      await setDoc(ctfLeaderboardRef, {
        userId: user.uid,
        username: user.displayName || user.email || 'Unknown',
        avatarPicture: user.photoURL || '/default-avatar.png',
        score: 0,
        rank: 0,
        ctfId: String(id),
      }, { merge: true });

      const globalSnap = await getDoc(globalLeaderboardRef);
      if (!globalSnap.exists()) {
        await setDoc(globalLeaderboardRef, {
          userId: user.uid,
          username: user.displayName || user.email || 'Unknown',
          avatarPicture: user.photoURL || '/default-avatar.png',
          totalQuizPoint: 0,
          totalCTFPoint: 0,
          totalPoint: 0,
          rank: 0,
        });
      }

      router.push(`/ctf/${id}/page`);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setRegistering(false);
    }
  };

  if (!ctf) {
    return <div className="text-white p-6">Loading CTF Overview...</div>;
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
    <header className="p-6">
      <div className="flex items-center justify-between">
        <Link href="/ctf" className="flex items-center hover:underline text-slate-300">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <div className="flex gap-2">
          <span className="bg-slate-700 text-white px-4 py-1 text-sm font-medium rounded">CTF</span>
          {ctf.status === 'active' && (
            <span className="bg-red-600 text-white px-4 py-1 text-sm font-medium rounded">{ctf.status}</span>
          )}
        </div>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 px-6 py-4">
      {/* LEFT COLUMN */}
      <div className="md:col-span-3">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{ctf.title}</h1>

        <div className="grid grid-cols-2 gap-6 mb-6 text-white">
          <div>
            <p className="text-cyan-600 text-sm mb-1">START DATE</p>
            <p className="text-lg font-medium">{new Date(ctf.startDate).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-cyan-600 text-sm mb-1">END DATE</p>
            <p className="text-lg font-medium">{new Date(ctf.endDate).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleRegister}
            disabled={registering}
            className="bg-cyan-600 text-white px-6 py-2 font-medium rounded hover:brightness-110"
          >
            {registering ? 'Registering...' : 'REGISTER'}
          </button>
          <button className="border border-slate-600 text-white px-6 py-2 font-medium rounded hover:bg-slate-700">
            SHARE
          </button>
        </div>

        {ctf.image ? (
          <div className="border border-slate-700 rounded mb-8 overflow-hidden">
            <img
              src={ctf.image}
              alt="CTF Banner"
              className="w-full h-auto object-cover aspect-video"
            />
          </div>
            ) : (
              <div className="border border-slate-700 rounded mb-8 overflow-hidden">
                <div className="aspect-video bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
                  No image available
        </div>
      </div>
    )}
    
        <h2 className="text-xl font-semibold mb-4">Event Overview</h2>
        <p className="text-slate-300 mb-4">{ctf.description}</p>
      </div>

      {/* RIGHT COLUMN */}
      <div className="md:col-span-2">
        <div className="bg-slate-800 p-6 rounded border border-slate-700 space-y-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">EVENT TYPE</p>
            <p className="font-medium capitalize text-cyan-600">{ctf.type}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">FORMAT</p>
            <p className="font-medium capitalize text-cyan-600">{ctf.format}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">PLAYERS</p>
            <p className="font-medium text-cyan-600">{ctf.players?.length ?? 0} <span className='text-white'>joined</span></p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">CHALLENGES</p>
            <p className="font-medium text-cyan-600">{ctf.questions?.length ?? 0} <span className='text-white'>challenges across</span> {ctf.categories?.length ?? 0} <span className='text-white'>categories</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}