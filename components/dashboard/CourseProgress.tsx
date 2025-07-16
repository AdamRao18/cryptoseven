'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/database/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

type Course = {
  id: string;
  title: string;
  category: string;
  courseImage?: string;
};

type ProgressItem = {
  courseId: string;
  title: string;
  image?: string;
  percent: number;
  category: string;
};

const CourseProgress = () => {
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProgress = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const courseProgress = userData.courseProgress || {};

      // Only keep enrolled (not completed) courseIds
      const enrolledCourseIds = Object.entries(courseProgress)
        .filter(([_, progress]: any) => progress?.courseStatus === 'enrolled')
        .map(([courseId]) => courseId);

      if (enrolledCourseIds.length === 0) {
        setProgressList([]);
        return;
      }

      // Get course metadata
      const courseSnap = await getDocs(collection(db, 'courses'));
      const courseMap: Record<string, Course> = {};
      courseSnap.forEach((docSnap) => {
        const data = docSnap.data();
        courseMap[docSnap.id] = {
          id: docSnap.id,
          title: data.title,
          category: data.category,
          courseImage: data.courseImage || '',
        };
      });

      const progressItems: ProgressItem[] = [];

      for (const courseId of enrolledCourseIds) {
        const courseData = courseMap[courseId];
        const progress = courseProgress[courseId];
        if (!courseData || !progress) continue;

        const videoProgress = progress.videoProgress || {};
        const totalDuration = progress.totalDuration || 0;

        const totalWatched = Object.values(videoProgress).reduce(
          (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0),
          0
        );

        const percent =
          totalDuration > 0
            ? parseFloat(((totalWatched / totalDuration) * 100).toFixed(1))
            : 0;

        progressItems.push({
          courseId,
          title: courseData.title,
          image: courseData.courseImage,
          percent,
          category: courseData.category,
        });
      }

      setProgressList(progressItems);
    };

    fetchProgress();
  }, []);

  if (progressList.length === 0) {
    return <p className="text-gray-400 text-center px-6">No ongoing courses found.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {progressList.map((course) => (
        <div
          key={course.courseId}
          role="button"
          onClick={() => router.push(`/courses/${course.courseId}`)}
          className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="relative">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-40 object-cover"
            />
            <span className="absolute top-2 right-2 bg-slate-900/80 text-xs text-white px-3 py-1 rounded-full shadow">
              {course.category}
            </span>
          </div>
          <div className="p-4">
            <p className="text-base font-semibold mb-2">{course.title}</p>
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500"
                style={{ width: `${course.percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-300 text-right mt-1">{course.percent}%</p>
          </div>
        </div>
      ))}

      {/* See More Card */}
      <div
        role="button"
        onClick={() => router.push('/courses')}
        className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all flex flex-col justify-center items-center cursor-pointer"
      >
        <img
          src="/images/more-courses.png"
          alt="See More"
          className="w-full h-40 object-cover rounded-t-xl"
        />
        <div className="flex flex-col items-center justify-center mt-7 mb-4">
          <p className="text-base font-semibold">More Courses</p>
          <ArrowRight className="text-blue-400 mt-1" size={18} />
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
