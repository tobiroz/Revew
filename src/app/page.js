"use client";
import LoginButton from "@/components/LoginButton";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-6xl font-bold mb-4">ReVew</h1>
      <p className="text-xl mb-8 text-gray-400">Edita, sube y cobra por tus vistas.</p>
      <LoginButton />
    </main>
  );
}