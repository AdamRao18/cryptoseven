'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/database/firebase';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';

type Quiz = {
  id: string;
  title: string;
  description?: string;
  type: string;
};

const Page = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'quiz'));
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Quiz, 'id'>),
        }));
        setQuizzes(fetched);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handlePlayNow = async (quizId: string) => {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be signed in to play quizzes.');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    const quizProgress = userData.quizProgress || {};
    const existing = quizProgress[quizId] || {};

    const existingScore = typeof existing.score === 'number' ? existing.score : 0;
    const startedAt = new Date().toISOString();

    const updatedProgress = {
      ...existing,
      score: existingScore, // Keep highest score until quiz is submitted
      startedAt,             // New attempt timestamp
    };

    await setDoc(
      userRef,
      {
        quizProgress: {
          [quizId]: updatedProgress,
        },
      },
      { merge: true }
    );

    router.push(`/quizzes/${quizId}`);
  };

  if (loading) return <div className="p-6 text-white">Loading quizzes...</div>;

  return (
    <div className="gap-6 px-6 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="text-white border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Image */}
            <div className="w-full h-40">
              <img
                src={`/images/${quiz.type}.jpg`}
                alt={quiz.type}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Badge */}
            <div className="px-5 pt-4 flex justify-end">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-600/40">
                {quiz.type}
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between px-5 pb-5 flex-grow">
              <div>
                <h3 className="text-lg font-semibold">{quiz.title}</h3>
                <p className="text-sm text-gray-300 mt-1 line-clamp-3">
                  {quiz.description}
                </p>
              </div>

              <button
                onClick={() => handlePlayNow(quiz.id)}
                className="mt-4 w-full py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:brightness-110 transition duration-300"
              >
                Play Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
