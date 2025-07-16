import { z } from 'zod';

// ========== USER ==========
export const userSchema = z.object({
  uid: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['noobies', 'amateur', 'hacker', 'admin']),
  roleImage: z.string().optional(),
  avatarPicture: z.string(),
  authProvider: z.string(),
  cummulativePoint: z.number(),
  lastLogin: z.string(),
  createdAt: z.string(),
  dayStreak: z.number(),

  courseProgress: z.record(
    z.string(),
    z.object({
      currentModule: z.string(),
      totalDuration: z.string(),
      modulesCompleted: z.array(z.string()),
      rewardClaimed: z.boolean().optional(),
      courseStatus: z.enum(['enroll', 'enrolled', 'completed']).optional(),
      videoProgress: z.record(z.string(), z.number()).optional(),
      videoDuration: z.record(z.string(), z.number()).optional(),
    })
  ).optional(),

  ctfProgress: z.record(
    z.string(), // ctfId
    z.object({
      score: z.number().default(0),
      capturedFlags: z.array(z.string()).optional(), // question IDs
      questionsSolved: z.record(z.string(), z.boolean()).optional(), // questionId: true/false
      rewardClaimed: z.boolean().optional(),
      ctfStatus: z.enum(['registered', 'in-progress', 'completed']).optional(),
      joinedAt: z.string().optional(),
      submittedAt: z.string().optional(),
    })
  ).optional(),

  quizProgress: z.record(
  z.string(), // quizId
  z.object({
    score: z.number().default(0),
    completed: z.boolean().optional(),
    answeredQuestions: z.record(z.string(), z.boolean()).optional(), // questionId: true/false
    rewardClaimed: z.boolean().optional(),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
  })
).optional(),


  // Referrals
  referralCode: z.string(),
  referredBy: z.string().optional(),
  referrals: z.array(z.string()).optional(),
  referralTierRewardClaimed: z
    .object({
      1: z.boolean().optional(),
      5: z.boolean().optional(),
      10: z.boolean().optional(),
    })
    .optional(),
});

// ========== COURSE ==========
export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  courseImage: z.string().optional(),
  instructorName: z.string(),
  instructorAvatar: z.string().optional(),
  category: z.string(),
  type: z.string(),
  modules: z.array(z.string()),
  point: z.number(),
});

// ========== MODULE ==========
export const moduleSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  videoUrl: z.string().url(),
  duration: z.number().nonnegative(),
  order: z.number(),
});

// ========== QUIZ ==========
export const quizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['mcq', 'drag-and-drop']),
  quizQuestion: z.array(z.string()).optional(),
});

// ========== QUIZ QUESTION ==========
export const quizQuestionSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  answer: z.number(),
  explanation: z.string(),
  point: z.number(),
});

// ========== CTF ==========
export const ctfSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string().url(),
  startDate: z.string(),
  endDate: z.string(),
  type: z.enum(['public', 'private']),
  format: z.enum(['jeopardy', 'attack-defense']),
  players: z.array(z.string()),
  questions: z.array(z.string()),
  status: z.enum(['upcoming', 'active', 'completed']),
  categories: z.array(z.string()),
  createdAt: z.string(),
});

// ========== CTF QUESTION ==========
export const ctfQuestionSchema = z.object({
  id: z.string(),
  ctfId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  points: z.number(),
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  flagHash: z.string(),
  hints: z.string().optional(),
  secretMessage: z.string().optional(),
  fileUrl: z.string().url().optional(),
});

// ========== CTF LEADERBOARD ==========
export const ctfLeaderboardEntrySchema = z.object({
  userId: z.string(),
  username: z.string(),
  ctfId: z.string(),
  avatarPicture: z.string(),
  score: z.number(),
  rank: z.number(),
});

// ========== GLOBAL LEADERBOARD ==========
export const globalLeaderboardEntrySchema = z.object({
  userId: z.string(),
  username: z.string(),
  avatarPicture: z.string(),
  totalQuizPoint: z.number(),
  totalCTFPoint: z.number(),
  totalPoint: z.number(),
  rank: z.number(),
});

// ========== FORUM POST ==========
export const forumPostSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  likes: z.array(z.string()),
  comments: z.array(z.object({
    id: z.string(),
    postId: z.string(),
    userId: z.string(),
    username: z.string(),
    userAvatar: z.string(),
    content: z.string(),
    createdAt: z.string(),
  })),
  });