"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminGuard({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verificar el rol en Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setAuthorized(true);
        } else {
          router.push("/dashboard"); // No es admin, fuera
        }
      } else {
        router.push("/"); // No está logueado, fuera
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-blue-500 font-mono">
      VERIFICANDO CREDENCIALES...
    </div>
  );

  return authorized ? children : null;
}