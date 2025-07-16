 // functions/index.ts
  import * as functions from "firebase-functions/v1"
  import * as admin from "firebase-admin";

admin.initializeApp();

export const setCustomClaimsOnSignUp = functions.auth.user().onCreate(async (user) => {
  if (user.email === "admin@cryptoseven.com") {
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    console.log(`Admin claim set for ${user.email}`);
  }
});