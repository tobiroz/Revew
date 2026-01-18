"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Zap, 
  Target, 
  Users, 
  Calendar, 
  BarChart3, 
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Info
} from "lucide-react";

export default function AdminPanel() {
  const [formData, setFormData] = useState({
    nombre: "",
    presupuestoTotal: "",
    cpm: "0.90",
  });

  const [calculos, setCalculos] = useState({
    cuposDisponibles: 0,
    gananciaMaxPorEditor: 0,
    vistasMeta: 0,
    duracionDias: 0,
    esValido: false
  });

  useEffect(() => {
    const presupuesto = parseFloat(formData.presupuestoTotal) || 0;
    const cpm = parseFloat(formData.cpm) || 0;

    if (presupuesto > 0 && cpm > 0) {
      let topeIndividual = 0;
      let cupos = 0;

      // --- ALGORITMO DE BALANCE DE CALIDAD (ReVew v3.0) ---
      
      // 1. Definimos un "Pago Base" que crece con el presupuesto
      // Usamos una raíz cuadrada para que el pago suba de forma balanceada
      // $100 -> ~$25-30 | $500 -> ~$50-60 | $1000 -> ~$100
      let pagoSugerido = 15 + (Math.sqrt(presupuesto) * 2.7);

      // 2. Aplicamos topes de seguridad
      if (pagoSugerido < 20) pagoSugerido = 20; // Mínimo absoluto $20
      if (pagoSugerido > 1000) pagoSugerido = 1000; // Máximo absoluto $1000

      // 3. Calculamos cupos basados en ese pago sugerido
      cupos = Math.floor(presupuesto / pagoSugerido);

      // 4. Ajuste final: El pago real es el presupuesto dividido los cupos
      // (Para que no sobre dinero)
      if (cupos > 0) {
        topeIndividual = presupuesto / cupos;
      }

      // 5. Límite de viralidad (Max 1000 editores)
      if (cupos > 1000) {
        cupos = 1000;
        topeIndividual = presupuesto / 1000;
      }

      // --- VISTAS META ---
      const vistas = (topeIndividual / cpm) * 1000;

      // --- DÍAS (Tu escala exacta) ---
      let diasFinales = 0;
      if (presupuesto <= 100) diasFinales = 3;
      else if (presupuesto <= 500) diasFinales = 3 + ((presupuesto - 100) * 7 / 400); 
      else if (presupuesto <= 1000) diasFinales = 10 + ((presupuesto - 500) * 5 / 500);
      else diasFinales = 15 + ((presupuesto - 1000) / 200);

      setCalculos({
        cuposDisponibles: cupos,
        gananciaMaxPorEditor: topeIndividual.toFixed(2),
        vistasMeta: Math.round(vistas),
        duracionDias: Math.max(1, Math.round(diasFinales)),
        esValido: cupos > 0
      });
    } else {
      setCalculos(prev => ({ ...prev, esValido: false }));
    }
  }, [formData.presupuestoTotal, formData.cpm]);

  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!calculos.esValido) return;

    try {
      await addDoc(collection(db, "campanas"), {
        nombre: formData.nombre,
        presupuestoTotal: parseFloat(formData.presupuestoTotal),
        pagoPorMil: parseFloat(formData.cpm),
        maxPorUsuario: parseFloat(calculos.gananciaMaxPorEditor),
        cupoTotal: calculos.cuposDisponibles,
        editoresActuales: 0,
        diasDuracion: calculos.duracionDias,
        vistasMeta: calculos.vistasMeta,
        estado: "activa",
        createdAt: serverTimestamp()
      });
      alert("Campaña publicada con éxito.");
      setFormData({ nombre: "", presupuestoTotal: "", cpm: "0.90" });
    } catch (error) {
      console.error(error);
      alert("Error al conectar con la base de datos.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans tracking-tight">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-600/20">
              <LayoutDashboard size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Admin ReVew</h1>
              <p className="text-slate-500 font-bold text-[9px] tracking-[0.4em] uppercase mt-2 italic">Balance Proporcional de Calidad</p>
            </div>
          </div>
        </header>

        <form onSubmit={handlePublicar} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 bg-[#0f0f0f] border border-white/5 p-10 rounded-[3rem] space-y-10">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 italic">Campaña / Marca</label>
                <input 
                  type="text" required placeholder="Ej. Tesla Cyber Launch"
                  value={formData.nombre}
                  className="w-full bg-black border border-white/10 rounded-2xl p-6 text-xl font-bold outline-none focus:border-blue-600 transition-all"
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Presupuesto USD</label>
                  <input 
                    type="number" required placeholder="500"
                    value={formData.presupuestoTotal}
                    className="w-full bg-black border border-white/10 rounded-2xl p-6 text-2xl font-black outline-none focus:border-blue-600 transition-all placeholder:opacity-20"
                    onChange={(e) => setFormData({...formData, presupuestoTotal: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-4">CPM Estándar</label>
                  <input 
                    type="number" step="0.01" value={formData.cpm}
                    className="w-full bg-black border border-white/10 rounded-2xl p-6 text-2xl font-black text-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, cpm: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-start gap-4 shadow-inner">
              <ShieldCheck className="text-blue-500 shrink-0 mt-1" size={20} />
              <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed italic">
                El algoritmo está optimizando el <span className="text-white">pago individual</span> para atraer mejores creadores según el volumen de presupuesto.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-blue-600 text-black p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <TrendingUp className="absolute -right-10 -top-10 w-64 h-64 opacity-10 rotate-12 transition-transform" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-60 mb-1">Editores</p>
                    <p className="text-6xl font-black italic tracking-tighter leading-none">{calculos.cuposDisponibles}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-60 mb-1">Días</p>
                    <p className="text-6xl font-black italic tracking-tighter leading-none">{calculos.duracionDias}</p>
                  </div>
                </div>

                <div className="bg-black/10 p-8 rounded-[2.5rem] backdrop-blur-md space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase opacity-60">Pago Máximo</p>
                    <p className="text-3xl font-black tracking-tight">${calculos.gananciaMaxPorEditor}</p>
                  </div>
                  <div className="border-t border-black/10 pt-4 flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase opacity-60">Vistas Meta</p>
                    <p className="text-xl font-black">{calculos.vistasMeta.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!calculos.esValido}
              className={`w-full py-8 rounded-[3rem] font-black text-2xl italic uppercase tracking-widest transition-all shadow-xl ${
                calculos.esValido 
                ? "bg-white text-black hover:bg-green-500 hover:text-white active:scale-95" 
                : "bg-white/5 text-white/10 cursor-not-allowed border border-white/10 font-medium"
              }`}
            >
              Publicar Ahora
            </button>
            
            <div className="flex items-center justify-center gap-2 text-slate-600 italic font-bold text-[10px] uppercase tracking-widest">
              <Info size={12} /> Smart Balance Engine v3.0
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}