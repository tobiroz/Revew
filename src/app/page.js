"use client";
import LoginButton from "@/components/LoginButton";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { Zap, Users, TrendingUp, Clock, PlayCircle } from "lucide-react";

export default function HomePage() {
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Referencia a "campaigns" (en inglés para coincidir con tus reglas)
    const q = query(
      collection(db, "campaigns"),
      where("estado", "==", "activa"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampanas(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error al leer:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">ReVew</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Explorar Campañas</p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-t-2 border-blue-600 rounded-full"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campanas.map((c) => (
              <div key={c.id} className="bg-[#0f0f0f] border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-600/50 transition-all group relative overflow-hidden">
                
                <div className="absolute top-6 right-6 bg-blue-600/10 px-3 py-1 rounded-full border border-blue-600/20">
                  <span className="text-[10px] font-black text-blue-500 uppercase">
                    {c.cupoTotal - (c.editoresActuales || 0)} Cupos Libres
                  </span>
                </div>

                <h3 className="text-2xl font-black italic uppercase mb-6 pr-10">{c.nombre}</h3>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Pago Máximo</p>
                      <p className="text-4xl font-black italic text-white">${c.maxPorUsuario}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                      <Clock size={16} className="text-blue-500" />
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Plazo</p>
                        <p className="text-xs font-black">{c.diasDuracion} Días</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                      <TrendingUp size={16} className="text-blue-500" />
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Meta Vistas</p>
                        <p className="text-xs font-black">{c.vistasMeta?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 bg-white text-black py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                  Aceptar Campaña <PlayCircle size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <LoginButton />
    </div>
  );
}