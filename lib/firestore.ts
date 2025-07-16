"use client"

import { db } from "@/database/firebase"
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore"
import { courseSchema, moduleSchema, quizSchema, quizQuestionSchema, ctfSchema, ctfQuestionSchema } from "@/database/schema"
import { z } from "zod"

// ========== TYPES ==========
type Course = z.infer<typeof courseSchema>
type Module = z.infer<typeof moduleSchema>
type Quiz = z.infer<typeof quizSchema>
export type QuizQuestion = z.infer<typeof quizQuestionSchema>
export type CTF = z.infer<typeof ctfSchema>
export type CTFQuestion = z.infer<typeof ctfQuestionSchema>

// ========== COURSE CRUD ==========

export const fetchCourses = async (): Promise<Course[]> => {
  const querySnapshot = await getDocs(collection(db, "courses"))
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Course[]
}

export const addCourse = async (data: unknown, id: string): Promise<void> => {
  const validated = courseSchema.parse(data)
  await setDoc(doc(db, "courses", id), validated)
}

export const updateCourse = async (id: string, data: unknown): Promise<void> => {
  const validated = courseSchema.partial().parse(data)
  await updateDoc(doc(db, "courses", id), validated)
}

// ========== MODULE CRUD ==========

export const fetchModulesByCourseId = async (courseId: string): Promise<Module[]> => {
  const q = query(collection(db, "modules"), where("courseId", "==", courseId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Module[]
}

export const addModule = async (courseId: string, data: unknown): Promise<string> => {
  const validated = moduleSchema.omit({ id: true }).parse(data)
  const docRef = doc(collection(db, "modules"))
  await setDoc(docRef, {
    ...validated,
    courseId,
    id: docRef.id,
  })

  const currentModuleIds = await getCourseModuleIds(courseId)
  await updateDoc(doc(db, "courses", courseId), {
    modules: [...currentModuleIds, docRef.id],
  })

  return docRef.id
}

export const updateModule = async (id: string, data: unknown): Promise<void> => {
  const validated = moduleSchema.partial().parse(data)
  await updateDoc(doc(db, "modules", id), validated)
}

export const deleteModule = async (courseId: string, moduleId: string): Promise<void> => {
  await deleteDoc(doc(db, "modules", moduleId))
  const moduleIds = await getCourseModuleIds(courseId)
  await updateDoc(doc(db, "courses", courseId), {
    modules: moduleIds.filter((id) => id !== moduleId),
  })
}

// ========== QUIZ CRUD ==========

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  const snapshot = await getDocs(collection(db, "quiz"))
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Quiz[]
}

export const addQuiz = async (data: unknown): Promise<void> => {
  const validated = quizSchema.omit({ id: true }).parse(data)
  const newDocRef = doc(collection(db, "quiz"))
  await setDoc(newDocRef, { ...validated, id: newDocRef.id })
}

export const updateQuiz = async (id: string, data: unknown): Promise<void> => {
  const validated = quizSchema.partial().parse(data)
  await updateDoc(doc(db, "quiz", id), validated)
}

export const deleteQuiz = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "quiz", id))
}

// ========== QUIZ QUESTION CRUD ==========

export const fetchQuizQuestionsByQuizId = async (quizId: string): Promise<QuizQuestion[]> => {
  const q = query(collection(db, "quizQuestion"), where("quizId", "==", quizId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as QuizQuestion[]
}

export const addQuizQuestion = async (data: unknown): Promise<string> => {
  const validated = quizQuestionSchema.omit({ id: true }).parse(data)
  const docRef = doc(collection(db, "quizQuestion"))
  const id = docRef.id

  // 1. Add quizQuestion document
  await setDoc(docRef, { ...validated, id })

  // 2. Append to parent quiz's quizQuestion array
  const existingIds = await getQuizQuestionIds(validated.quizId)
  await updateDoc(doc(db, "quiz", validated.quizId), {
    quizQuestion: [...existingIds, id],
  })

  return id
}

const getQuizQuestionIds = async (quizId: string): Promise<string[]> => {
  const quizSnap = await getDoc(doc(db, "quiz", quizId))
  const quizData = quizSnap.data()
  return (quizData?.quizQuestion as string[]) || []
}

export const updateQuizQuestion = async (id: string, data: unknown): Promise<void> => {
  const validated = quizQuestionSchema.partial().parse(data)
  await updateDoc(doc(db, "quizQuestion", id), validated)
}

export const deleteQuizQuestion = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "quizQuestion", id))
}

// ========== CTF CRUD ==========

export const fetchCTFs = async (): Promise<CTF[]> => {
  const snapshot = await getDocs(collection(db, "ctf"))
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as CTF[]
}

export const createCTF = async (data: any): Promise<void> => {
  const docRef = doc(collection(db, "ctf"))
  const enrichedData = {
    ...data,
    id: docRef.id,
    type: "public", // default
    players: [], // empty array
    questions: [], // empty array
    categories: [], // empty array
    createdAt: new Date().toISOString(),
  }

  const validated = ctfSchema.parse(enrichedData)
  await setDoc(docRef, validated)
}

export const updateCTF = async (id: string, data: unknown): Promise<void> => {
  const validated = ctfSchema.partial().parse(data)
  await updateDoc(doc(db, "ctf", id), validated)
}

export const deleteCTF = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "ctf", id))
}

// ========== CTF QUESTION CRUD ==========

export const fetchCTFQuestionsByCTFId = async (ctfId: string): Promise<CTFQuestion[]> => {
  const q = query(collection(db, "ctfQuestion"), where("ctfId", "==", ctfId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as CTFQuestion[]
}

export const addCTFQuestion = async (data: unknown): Promise<string> => {
  const validated = ctfQuestionSchema.omit({ id: true }).parse(data)
  const docRef = doc(collection(db, "ctfQuestion"))
  const id = docRef.id

  // Remove undefined fields manually to avoid FirebaseError
  const sanitized = Object.fromEntries(
    Object.entries({ ...validated, id }).filter(([_, v]) => v !== undefined)
  )

  await setDoc(docRef, sanitized)

  const existingIds = await getCTFQuestionIds(validated.ctfId)
  await updateDoc(doc(db, "ctf", validated.ctfId), {
    questions: [...existingIds, id],
  })

  return id
}


const getCTFQuestionIds = async (ctfId: string): Promise<string[]> => {
  const ctfSnap = await getDoc(doc(db, "ctf", ctfId))
  const ctfData = ctfSnap.data()
  return (ctfData?.questions as string[]) || []
}

export const updateCTFQuestion = async (id: string, data: unknown): Promise<void> => {
  const validated = ctfQuestionSchema.partial().parse(data)
  await updateDoc(doc(db, "ctfQuestion", id), validated)
}

export const deleteCTFQuestion = async (ctfId: string, questionId: string): Promise<void> => {
  await deleteDoc(doc(db, "ctfQuestion", questionId))

  const currentIds = await getCTFQuestionIds(ctfId)
  await updateDoc(doc(db, "ctf", ctfId), {
    questions: currentIds.filter((id) => id !== questionId),
  })
}

// ========== HELPER ==========

const getCourseModuleIds = async (courseId: string): Promise<string[]> => {
  const courseSnap = await getDoc(doc(db, "courses", courseId))
  const courseData = courseSnap.data()
  return (courseData?.modules as string[]) || []
}
