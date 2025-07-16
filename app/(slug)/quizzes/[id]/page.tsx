'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, ShieldX, Trophy, RotateCcw } from "lucide-react";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/database/firebase';
import { getAuth } from 'firebase/auth';
import { useParams, useRouter } from 'next/navigation';

export default function Component() {
  const router = useRouter();
  const rawId = useParams().id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const auth = getAuth();
  const user = auth.currentUser;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>({});
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const q = query(collection(db, 'quizQuestion'), where('quizId', '==', id));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setQuestions(data);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const quizProgress = userData.quizProgress?.[id]?.answeredQuestions || {};
        setClaimedMap(quizProgress);
      }
    };

    loadData();
  }, [id, user]);

  useEffect(() => {
    const claimPoints = async () => {
      if (!quizCompleted || !user || rewardClaimed || !id) return;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const existingQuizProgress = userData.quizProgress?.[id] || {};
      const alreadyClaimed = existingQuizProgress.rewardClaimed === true;

      const newPercentage = parseFloat(((score / questions.length) * 100).toFixed(1));
      const finalScore = alreadyClaimed ? existingQuizProgress.score || 0 : Math.max(existingQuizProgress.score || 0, newPercentage);

      const answeredQuestions = Object.fromEntries(
        questions.map((q, i) => [q.id, answers[i] === q.answer])
      );

      const unclaimedPoints = questions.reduce((acc, q, i) => {
        const correct = answers[i] === q.answer;
        const wasClaimed = existingQuizProgress.answeredQuestions?.[q.id];
        return correct && !wasClaimed ? acc + q.point : acc;
      }, 0);

      const updateData: any = {
        [`quizProgress.${id}.score`]: finalScore,
        [`quizProgress.${id}.completed`]: true,
        [`quizProgress.${id}.answeredQuestions`]: answeredQuestions,
        [`quizProgress.${id}.rewardClaimed`]: true,
        [`quizProgress.${id}.startedAt`]: existingQuizProgress?.startedAt || new Date().toISOString(),
        [`quizProgress.${id}.completedAt`]: new Date().toISOString(),
      };

      if (unclaimedPoints > 0) {
        updateData['cummulativePoint'] = increment(unclaimedPoints);

        const globalRef = doc(db, 'globalLeaderboard', user.uid);
        const globalDoc = await getDoc(globalRef);
        if (globalDoc.exists()) {
          await updateDoc(globalRef, {
            totalQuizPoint: increment(unclaimedPoints)
          });
        } else {
          await setDoc(globalRef, {
            totalQuizPoint: unclaimedPoints,
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
        }
      }

      await updateDoc(userRef, updateData);
      setRewardClaimed(true);
    };

    claimPoints();
  }, [quizCompleted, user, rewardClaimed, id, score, questions, answers]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (selectedAnswer === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuizCompleted(false);
    setAnswers([]);
    setRewardClaimed(false);
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "Excellent! You're a cybersecurity expert!";
    if (percentage >= 60) return "Good job! Keep learning to improve your security knowledge.";
    return "Keep studying! Cybersecurity knowledge is crucial for everyone.";
  };

  if (!questions.length) {
    return <div className="p-6 text-center text-white">Loading quiz...</div>;
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <div className={`text-6xl font-bold ${getScoreColor()}`}>
                {score}/{questions.length}
              </div>
              <div className="text-xl text-gray-300">{Math.round((score / questions.length) * 100)}% Correct</div>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-gray-300">{getScoreMessage()}</p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-lg font-semibold text-white mb-2">Your Performance:</h3>
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                  <span className="text-sm text-gray-300">Question {index + 1}</span>
                  {answers[index] === question.answer ? (
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                  ) : (
                    <ShieldX className="w-5 h-5 text-red-400" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row w-1/2 gap-4">
              <Button onClick={resetQuiz} className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => router.push('/quizzes')} className="w-full bg-slate-600 hover:bg-slate-700 text-white" size="lg">
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-700" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-6 bg-slate-700/30 rounded-lg border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-4">{question.question}</h2>
          </div>

          <div className="grid gap-3">
            {question.options.map((option: string, index: number) => {
              let buttonClass =
                "w-full p-4 text-left transition-all duration-200 border-2 bg-slate-700/30 hover:bg-slate-600/50 text-white";

              if (showResult) {
                if (index === question.answer) {
                  buttonClass += " border-green-500 bg-green-500/20 text-green-300";
                } else if (index === selectedAnswer && index !== question.answer) {
                  buttonClass += " border-red-500 bg-red-500/20 text-red-300";
                } else {
                  buttonClass += " border-slate-600 opacity-50";
                }
              } else if (selectedAnswer === index) {
                buttonClass += " border-purple-500 bg-purple-500/20 text-purple-300";
              } else {
                buttonClass += " border-slate-600 hover:border-purple-400";
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => !showResult && handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-mono font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {showResult && (
            <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === question.answer ? (
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                ) : (
                  <ShieldX className="w-5 h-5 text-red-400" />
                )}
                <span
                  className={`font-semibold ${
                    selectedAnswer === question.answer ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {selectedAnswer === question.answer ? "Correct!" : "Incorrect!"}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{question.explanation}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null || showResult}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              size="lg"
            >
              {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
