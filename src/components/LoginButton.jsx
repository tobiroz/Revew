"use client";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Referencia al documento del usuario
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // ES UN USUARIO NUEVO: Lo creamos y mandamos a Onboarding
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "editor", // Rol por defecto
          balance: 0,
          onboardingComplete: false,
          createdAt: new Date()
        });
        router.push("/onboarding");
      } else {
        // USUARIO EXISTENTE: Leemos sus datos y redirigimos
        const userData = userSnap.data();
        
        if (userData.role === "admin") {
          router.push("/admin");
        } else if (!userData.onboardingComplete) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error en Login:", error);
    }
  };

  return (
    <button 
      onClick={handleLogin}
      className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
    >
      Entrar con Google
    </button>
  );
}