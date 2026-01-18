"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Wallet() {
  const [paypalEmail, setPaypalEmail] = useState("");
  const saldoMock = 0.00; // Esto luego vendrá de userData.balance

  const solicitarRetiro = async () => {
    await addDoc(collection(db, "payouts"), {
      userId: auth.currentUser.uid,
      amount: saldoMock,
      paypalEmail: paypalEmail,
      status: "pending", // El admin lo marcará como "paid"
      requestedAt: new Date()
    });
    alert("Solicitud enviada. El admin procesará tu pago manualmente.");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 w-full max-w-md text-center">
        <p className="text-gray-400">Saldo Cobrable</p>
        <h1 className="text-5xl font-extrabold text-green-400 my-4">${saldoMock}</h1>
        
        <div className="mt-8 text-left">
          <label className="text-sm text-gray-400">Tu PayPal para recibir el pago:</label>
          <input 
            type="email" 
            onChange={(e) => setPaypalEmail(e.target.value)}
            className="w-full p-3 bg-black border border-gray-700 rounded-lg mt-2 mb-4"
            placeholder="correo@ejemplo.com"
          />
          <button 
            onClick={solicitarRetiro}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition"
          >
            Solicitar Retiro Web
          </button>
        </div>
      </div>
    </div>
  );
}