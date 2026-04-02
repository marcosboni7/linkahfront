'use client';
import { useEffect, useState } from 'react';
import { 
  Instagram, Linkedin, X, ExternalLink, 
  Loader2, ShieldCheck, Zap 
} from 'lucide-react';

interface UserProfile {
  nome: string;
  bio: string;
  instagram: string;
  linkedin: string;
  email: string;
  foto_perfil?: string; // Campo da foto
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
        setUserData(null);
        try {
          const res = await fetch(`${API_URL}/api/auth/perfil-publico?nome=${encodeURIComponent(userId)}`);
          if (res.ok) {
            const data = await res.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Erro API:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  // Helper para formatar a URL da imagem
  const getAvatarUrl = (foto?: string) => {
    if (!foto || foto === 'null') return null;
    if (foto.startsWith('http')) return foto;
    return `${API_URL}/${foto.replace(/^\//, '')}`;
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-[440px] rounded-[4rem] shadow-2xl overflow-hidden relative border border-slate-50 animate-in fade-in zoom-in duration-300">
        
        {/* BOTÃO FECHAR */}
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/20 hover:bg-white/40 text-white rounded-[1.5rem] transition-all z-20 backdrop-blur-md border border-white/20">
          <X size={20} />
        </button>

        {/* HEADER COLORIDO */}
        <div className="h-36 bg-gradient-to-br from-[#FF4D4D] via-[#FF4D4D] to-[#7000FF] w-full relative" />

        <div className="px-10 pb-12 -mt-14 relative text-slate-900">
          {/* FOTO DE PERFIL */}
          <div className="w-28 h-28 bg-slate-950 rounded-[3rem] border-[6px] border-white flex items-center justify-center shadow-2xl mb-6 overflow-hidden">
            {getAvatarUrl(userData?.foto_perfil) ? (
              <img 
                src={getAvatarUrl(userData?.foto_perfil)!} 
                className="w-full h-full object-cover" 
                alt="Profile" 
              />
            ) : (
              <span className="text-white text-4xl font-black italic">{userId?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center"><Loader2 className="animate-spin text-[#FF4D4D]" size={40} /></div>
          ) : userData ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">{userData.nome}</h3>
                <ShieldCheck size={22} className="text-blue-500" />
              </div>
              
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-6 italic">
                <Zap size={14} className="text-[#FF4D4D]" /> Linkah Certified
              </p>

              {/* BIO */}
              <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-6 border border-slate-100">
                <p className="text-slate-600 font-bold text-sm leading-relaxed">
                  {userData.bio && userData.bio !== 'null' ? `"${userData.bio}"` : "Estudante de tecnologia e entusiasta do Linkah."}
                </p>
              </div>

              {/* REDES SOCIAIS */}
              <div className="space-y-3">
                {/* INSTAGRAM */}
                {userData.instagram && userData.instagram !== 'null' && (
                  <a 
                    href={`https://instagram.com/${userData.instagram.replace('@','')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-pink-50 rounded-2xl hover:bg-pink-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Instagram size={18} className="text-pink-600"/>
                      <span className="text-pink-600 font-black text-[10px] uppercase italic">Instagram</span>
                    </div>
                    <ExternalLink size={14} className="text-pink-300"/>
                  </a>
                )}

                {/* LINKEDIN */}
                {userData.linkedin && userData.linkedin !== 'null' && (
                  <a 
                    href={userData.linkedin.includes('linkedin.com') ? userData.linkedin : `https://linkedin.com/in/${userData.linkedin}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Linkedin size={18} className="text-blue-600"/>
                      <span className="text-blue-600 font-black text-[10px] uppercase italic">LinkedIn</span>
                    </div>
                    <ExternalLink size={14} className="text-blue-300"/>
                  </a>
                )}

                {/* EMAIL (OPCIONAL) */}
                {!userData.instagram && !userData.linkedin && (
                  <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhuma rede social vinculada</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-10 text-slate-400 font-bold uppercase text-xs italic">Perfil não encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
}