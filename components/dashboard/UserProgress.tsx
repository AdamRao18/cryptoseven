'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/database/firebase';
import { getAuth } from 'firebase/auth';

type UserData = {
  roleImage: string;
  role: string;
  username: string;
  cummulativePoint: number;
};

const UserProgress = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.warn('No user signed in');
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn('No user document found');
          setLoading(false);
          return;
        }

        const data = userSnap.data() as UserData;
        let newRole = data.role;

        if (data.cummulativePoint >= 3500 && data.role !== 'hacker') {
          newRole = 'hacker';
        } else if (data.cummulativePoint >= 1500 && data.role !== 'amateur' && data.role !== 'hacker') {
          newRole = 'amateur';
        }

        if (newRole !== data.role) {
          await updateDoc(userRef, {
            role: newRole,
          });
          data.role = newRole;
        }

        if (!data.roleImage || data.roleImage.trim() === '') {
          data.roleImage = `/images/${data.role}.png`;
        }

        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="text-white text-center">Loading...</div>;
  if (!userData) return <div className="text-red-500 text-center">No user data found.</div>;

  const roleThresholds: Record<string, number> = {
    noobies: 1500,
    amateur: 3500,
    hacker: 3500,
  };

  const currentThreshold = roleThresholds[userData.role.toLowerCase()] || 1500;
  const progressPercent = Math.min((userData.cummulativePoint / currentThreshold) * 100, 100);
  const remainingPoints = Math.max(currentThreshold - userData.cummulativePoint, 0);

  return (
    <div className="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-400">
            {userData.roleImage ? (
              <img
                src={userData.roleImage}
                alt="Role"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                N/A
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{userData.username}</h3>
            <p className="text-sm text-gray-400">{userData.cummulativePoint} pts</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-base font-bold text-cyan-400 capitalize">{userData.role}</p>
          <p className="text-xs text-gray-400">
            {remainingPoints > 0
              ? `${remainingPoints} pts to rank up`
              : 'Max rank reached'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative w-full h-2 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">{progressPercent.toFixed(1)}%</p>
      </div>
    </div>
  );
};

export default UserProgress;
