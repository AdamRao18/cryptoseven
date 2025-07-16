'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardCopy } from 'lucide-react';
import { auth, db } from '@/database/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const ReferralCard = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // 🔁 Fetch referral code for logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setReferralCode(data.referralCode || null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = () => {
    if (!referralCode) return;

    const referralLink = `https://cryptoseven.com/referral?code=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  return (
    <div
      className="relative p-7 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg overflow-hidden text-white"
      style={{ backgroundImage: "url('/images/referral-bg.svg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-slate-900/20 z-0 rounded-2xl" />

      <div className="relative z-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">Referral Program</h2>
        <p className="text-sm text-gray-300 mb-5">
          Invite your friends & earn exclusive rewards!
        </p>

        <button
          onClick={handleCopy}
          disabled={!referralCode}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all text-white text-sm font-medium shadow-md disabled:opacity-50"
        >
          <ClipboardCopy size={16} />
          {referralCode ? 'Copy Referral Link' : 'Loading...'}
        </button>
      </div>
    </div>
  );
};

export default ReferralCard;