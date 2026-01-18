"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShieldCheck, LogOut, Wallet, Settings, User } from "lucide-react";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // Estado para el dropdown
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!user) return null;

  return (
    <nav className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* LADO IZQUIERDO: LOGO */}
        <Link href="/dashboard" className="text-2xl font-black tracking-tighter italic hover:opacity-80 transition">
          RE<span className="text-blue-500">VEW</span>
        </Link>

        {/* LADO DERECHO: NAVEGACIÓN Y PERFIL */}
        <div className="flex items-center gap-6">
          
          <div className="hidden md:flex items-center gap-6 mr-4">
            <Link href="/dashboard" className="text-sm font-bold text-slate-400 hover:text-white transition flex items-center gap-2">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link href="/wallet" className="text-sm font-bold text-slate-400 hover:text-white transition flex items-center gap-2">
              <Wallet size={18} /> Billetera
            </Link>
          </div>

          {isAdmin && (
            <Link href="/admin" className="hidden md:flex items-center gap-2 text-[10px] font-black bg-blue-600/10 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
              <ShieldCheck size={16} /> ADMIN PANEL
            </Link>
          )}

          <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

          {/* MENÚ DE PERFIL (DESPLEGABLE) */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/10 flex items-center justify-center font-bold text-sm hover:scale-105 transition-transform active:scale-95"
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
            </button>

            {menuOpen && (
              <>
                {/* Capa invisible para cerrar el menú al hacer click fuera */}
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
                
                <div className="absolute right-0 mt-3 w-56 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-150">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Bienvenido</p>
                    <p className="text-sm font-bold text-white truncate">Hola, {user?.displayName || "Creador"}</p>
                  </div>

                  <div className="p-2">
                    <Link 
                      href="/configuracion" 
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
                    >
                      <Settings size={18} /> Configuraciones
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition mt-1"
                    >
                      <LogOut size={18} /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}