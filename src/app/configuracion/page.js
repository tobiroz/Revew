"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { 
  User, Shield, CheckCircle2, Youtube, Instagram, 
  Music2, Link2, XCircle, Moon, Sun, Languages, Camera 
} from "lucide-react";

export default function ConfigPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de Preferencias y Redes
  const [socials, setSocials] = useState({ tiktok: "", youtube: "", instagram: "" });
  const [language, setLanguage] = useState("es");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSocials({
            tiktok: data.tiktokUser || "",
            youtube: data.youtubeUser || "",
            instagram: data.instagramUser || ""
          });
          setLanguage(data.language || "es");
          setTheme(data.theme || "dark");
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  // Actualizar Foto de Perfil
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Aquí iría la lógica de Firebase Storage. 
    // Por ahora, simulamos la actualización en el perfil de Auth
    alert("Sincronizando nueva imagen de perfil...");
    // Ejemplo: const photoURL = await uploadToStorage(file);
    // await updateProfile(auth.currentUser, { photoURL });
  };

  // Actualizar Preferencias (Idioma/Tema)
  const updatePreference = async (field, value) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { [field]: value });
      if (field === "language") setLanguage(value);
      if (field === "theme") setTheme(value);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConnect = (platform) => {
    // Redirección real a OAuth (Simulado para desarrollo)
    const mockUser = prompt(`Iniciando sesión en ${platform}...\nIntroduce tu nombre de usuario:`);
    if (mockUser) {
      updatePlatform(platform, mockUser);
    }
  };

  const handleDisconnect = async (platform) => {
    if (confirm(`¿Desvincular cuenta de ${platform}?`)) {
      updatePlatform(platform, "");
    }
  };

  const updatePlatform = async (platform, value) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { [`${platform}User`]: value });
    setSocials(prev => ({ ...prev, [platform]: value }));
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-blue-500 font-black text-[10px] tracking-[0.3em] uppercase">Cifrando Conexión</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#f1f5f9] text-slate-900'}`}>
      <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24">
        
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">Ajustes</h1>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-2 italic">Configuración de cuenta y entorno</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ASIDE: PERFIL Y ESTILO */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* CARD DE PERFIL DINÁMICO */}
            <div className={`${theme === 'dark' ? 'bg-[#0f0f0f] border-white/5' : 'bg-white border-slate-200'} border rounded-[40px] p-8 shadow-2xl text-center`}>
              <div className="relative group mx-auto mb-6 w-24 h-24">
                <label className="cursor-pointer block">
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  <div className="h-24 w-24 rounded-full border-4 border-black/10 overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl transition-all group-hover:scale-105 group-hover:rotate-3">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-white">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white mb-1" />
                    <span className="text-[8px] font-black uppercase text-white">Editar</span>
                  </div>
                </label>
              </div>

              <h2 className="text-xl font-bold truncate">
                {user?.displayName || user?.email?.split('@')[0]}
              </h2>
              <p className="text-slate-500 text-[11px] mt-1 font-medium italic">
                {socials.tiktok ? `@${socials.tiktok}` : user?.email}
              </p>
            </div>

            {/* PREFERENCIAS DE INTERFAZ */}
            <div className={`${theme === 'dark' ? 'bg-[#0f0f0f] border-white/5' : 'bg-white border-slate-200'} border rounded-[40px] p-8 space-y-8`}>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Languages size={14} /> Idioma
                </label>
                <div className="flex bg-black/20 p-1 rounded-2xl">
                  {['es', 'en'].map((lang) => (
                    <button key={lang} onClick={() => updatePreference('language', lang)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${language === lang ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                      {lang === 'es' ? 'Español' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                   Modo Visual
                </label>
                <div className="flex bg-black/20 p-1 rounded-2xl">
                  <button onClick={() => updatePreference('theme', 'light')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase transition-all ${theme === 'light' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}>
                    <Sun size={14} /> Claro
                  </button>
                  <button onClick={() => updatePreference('theme', 'dark')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase transition-all ${theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
                    <Moon size={14} /> Oscuro
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN: CONEXIONES SOCIALES */}
          <main className="lg:col-span-8">
            <div className={`${theme === 'dark' ? 'bg-[#0f0f0f] border-white/5' : 'bg-white border-slate-200'} border rounded-[45px] p-8 md:p-12 shadow-2xl`}>
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500"><Link2 size={28}/></div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Sincronización</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Validación de creador de contenido</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'tiktok', name: 'TikTok', icon: <Music2 />, color: 'text-[#ff0050]' },
                  { id: 'youtube', name: 'YouTube', icon: <Youtube />, color: 'text-[#ff0000]' },
                  { id: 'instagram', name: 'Instagram', icon: <Instagram />, color: 'text-[#e1306c]' }
                ].map((p) => {
                  const connected = socials[p.id] !== "";
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-6 rounded-[32px] border transition-all ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200 hover:shadow-lg'}`}>
                      <div className="flex items-center gap-6">
                        {!connected && (
                          <div className={`p-4 bg-black rounded-2xl border border-white/10 ${p.color} shadow-md group-hover:scale-110 transition-transform`}>
                            {p.icon}
                          </div>
                        )}
                        <div>
                          <h4 className="font-black text-xs uppercase tracking-widest">{p.name}</h4>
                          {connected ? (
                            <div className="flex items-center gap-2 text-green-500 font-black mt-1 text-[11px] italic">
                              <CheckCircle2 size={14} /> @{socials[p.id]}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Esperando enlace</span>
                          )}
                        </div>
                      </div>

                      {connected ? (
                        <button onClick={() => handleDisconnect(p.id)} className="p-4 bg-red-600/10 text-red-600 rounded-2xl border border-red-600/20 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/5">
                          <XCircle size={22} />
                        </button>
                      ) : (
                        <button onClick={() => handleConnect(p.id)} className="px-8 py-4 bg-blue-600 text-white rounded-[20px] text-[10px] font-black uppercase hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                          Sincronizar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}