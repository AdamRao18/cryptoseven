import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "./firebaseAdmin"; // ✅ import your initialized adminApp

export async function getUserRoleFromSession(): Promise<string | null> {
  const cookieStore = cookies();
  const sessionCookie = (await cookieStore).get("__session")?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAuth(adminApp); // ✅ use the adminApp
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return (decoded as any).role || "noobies";
  } catch (error) {
    console.error("Session decode error:", error);
    return null;
  }
}
