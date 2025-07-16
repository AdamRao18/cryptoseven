'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/database/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
}

const CompletedCourse = () => {
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const courseProgress = userData.courseProgress || {};

      // 🔍 Step 1: Find all courseIds where status is 'completed'
      const completedCourseIds = Object.entries(courseProgress)
        .filter(([_courseId, progress]: any) => progress?.courseStatus === 'completed')
        .map(([courseId]) => courseId);

      if (completedCourseIds.length === 0) {
        setCompletedCourses([]);
        return;
      }

      // 🔍 Step 2: Fetch ALL courses once
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const results: Course[] = [];

      coursesSnap.forEach((docSnap) => {
        if (completedCourseIds.includes(docSnap.id)) {
          const data = docSnap.data();
          results.push({
            id: docSnap.id,
            title: data.title,
            category: data.category,
          });
        }
      });

      setCompletedCourses(results);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchCompletedCourses();
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Your Completed Courses</h2>

      {completedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
            >
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <p className="font-medium group-hover:underline">{course.title}</p>
                <p className="text-xs text-gray-300 mt-1 uppercase tracking-wider">{course.category}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No completed courses found.</p>
      )}
    </div>
  );
};

export default CompletedCourse;
