"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { 
  Zap, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  PlayCircle
} from "lucide-react";

export default function HomePage() {
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Referencia a la colección "campanas"
    // Traemos las que están "activas" y las ordenamos por las más recientes
    const q = query(
      collection(db, "campanas"),
      where("estado", "==", "activa"),
      orderBy("createdAt", "desc")
    );

    // 2. Escucha en tiempo real (Real-time Updates)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampanas(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error al leer campañas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      
      {/* NAVBAR SIMPLE */}
      <nav className="border-b border-white/5 p-6 backdrop-blur-md sticky top-0 z-50 bg-[#050505]/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={18} fill="white" />
            </div>
            <span className="text-xl font-black italic uppercase tracking-tighter">ReVew</span>
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
            Login
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        
        {/* HERO SECTION */}
        <header className="mb-16">
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
            Campañas <span className="text-blue-600 underline decoration-blue-600/20">Disponibles</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em]">
            Selecciona un proyecto y empieza a ganar por tus vistas
          </p>
        </header>

        {/* LISTADO DE CAMPAÑAS */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : campanas.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-[3rem]">
             <p className="text-slate-500 uppercase font-black italic tracking-widest">No hay campañas activas en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campanas.map((item) => (
              <div 
                key={item.id}
                className="group bg-[#0f0f0f] border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-600/50 transition-all duration-500 shadow-2xl relative overflow-hidden"
              >
                {/* Indicador de Cupo */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-blue-600/10 px-3 py-1 rounded-full border border-blue-600/20">
                  <Users size={12} className="text-blue-500" />
                  <span className="text-[10px] font-black text-blue-500 uppercase">
                    {item.cupoTotal - (item.editoresActuales || 0)} Cupos
                  </span>
                </div>

                <h3 className="text-2xl font-black italic uppercase mb-6 pr-12 leading-none">
                  {item.nombre}
                </h3>

                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Pago Máximo</p>
                      <p className="text-3xl font-black italic text-white leading-none">${item.maxPorUsuario}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Vistas Meta</p>
                      <p className="text-xl font-black text-slate-300 leading-none">{item.vistasMeta?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                       <Clock size={16} className="text-blue-500" />
                       <div>
                         <p className="text-[8px] font-bold text-slate-500 uppercase">Duración</p>
                         <p className="text-xs font-black">{item.diasDuracion} Días</p>
                       </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                       <TrendingUp size={16} className="text-blue-500" />
                       <div>
                         <p className="text-[8px] font-bold text-slate-500 uppercase">CPM</p>
                         <p className="text-xs font-black">${item.pagoPorMil}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-white text-black py-5 rounded-2xl font-black italic uppercase tracking-widest text-sm flex items-center justify-center gap-3 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  Postularse <PlayCircle size={18} fill="currentColor" className="text-transparent group-hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}