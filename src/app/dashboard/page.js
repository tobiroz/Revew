"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Wallet, Rocket, Zap, ChevronRight } from "lucide-react"; // Importamos iconos pro

export default function DashboardEditor() {
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCampanas = async () => {
      const q = query(collection(db, "campaigns"), where("status", "!=", "finished"));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCampanas(docs);
      setLoading(false);
    };
    fetchCampanas();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-blue-500 font-medium animate-pulse">Iniciando ReVew...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 pb-20">
      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* SECCIÓN DE BIENVENIDA */}
        <header className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Panel de Creador</h2>
          <p className="text-slate-500">Explora campañas activas y empieza a monetizar tus clips.</p>
        </header>

        {/* GRID DE CAMPAÑAS */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Rocket size={20} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Campañas Disponibles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campanas.length > 0 ? (
              campanas.map((c) => (
                <div 
                  key={c.id} 
                  className="group relative bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 hover:bg-[#141414] transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-1 shadow-2xl"
                >
                  {/* Badge de Estado */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      c.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                      {c.status === 'active' ? 'En Vivo' : 'Pausada'}
                    </div>
                    <Zap size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {c.name}
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                    Participa y gana hasta <span className="text-slate-200 font-bold">${c.maxPayoutPerUser}</span> por cada video que registres.
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 mb-6">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">CPM</p>
                      <p className="text-lg font-mono font-bold text-white">${c.cpm}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Cupos Libres</p>
                      <p className="text-lg font-mono font-bold text-white">{Math.floor(c.totalBudget / c.maxPayoutPerUser)}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/campana/${c.id}`)}
                    className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all duration-300 group-hover:scale-[1.02]"
                  >
                    PARTICIPAR AHORA
                    <ChevronRight size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Rocket size={40} className="text-slate-700" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Cielos despejados... por ahora</h4>
                <p className="text-slate-500 text-center max-w-xs">No hay campañas disponibles. Mantente atento a las notificaciones.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}