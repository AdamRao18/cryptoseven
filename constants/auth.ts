"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GithubAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/database/firebase";
import { toast } from "sonner";
import { userSchema } from "@/database/schema";
import { nanoid } from "nanoid";

const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

function generateReferralCode() {
  return nanoid(10);
}

type AuthFormProps = {
  isSignup: boolean;
  email: string;
  password: string;
  username?: string;
  confirmPassword?: string;
};

export async function handleFormSubmit({
  isSignup,
  email,
  password,
  username,
  confirmPassword,
}: AuthFormProps): Promise<boolean> {
  try {
    if (isSignup) {
      if (!username || !confirmPassword) {
        toast.error("Please fill in all fields.");
        return false;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return false;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const newUser = userSchema.parse({
        uid: user.uid,
        username,
        email: user.email!,
        role: email === "admin@cryptoseven.com" ? "admin" : "noobies",
        roleImage: "",
        avatarPicture: "",
        authProvider: "email",
        cummulativePoint: 0,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        dayStreak: 1,
        courseProgress: {},
        ctfProgress: {},
        quizProgress: {},
        referralCode: generateReferralCode(),
        referredBy: "",
        referrals: [],
        referralTierRewardClaimed: {},
      });

      await setDoc(doc(db, "users", user.uid), newUser);
      toast.success("Account created successfully!");
      return true;
    } else {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date().toISOString(),
      });

      toast.success("Signed in successfully!");
      return true;
    }
  } catch (error: any) {
    toast.error(error.message || "Authentication error.");
    return false;
  }
}

export async function handleOAuthLogin(
  providerType: "google" | "github",
  isSignup: boolean
): Promise<boolean> {
  const provider = providerType === "google" ? googleProvider : githubProvider;

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      if (!isSignup) {
        toast.error("No account found for this provider. Please sign up first.");
        return false;
      }

      const newUser = userSchema.parse({
        uid: user.uid,
        username: user.displayName || user.email!,
        email: user.email!,
        role: user.email === "admin@cryptoseven.com" ? "admin" : "noobies",
        roleImage: "",
        avatarPicture: user.photoURL || "",
        authProvider: providerType,
        cummulativePoint: 0,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        dayStreak: 1,
        courseProgress: {},
        ctfProgress: {},
        quizProgress: {},
        referralCode: generateReferralCode(),
        referredBy: "",
        referrals: [],
        referralTierRewardClaimed: {},
      });

      await setDoc(userRef, newUser);
      toast.success(`Account created with ${providerType}`);
      return true;
    } else {
      if (isSignup) {
        toast.error("User already registered. Please sign in instead.");
        return false;
      }

      await updateDoc(userRef, {
        lastLogin: new Date().toISOString(),
      });

      toast.success(`Signed in with ${providerType}`);
      return true;
    }
  } catch (error: any) {
    toast.error(error.message || `Sign in with ${providerType} failed.`);
    return false;
  }
}
