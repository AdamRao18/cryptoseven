'use client';

import React, { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { auth, db } from '@/database/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Page = () => {
  const [userData, setUserData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setUserData({ uid: user.uid, ...snapshot.data() });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = async () => {
    if (!userData) return;

    const referralLink = `https://cryptoseven.com/join?ref=${userData.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);

    // Optional: Increment referralClicks in Firestore
    const userRef = doc(db, 'users', userData.uid);
    await updateDoc(userRef, {
      referralClicks: (userData.referralClicks || 0) + 1,
    });

    setUserData((prev: any) => ({
      ...prev,
      referralClicks: (prev?.referralClicks || 0) + 1,
    }));

    setTimeout(() => setCopied(false), 2000);
  };

  if (!userData) {
    return <div className="text-white p-6">Loading referral data...</div>;
  }

  const referralLink = `https://cryptoseven.com/join?ref=${userData.referralCode}`;
  const invitedCount = userData.referralClicks || 0;
  const joinedCount = userData.referrals?.length || 0;
  const pointsEarned = joinedCount * 100; // assuming 100 points per join

  return (
    <div className="px-6 space-y-10 text-white">
      {/* Referral Link Section */}
      <div className="rounded-xl bg-white/5 backdrop-blur-md p-6 border border-white/10 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>

        <div className="flex">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-white/10 border border-white/20 rounded-l-md px-4 py-2 text-sm text-white"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-r-md text-sm transition"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-3 text-center mt-6 gap-2">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{invitedCount}</div>
            <div className="text-sm text-slate-400">Friends Invited</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">{joinedCount}</div>
            <div className="text-sm text-slate-400">Joined</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">{pointsEarned}</div>
            <div className="text-sm text-slate-400">Points Earned</div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Referral Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Reward 1 */}
          <RewardCard title="1 Friend" desc="Earn 100 points" progress={Math.min((joinedCount / 1) * 100, 100)} />
          {/* Reward 5 */}
          <RewardCard title="5 Friends" desc="500 points + Badge" progress={Math.min((joinedCount / 5) * 100, 100)} />
          {/* Reward 10 */}
          <RewardCard title="10 Friends" desc="1200 points + Premium" progress={Math.min((joinedCount / 10) * 100, 100)} />
        </div>
      </div>
    </div>
  );
};

const RewardCard = ({ title, desc, progress }: { title: string; desc: string; progress: number }) => (
  <div className="rounded-xl bg-white/5 border border-white/10 p-5 shadow-md">
    <div className="text-lg font-semibold text-white">{title}</div>
    <div className="text-sm text-slate-400 mb-3">{desc}</div>
    <div className="h-2 bg-gray-700 rounded-full">
      <div
        className="h-2 bg-gradient-to-r from-cyan-400 to-emerald-500 transition-all duration-500 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export default Page;
