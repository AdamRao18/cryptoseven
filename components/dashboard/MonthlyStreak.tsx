'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/database/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FaFire } from 'react-icons/fa';

const MAX_STREAK = 30;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function interpolateColor(streak: number, max: number): string {
  const gray = { r: 158, g: 158, b: 158 };   // #9E9E9E
  const orange = { r: 249, g: 115, b: 22 };  // #F97316

  const t = clamp(streak / max, 0, 1);

  const r = Math.round(gray.r + (orange.r - gray.r) * t);
  const g = Math.round(gray.g + (orange.g - gray.g) * t);
  const b = Math.round(gray.b + (orange.b - gray.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

const MonthlyStreak = () => {
  const [dayStreak, setDayStreak] = useState<number>(1);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const today = getTodayDate();

      if (userSnap.exists()) {
        const data = userSnap.data();
        const lastLogin = data.lastLogin || '';
        let newStreak = data.dayStreak || 1;

        if (lastLogin === today) {
          setDayStreak(newStreak);
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLogin === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        await updateDoc(userRef, {
          dayStreak: newStreak,
          lastLogin: today,
        });

        setDayStreak(newStreak);
      }
    });

    return () => unsubscribe();
  }, []);

  const fireColor = interpolateColor(dayStreak, MAX_STREAK);

  return (
    <div className="relative p-6.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg overflow-hidden">
      {/* Fire Glow Background Circle */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl opacity-40 z-0"
        style={{ backgroundColor: fireColor }}
      />

      {/* Fire Icon */}
      <div className="absolute top-10 right-10 z-10">
        <FaFire
          className="text-[64px] md:text-[80px] transition-all duration-500 drop-shadow-lg"
          style={{ color: fireColor }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-xl md:text-2xl text-white font-semibold mb-2">Monthly Streak</h2>
        <p className="text-5xl md:text-6xl font-extrabold text-orange-400 tracking-tight">
          {dayStreak} <span className="text-white text-3xl">/ {MAX_STREAK}</span>
        </p>
        <p className="text-sm text-gray-400 mt-2">Keep up the momentum!</p>
      </div>
    </div>
  );
};

export default MonthlyStreak;
