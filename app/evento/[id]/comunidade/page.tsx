'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, Loader2, LogOut, Users, 
  MessageSquare, Crown, Zap, Star
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { UserProfileModal } from '@/app/dashboard/UserProfileModal'; 

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const EMOJIS_STATUS = ['✨', '🔥', '🚀', '😴', '💡', '🎮', '🍕', '💎'];

// --- HELPERS BLINDADOS PARA FOTO ---
const getUserPhotoUrl = (user: any ) => {
  if (!user) return DEFAULT_FOTO;
  
  // Se for uma string direta (caso do payload de mensagem)
  if (typeof user === 'string') {
    if (user.length > 5 && user !== 'null') return user;
    return DEFAULT_FOTO;
  }
  
  // Lista exaustiva de possíveis campos de imagem que o backend pode enviar
  const campos = ['foto', 'avatar', 'foto_perfil', 'usuario_foto', 'image', 'profile_photo', 'url_foto', 'foto_url'];
  
  // 1. Tenta buscar no objeto raiz
  for (const c of campos) {
    if (user[c] && typeof user[c] === 'string' && user[c].length > 5 && user[c] !== 'null') return user[c];
  }

  // 2. Tenta buscar dentro de sub-objetos comuns (data ou user)
  const subObjetos = ['data', 'user', 'usuario'];
  for (const sub of subObjetos) {
    if (user[sub]) {
      for (const c of campos) {
        if (user[sub][c] && typeof user[sub][c] === 'string' && user[sub][c].length > 5 && user[sub][c] !== 'null') {
          return user[sub][c];
        }
      }
    }
  }
  
  return DEFAULT_FOTO;
};

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto.trim() === '' || foto === undefined) return DEFAULT_FOTO;
  
  // Se já for uma URL completa (http, data:image, blob ), retorna ela mesma
  if (/^(https?:\/\/|blob:|data: )/.test(foto)) return foto;
  
  // Se for um caminho relativo, limpa as barras e concatena com a API
  const baseUrl = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');
  
  return `${baseUrl}/${cleanPath}`;
};

export default function ComunidadePage() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  // Estados de Dados
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');
  
  // Estados de Personalização
  const [meuStatus, setMeuStatus] = useState('✨');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Autenticação e Recuperação de Foto
  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem('@Linkah:User');
      if (!userStr) return router.push('/site/login');
      
      try {
        let user = JSON.parse(userStr);
        
        // Se não tem foto no storage, tenta buscar na API para garantir que apareça
        if (user.email && !user.avatar && !user.foto_perfil) {
          const res = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            const foto = data.avatar || data.foto_perfil;
            if (foto) {
              user = { ...user, avatar: foto };
              localStorage.setItem('@Linkah:User', JSON.stringify(user));
            }
          }
        }
        
        setDadosUsuario(user);
      } catch (e) {
        router.push('/site/login');
      }
      setCarregando(false);
    };
    init();
  }, [router]);

  // 2. Sync de Dados (Polling) - Corrigido para garantir carregamento
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;
    
    const sync = async () => {
      try {
        const minhaFoto = getUserPhotoUrl(dadosUsuario);
        const [resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}&status=${meuStatus}`)
        ]);

        if (resOn.ok) {
            const onlineData = await resOn.json();
            if (Array.isArray(onlineData)) {
              setUsuariosOnline(onlineData.filter((u: any) => (u.usuario_nome || u.nome) !== dadosUsuario.nome));
            }
        }
        
        if (resMsg.ok) {
          const msgs = await resMsg.json();
          if (Array.isArray(msgs)) {
            setMensagens(msgs);
          }
        }
      } catch (e) { console.error("Erro no Sync:", e); }
    };

    sync();
    const interval = setInterval(sync, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario, meuStatus]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  // --- AÇÕES ---
  const handleOpenProfile = (userName: string) => {
    setSelectedUserId(userName);
    setIsModalOpen(true);
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;
    
    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: getUserPhotoUrl(dadosUsuario),
      texto: novoTexto,
      status: meuStatus,
      tipo: 'chat'
    };
    
    setNovoTexto('');
    
    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
      });
    } catch (e) {
      console.error("Erro ao enviar mensagem:", e);
    }
  };

  if (carregando) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-red-500" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden font-sans">
      {isModalOpen && <UserProfileModal {...({ isOpen: isModalOpen, onClose: () => setIsModalOpen(false), userId: selectedUserId } as any)} />}

      {/* SIDEBAR COM SELETOR DE STATUS */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white shadow-sm z-30">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-slate-900 font-black uppercase text-[11px] tracking-widest italic flex items-center gap-2">
            <Users size={16} className="text-red-500" /> {t?.members || 'Membros'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* CARD DO MEU PERFIL */}
          <div className="relative p-5 bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <img 
                  src={getImagemUrl(getUserPhotoUrl(dadosUsuario))} 
                  className="w-14 h-14 rounded-[1.4rem] object-cover border-2 border-red-500/50"
                  alt="Minha Foto"
                />
                <div className="absolute -bottom-1 -right-1 bg-white shadow-xl w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-slate-900">
                  {meuStatus}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-sm italic tracking-tight">{dadosUsuario?.nome}</span>
                <span className="text-[9px] text-red-400 font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Online
                </span>
              </div>
            </div>

            {showEmojiPicker && (
              <div className="absolute inset-0 bg-slate-900/98 backdrop-blur-md z-20 flex flex-wrap items-center justify-center gap-3 p-4 animate-in fade-in zoom-in duration-200">
                {EMOJIS_STATUS.map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => { setMeuStatus(emoji); setShowEmojiPicker(false); }}
                    className="text-2xl hover:scale-125 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 my-2 mx-4" />

          {/* LISTA DE OUTROS MEMBROS */}
          {usuariosOnline.map((u, i) => (
            <div key={i} onClick={() => handleOpenProfile(u.usuario_nome || u.nome)} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.8rem] cursor-pointer group transition-all relative">
              <div className="relative">
                <img src={getImagemUrl(getUserPhotoUrl(u))} className="w-11 h-11 rounded-[1.1rem] object-cover shadow-sm group-hover:rotate-2 transition-transform" alt="User" />
                <span className="absolute -top-1 -right-1 text-xs drop-shadow-sm">{u.status || '✨'}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-700 text-sm">{u.usuario_nome || u.nome}</span>
                {u.is_host && <span className="text-[8px] text-amber-500 font-black uppercase tracking-tighter flex items-center gap-1"><Crown size={10} /> Organizador</span>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT PRINCIPAL */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
               <h1 className="font-black uppercase tracking-widest text-[11px] text-slate-400 italic leading-none">Chat Público</h1>
               <p className="text-[10px] font-bold text-slate-800 mt-1 uppercase tracking-tight">Evento Ativo</p>
            </div>
          </div>
          <button onClick={() => router.back()} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <LogOut size={20} />
          </button>
        </header>

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FDFDFF] scrollbar-thin scrollbar-thumb-slate-200">
          {mensagens.map((m, i) => {
            const souEu = m.usuario_nome === dadosUsuario?.nome;
            const isHost = m.usuario_nome === "Marcos Boni" || m.is_host; 

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-4 items-end animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                {!souEu && (
                  <div className="relative group">
                    <img 
                      src={getImagemUrl(getUserPhotoUrl(m.usuario_foto || m))} 
                      onClick={() => handleOpenProfile(m.usuario_nome)} 
                      className={`w-10 h-10 rounded-[1.2rem] object-cover cursor-pointer group-hover:scale-110 shadow-md transition-all ${isHost ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`} 
                      alt="Msg User"
                    />
                    <span className="absolute -top-2 -right-2 text-xs drop-shadow-sm">{m.status || '✨'}</span>
                  </div>
                )}
                
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    {!souEu && <span className="text-[9px] font-black uppercase text-slate-400 italic tracking-tighter">{m.usuario_nome}</span>}
                    {isHost && (
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-tighter shadow-lg border border-amber-300">
                        <Crown size={8} fill="currentColor" /> HOST
                      </span>
                    )}
                  </div>

                  {/* BALÃO DE MENSAGEM */}
                  <div className={`p-4 rounded-[1.8rem] shadow-sm ${souEu ? 'bg-red-500 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>
                    <p className="text-sm leading-relaxed font-medium">{m.texto}</p>
                  </div>
                </div>

                {souEu && (
                  <div className="relative group">
                    <img 
                      src={getImagemUrl(getUserPhotoUrl(dadosUsuario))} 
                      className="w-10 h-10 rounded-[1.2rem] object-cover shadow-md" 
                      alt="Me" 
                    />
                    <span className="absolute -top-2 -right-2 text-xs drop-shadow-sm">{meuStatus}</span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* INPUT DE MENSAGEM */}
        <form onSubmit={enviarMensagem} className="p-6 bg-white border-t border-slate-50 flex gap-4 items-center">
          <input 
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Escreva sua mensagem..."
            className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-red-500/20 transition-all outline-none font-medium"
          />
          <button type="submit" className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95">
            <Send size={20} />
          </button>
        </form>
      </main>
    </div>
  );
}
