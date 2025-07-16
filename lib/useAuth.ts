import { useEffect, useState } from "react"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { auth, db } from "@/database/firebase"
import { doc, getDoc } from "firebase/firestore"

type ExtendedUser = FirebaseUser & { role?: string }

export const useAuthRedirect = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        const userData = userDoc.data()

        setUser({ ...firebaseUser, role: userData?.role || "noobies" })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
