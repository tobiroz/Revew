"use client";
import { useEffect, useState, use } from "react"; // Añadimos 'use'
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { 
  Calculator, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  PlayCircle
} from "lucide-react";
import Link from "next/link";

export default function CampanaDetalle({ params: paramsPromise }) {
  // 1. Desempaquetamos los params de forma segura para Next.js 14/15
  const params = use(paramsPromise);
  
  const [campana, setCampana] = useState(null);
  const [userEarnings, setUserEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [vistasSimuladas, setVistasSimuladas] = useState(1000);

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) return;

      try {
        setLoading(true);
        // 2. Obtener datos de la campaña
        const campRef = doc(db, "campanas", params.id);
        const campSnap = await getDoc(campRef);

        if (campSnap.exists()) {
          setCampana(campSnap.data());
          
          // 3. Obtener ganancias acumuladas (solo si el usuario está logueado)
          if (auth.currentUser) {
            const q = query(
              collection(db, "participaciones"),
              where("userId", "==", auth.currentUser.uid),
              where("campanaId", "==", params.id)
            );
            const querySnapshot = await getDocs(q);
            let total = 0;
            querySnapshot.forEach((doc) => {
              total += doc.data().gananciaAcumulada || 0;
            });
            setUserEarnings(total);
          }
        } else {
          console.error("Campaña no existe en la base de datos");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id]); // Quitamos auth.currentUser de aquí para evitar loops, el login se maneja solo al cargar

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-blue-500 italic">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      CARGANDO DATOS DE CAMPAÑA...
    </div>
  );

  if (!campana) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-2xl font-black mb-4 uppercase italic text-red-500">Error: Campaña no encontrada</h2>
        <p className="text-slate-500 text-sm mb-6">El ID <span className="text-blue-500">{params?.id}</span> no existe o no tienes permisos.</p>
        <Link href="/dashboard" className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase text-[10px]">
            Volver al Panel
        </Link>
    </div>
  );

  // Cálculos de la Calculadora con valores dinámicos de Firestore
  const PAGO_POR_MIL = campana.pagoPorMil || 0;
  const MAX_POR_USUARIO = campana.maxPorUsuario || 0;
  const gananciaCalculada = (vistasSimuladas / 1000) * PAGO_POR_MIL;
  const esMaximoAlcanzado = gananciaCalculada >= MAX_POR_USUARIO;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Volver al Panel</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-10">
            <header>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">Activa</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">ID: {params.id.slice(0, 8)}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">
                {campana.nombre}
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                {campana.descripcion}
              </p>
            </header>

            <section className="bg-[#0f0f0f] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Tu acumulado en esta campaña</h3>
                    <p className="text-4xl font-black tabular-nums">
                      ${userEarnings} <span className="text-slate-600 text-xl italic">/ ${MAX_POR_USUARIO}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 text-xs font-black italic mb-1">
                      {MAX_POR_USUARIO > 0 ? Math.round((userEarnings / MAX_POR_USUARIO) * 100) : 0}%
                    </p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Límite de Creador</p>
                  </div>
                </div>

                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-1000 ease-out"
                    style={{ width: `${MAX_POR_USUARIO > 0 ? Math.min((userEarnings / MAX_POR_USUARIO) * 100, 100) : 0}%` }}
                  />
                </div>
                
                <p className="mt-4 text-[9px] text-slate-500 font-medium leading-relaxed italic">
                  * Una vez alcances los ${MAX_POR_USUARIO}, podrás seguir subiendo videos pero no acumularán más saldo para esta campaña específica.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-[#0f0f0f] rounded-3xl border border-white/5">
                <CheckCircle2 className="text-blue-500 mb-3" size={20} />
                <h4 className="text-[10px] font-black uppercase text-slate-500 mb-1">Hashtag Necesario</h4>
                <p className="font-bold text-white tracking-tight">{campana.hashtag || "#ReVewApp"}</p>
              </div>
              <div className="p-6 bg-[#0f0f0f] rounded-3xl border border-white/5">
                <PlayCircle className="text-blue-500 mb-3" size={20} />
                <h4 className="text-[10px] font-black uppercase text-slate-500 mb-1">Mención</h4>
                <p className="font-bold text-white tracking-tight">Etiquetar a la marca</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0f0f0f] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full group-hover:bg-blue-600/10 transition-colors"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-600/10 rounded-xl text-blue-500"><Calculator size={20} /></div>
                <h3 className="text-sm font-black italic uppercase tracking-widest">Calculadora de Ganancias</h3>
              </div>

              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Vistas Proyectadas</p>
                  <p className="text-5xl font-black tabular-nums tracking-tighter">
                    {vistasSimuladas.toLocaleString()}
                  </p>
                </div>

                <div className="relative py-4">
                  <input 
                    type="range" min="1000" max="100000" step="1000"
                    value={vistasSimuladas}
                    onChange={(e) => setVistasSimuladas(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-3 text-[8px] font-black text-slate-700 uppercase">
                    <span>1k</span>
                    <span>100k</span>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border transition-all ${esMaximoAlcanzado ? 'bg-green-500/5 border-green-500/20' : 'bg-black border-white/5'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Ganancia Estimada</p>
                      <p className={`text-4xl font-black ${esMaximoAlcanzado ? 'text-green-500' : 'text-white'}`}>
                        ${esMaximoAlcanzado ? MAX_POR_USUARIO : gananciaCalculada.toFixed(2)}
                      </p>
                    </div>
                    {esMaximoAlcanzado && (
                      <div className="bg-green-500 text-black text-[8px] font-black px-2 py-1 rounded italic">LÍMITE MÁX.</div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                    <span className="text-[10px] font-bold text-slate-500 italic">Pago por cada 1,000 vistas</span>
                    <span className="text-[10px] font-black text-blue-500">${PAGO_POR_MIL}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full bg-white text-black py-6 rounded-[30px] font-black italic uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group">
              Registrar mi Video
              <PlayCircle size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-2 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
              <AlertCircle size={16} className="text-orange-500 shrink-0" />
              <p className="text-[9px] text-orange-200/60 font-medium italic">
                Asegúrate de tener tu cuenta de TikTok vinculada en configuración para que el trackeo sea automático.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}