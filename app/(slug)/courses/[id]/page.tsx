'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CourseBanner from '@/components/library/CourseBanner';
import VideoPlayer from '@/components/library/VideoPlayer';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/database/firebase';
import { Toaster, toast } from 'sonner';

type Module = {
  id: string;
  title?: string;
  duration?: number;
  videoUrl?: string;
  order?: number;
};

type Course = {
  id: string;
  title: string;
  point: number;
};

const Page = () => {
  const { id } = useParams();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || typeof id !== 'string') return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      const courseProgress = data.courseProgress || {};
      const progress = courseProgress[id];

      if (progress?.courseStatus === 'completed' && !progress?.rewardClaimed) {
        const courseRef = doc(db, 'courses', id);
        const courseSnap = await getDoc(courseRef);
        if (!courseSnap.exists()) return;

        const courseData = courseSnap.data() as Course;
        const reward = courseData.point || 0;

        await updateDoc(userRef, {
          cummulativePoint: (data.cummulativePoint || 0) + reward,
          [`courseProgress.${id}.rewardClaimed`]: true,
        });

        toast.success(`Course completed! You earned ${reward} points!`);
      }
    });

    return () => unsubscribe();
  }, [id]);

  if (!id || typeof id !== 'string') {
    return <div className="text-center text-gray-500 mt-10">Invalid Course ID</div>;
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toaster position="top-right" richColors closeButton duration={4000} />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full">
          <CourseBanner
            courseId={id}
            onEnrollChange={setIsEnrolled}
            onModuleSelect={setSelectedModule}
          />
        </div>
      </div>

      {isEnrolled && selectedModule ? (
        <VideoPlayer courseId={id} module={selectedModule} />
      ) : (
        <div className="text-center mt-10 text-gray-400">
          You must enroll in this course to view the videos.
        </div>
      )}
    </div>
  );
};

export default Page;
