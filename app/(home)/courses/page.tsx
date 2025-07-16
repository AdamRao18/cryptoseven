'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/database/firebase';
import { courseSchema } from '@/database/schema';
import { z } from 'zod';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type Course = z.infer<typeof courseSchema>;

const levelOrder: Record<Course['level'], number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const levelColor: Record<Course['level'], string> = {
  Beginner: 'bg-green-500/10 text-green-400 border border-green-600/40',
  Intermediate: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/40',
  Advanced: 'bg-red-500/10 text-red-400 border border-red-600/40',
};

const Page = () => {
  const [courses, setCourses] = useState<(Course & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const fetchedCourses = querySnapshot.docs.map((doc) =>
          courseSchema.parse({ id: doc.id, ...doc.data() })
        );

        fetchedCourses.sort(
          (a, b) => levelOrder[a.level] - levelOrder[b.level]
        );

        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="p-6 text-white">Loading courses...</div>;

  return (
    <div className="px-6 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="text-white border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Full-width Course Image */}
            <div className="w-full h-43">
              <img
                src={course.courseImage}
                alt={course.title}
                className="w-full h-50 object-cover"
              />
            </div>

            {/* Main Content */}
            <div className="flex flex-col justify-between h-full flex-grow px-5 py-4">
              <div className="mb-3 flex justify-end">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColor[course.level]}`}
                >
                  {course.level}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-300 mt-1 line-clamp-3">{course.description}</p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Avatar>
                  <AvatarImage
                    src={course.instructorAvatar || '/default-avatar.png'}
                  />
                  <AvatarFallback className="text-black">
                    {course.instructorName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">
                    {course.instructorName || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400">Instructor</div>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="px-5 pb-5">
              <Link href={`/courses/${course.id}`} className="w-full block">
                <button className="w-full py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:brightness-110 transition duration-300">
                  View Course
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
