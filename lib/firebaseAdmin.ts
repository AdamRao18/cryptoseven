import { initializeApp, cert, getApps, App } from "firebase-admin/app";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export const adminApp: App =
  getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApps()[0];
