"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [birthDate, setBirthDate] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        birthDate: birthDate,
        onboardingComplete: true
      });
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-xl max-w-md w-full border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center">¡Bienvenido a ReVew!</h2>
        <p className="text-gray-400 mb-4 text-center">Necesitamos verificar tu edad para continuar.</p>
        
        <label className="block text-sm font-medium mb-2 text-gray-300">Fecha de Nacimiento</label>
        <input 
          type="date" 
          required
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white mb-6"
        />
        
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
          Finalizar Registro
        </button>
      </form>
    </div>
  );
}