'use client';

import { useEffect, useState } from 'react';
import { 
  Instagram, 
  Linkedin, 
  Mail, 
  X, 
  ExternalLink, 
  UserCircle, 
  Loader2, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface UserProfile {
  nome: string;
  bio: string;
  instagram: string;
  linkedin: string;
  email: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

const API_URL = 'https://api-linkah.onrender.com';

export function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserProfile = async () => {
        setLoading(true);
        try {
          // Rota que busca os dados públicos do produtor/usuário
          const res = await fetch(`${API_URL}/api/auth/perfil-publico/${userId}`);
          if (res.ok) {
            const data = await res.json();
            setUserData(data);
          } else {
            console.error("Perfil não encontrado");
          }
        } catch (error) {
          console.error("Erro ao conectar com a API:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-[440px] rounded-[4rem] shadow-2xl overflow-hidden relative border border-slate-50 animate-in fade-in zoom-in duration-300">
        
        {/* BOTÃO FECHAR */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-white/20 hover:bg-white/40 text-white rounded-[1.5rem] transition-all z-20 backdrop-blur-md border border-white/20"
        >
          <X size={20} />
        </button>

        {/* HEADER VISUAL (CAPA) */}
        <div className="h-36 bg-gradient-to-br from-[#FF4D4D] via-[#FF4D4D] to-[#7000FF] w-full relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        <div className="px-10 pb-12 -mt-14 relative">
          {/* FOTO DE PERFIL COM ESTILO LINKAH */}
          <div className="w-28 h-28 bg-slate-950 rounded-[3rem] border-[6px] border-white flex items-center justify-center shadow-2xl mb-6 relative group overflow-hidden">
            <UserCircle className="text-white group-hover:scale-110 transition-transform" size={56} />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-6">
              <Loader2 className="animate-spin text-[#FF4D4D]" size={40} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
                Sincronizando Perfil...
              </span>
            </div>
          ) : userData ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* NOME E VERIFICADO */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
                  {userData.nome || 'Usuário'}
                </h3>
                <ShieldCheck size={22} className="text-blue-500 fill-blue-50" />
              </div>
              
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-8 italic">
                <Mail size={14} className="text-[#FF4D4D]" /> 
                {userData.email}
              </p>

              {/* BIO BOX */}
              <div className="bg-slate-50 p-8 rounded-[3rem] mb-8 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Zap size={40} className="text-slate-900" />
                </div>
                <p className="text-slate-600 font-bold text-sm leading-relaxed relative z-10">
                  {userData.bio ? `"${userData.bio}"` : "Este produtor ainda não definiu uma bio profissional."}
                </p>
              </div>

              {/* REDES SOCIAIS GRID */}
              <div className="grid grid-cols-1 gap-4">
                {userData.instagram && (
                  <a 
                    href={`https://instagram.com/${userData.instagram.replace('@', '')}`} 
                    target="_blank"
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-pink-50 to-white hover:from-pink-100 rounded-[2rem] transition-all group border border-pink-100/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-pink-600">
                        <Instagram size={20} />
                      </div>
                      <span className="text-pink-600 font-black text-[11px] uppercase tracking-widest italic">Instagram</span>
                    </div>
                    <ExternalLink size={16} className="text-pink-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                )}

                {userData.linkedin && (
                  <a 
                    href={userData.linkedin.startsWith('http') ? userData.linkedin : `https://${userData.linkedin}`} 
                    target="_blank"
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 rounded-[2rem] transition-all group border border-blue-100/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                        <Linkedin size={20} />
                      </div>
                      <span className="text-blue-600 font-black text-[11px] uppercase tracking-widest italic">LinkedIn</span>
                    </div>
                    <ExternalLink size={16} className="text-blue-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                )}

                {!userData.instagram && !userData.linkedin && (
                  <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest italic flex items-center justify-center gap-2">
                      <Globe size={14} /> Sem redes sociais vinculadas
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
               <p className="text-slate-400 font-black uppercase text-xs italic tracking-widest">
                  Ops! Perfil não encontrado.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}