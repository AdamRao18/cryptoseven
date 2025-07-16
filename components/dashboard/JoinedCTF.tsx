'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/database/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';

interface CTF {
  id: string;
  title: string;
  format: string;
}

const RegisteredCTFList = () => {
  const [joinedCTFs, setJoinedCTFs] = useState<CTF[]>([]);

  useEffect(() => {
    const fetchJoinedCTFs = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;
      const userData = userSnap.data();

      const ctfProgress = userData.ctfProgress || {};
      const joinedCTFIds = Object.keys(ctfProgress);

      if (joinedCTFIds.length === 0) {
        setJoinedCTFs([]);
        return;
      }

      const ctfSnap = await getDocs(collection(db, 'ctf'));
      const filtered: CTF[] = [];

      ctfSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (joinedCTFIds.includes(docSnap.id)) {
          filtered.push({
            id: docSnap.id,
            title: data.title,
            format: data.format,
          });
        }
      });

      setJoinedCTFs(filtered);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchJoinedCTFs();
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Your Joined CTFs</h2>

      {joinedCTFs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {joinedCTFs.map((ctf) => (
            <Link
              key={ctf.id}
              href={`/ctf/${ctf.id}/leaderboard`}
              className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
            >
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <p className="font-medium group-hover:underline">{ctf.title}</p>
                <p className="text-xs text-gray-300 mt-1 tracking-wide">
                <span className="uppercase text-white">{ctf.format}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No joined CTFs found.</p>
      )}
    </div>
  );
};

export default RegisteredCTFList;
