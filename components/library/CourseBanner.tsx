'use client';

import React, { useEffect, useState } from 'react';
import {
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from '@/database/firebase';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  type: string;
  modules: string[];
}

interface Module {
  id: string;
  title?: string;
  duration: number;
  videoUrl?: string;
}

interface Props {
  courseId: string;
  onEnrollChange: (enrolled: boolean) => void;
  onModuleSelect: (module: Module) => void;
}

const typeColor: Record<Course['type'], string> = {
  'Red Teaming': 'bg-red-500/10 text-red-400 border border-red-600/40',
  'Blue Teaming': 'bg-blue-500/10 text-blue-300 border border-blue-400/30'
};

const categoryColor: Record<Course['category'], string> = {
  Skills: 'bg-orange-500/10 text-orange-300 border border-orange-600/40',
  Path: 'bg-violet-500/10 text-violet-300 border border-violet-600/40'
};

const CourseBanner: React.FC<Props> = ({ courseId, onEnrollChange, onModuleSelect }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseStatus, setCourseStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseAndModules = async () => {
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      if (!courseSnap.exists()) return;

      const courseData = courseSnap.data() as Course;
      setCourse(courseData);

      const q = query(collection(db, 'modules'), where('courseId', '==', courseId));
      const querySnapshot = await getDocs(q);

      const moduleMap: Record<string, Module> = {};
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        moduleMap[docSnap.id] = {
          id: docSnap.id,
          title: data.title || 'Untitled Module',
          duration: data.duration || 0,
          videoUrl: data.videoUrl,
        };
      });

      const orderedModules: Module[] = courseData.modules
        .map((id) => moduleMap[id])
        .filter(Boolean);

      const durationSum = orderedModules.reduce((sum, m) => sum + (m.duration || 0), 0);

      setModules(orderedModules);
      setTotalDuration(durationSum);

      if (orderedModules.length > 0) {
        onModuleSelect(orderedModules[0]);
      }
    };

    fetchCourseAndModules();
  }, [courseId, onModuleSelect]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setUserId(user.uid);
    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      const progress = data.courseProgress?.[courseId];
      const enrolled = !!progress;
      setIsEnrolled(enrolled);
      onEnrollChange(enrolled);

      const videoProgress = progress?.videoProgress || {};
      setCourseStatus(progress?.courseStatus || null);

      const totalWatched = Object.values(videoProgress).reduce(
        (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0),
        0
      );

      const storedDuration = progress?.totalDuration ?? totalDuration;
      const bufferMinutes = 3;
      const isComplete = storedDuration > 0 && totalWatched >= storedDuration - bufferMinutes;

      if (enrolled && isComplete && progress?.courseStatus !== 'completed') {
        await updateDoc(userRef, {
          [`courseProgress.${courseId}.courseStatus`]: 'completed',
        });
        setCourseStatus('completed');
      }
    });

    return () => unsubscribe();
  }, [courseId, onEnrollChange, totalDuration]);

  const handleEnroll = async () => {
    if (!userId || !course) return;

    const userRef = doc(db, 'users', userId);

    const progressData = {
      modulesCompleted: [],
      currentModule: course.modules[0],
      lastWatched: '',
      rewardClaimed: false,
      videoProgress: {},
      videoDuration: {},
      courseStatus: 'enrolled',
      totalDuration,
    };

    await updateDoc(userRef, {
      [`courseProgress.${courseId}`]: progressData,
    });

    setIsEnrolled(true);
    setCourseStatus('enrolled');
    onEnrollChange(true);
  };

  if (!course)
    return <div className="text-center text-gray-400 mt-10">Loading course...</div>;

  const hours = Math.floor(totalDuration / 60);
  const minutes = Math.floor(totalDuration % 60);
  const isButtonDisabled = isEnrolled || courseStatus === 'completed';

  return (
    <section className="py-30 px-6 md:px-10 bg-gradient-to-r from-black via-black to-indigo-700 text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left */}
        <div>
          <h1 className="text-4xl font-semibold mb-4">{course.title}</h1>
          <div className="flex flex-wrap gap-3 mb-4 text-sm">
            <span className="px-3 py-1">{course.modules.length} Modules</span>
            <span className="px-3 py-1">{hours}h {minutes}m</span>
            <span className={`px-3 py-1 rounded-full ${typeColor[course.type]}`}>{course.type}</span>
            <span className={`px-3 py-1 rounded-full ${categoryColor[course.category]}`}>{course.category}</span>
          </div>

          <p className="text-slate-300 mb-6 leading-relaxed">{course.description}</p>

          <button
            onClick={handleEnroll}
            disabled={isButtonDisabled}
            className={`px-6 py-2 rounded-lg text-white font-medium transition ${
              isButtonDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {courseStatus === 'completed' ? 'Completed' : isEnrolled ? 'Enrolled' : 'Enroll in this course'}
          </button>
        </div>

        {/* Right */}
        <div className="relative bg-white/10 border border-white/10 backdrop-blur p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Module List</h2>
          {modules.length === 0 ? (
            <p className="text-slate-400">Loading modules...</p>
          ) : (
            <ul className="list-decimal list-inside space-y-2 text-sm text-slate-200">
              {modules.map((mod, idx) => (
                <li
                  key={mod.id}
                  className="hover:text-indigo-300 cursor-pointer"
                  onClick={() => onModuleSelect(mod)}
                >
                  Module {idx + 1}: {mod.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default CourseBanner;
