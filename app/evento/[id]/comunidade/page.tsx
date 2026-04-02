'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, Loader2, LogOut, Users, 
  MessageSquare, Crown, Zap, Star
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import {UserProfileModal} from '@/app/dashboard/UserProfileModal'; 

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const EMOJIS_STATUS = ['✨', '🔥', '🚀', '😴', '💡', '🎮', '🍕', '💎'];

// --- HELPERS ---
const getUserPhotoUrl = (user: any) => {
  if (!user) return DEFAULT_FOTO;
  const campos = ['avatar', 'foto_perfil', 'usuario_foto', 'foto', 'image', 'profile_photo'];
  for (const c of campos) {
    if (user[c] && typeof user[c] === 'string' && user[c].trim() !== '' && user[c] !== 'null') return user[c];
  }
  return DEFAULT_FOTO;
};

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto.trim() === '' || foto === DEFAULT_FOTO) return DEFAULT_FOTO;
  if (/^(https?:\/\/|blob:|data:)/.test(foto)) return foto;
  return `${API_URL.replace(/\/$/, '')}/${foto.replace(/^\//, '')}`;
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

  // 1. Autenticação
  useEffect(() => {
    const user = localStorage.getItem('@Linkah:User');
    if (!user) return router.push('/site/login');
    setDadosUsuario(JSON.parse(user));
    setCarregando(false);
  }, [router]);

  // 2. Sync de Dados (Polling)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;
    const sync = async () => {
      try {
        const minhaFoto = getUserPhotoUrl(dadosUsuario);
        const [resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}&status=${meuStatus}`)
        ]);
        if (resOn.ok) setUsuariosOnline((await resOn.json()).filter((u: any) => (u.usuario_nome || u.nome) !== dadosUsuario.nome));
        if (resMsg.ok) setMensagens(await resMsg.json());
      } catch (e) { console.error(e); }
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
    if (!novoTexto.trim()) return;
    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: getUserPhotoUrl(dadosUsuario),
      texto: novoTexto,
      status: meuStatus, // Enviamos o humor atual na mensagem
      tipo: 'chat'
    };
    setNovoTexto('');
    await fetch(`${API_URL}/api/comunidades/enviar`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    });
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
          {/* CARD DO MEU PERFIL (HABBO VIBE) */}
          <div className="relative p-5 bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <img 
                  src={getImagemUrl(getUserPhotoUrl(dadosUsuario))} 
                  className="w-14 h-14 rounded-[1.4rem] object-cover border-2 border-red-500/50"
                />
                <div className="absolute -bottom-1 -right-1 bg-white shadow-xl w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-slate-900">
                  {meuStatus}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-sm italic tracking-tight">{dadosUsuario.nome}</span>
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
                <img src={getImagemUrl(getUserPhotoUrl(u))} className="w-11 h-11 rounded-[1.1rem] object-cover shadow-sm group-hover:rotate-2 transition-transform" />
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
            const souEu = m.usuario_nome === dadosUsuario.nome;
            // Marcos Boni ou qualquer flag de host vinda do banco
            const isHost = m.usuario_nome === "Marcos Boni" || m.is_host; 

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-4 items-end animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                {!souEu && (
                  <div className="relative group">
                    <img 
                      src={getImagemUrl(m.usuario_foto)} 
                      onClick={() => handleOpenProfile(m.usuario_nome)} 
                      className={`w-10 h-10 rounded-[1.2rem] object-cover cursor-pointer group-hover:scale-110 shadow-md transition-all ${isHost ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`} 
                    />
                    <span className="absolute -top-2 -right-2 text-xs drop-shadow-md">{m.status || '✨'}</span>
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
                  <div className={`p-4 rounded-[1.8rem] shadow-sm relative transition-all ${
                    isHost 
                      ? 'bg-white border-2 border-amber-400 shadow-[0_4px_15px_rgba(251,191,36,0.15)] ring-1 ring-amber-100' 
                      : souEu 
                        ? 'bg-red-500 text-white rounded-br-none shadow-xl shadow-red-100' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                  }`}>
                    {/* Partícula de Brilho para Host */}
                    {isHost && <Star size={8} className="absolute -top-2 -right-1 text-amber-500 animate-bounce" fill="currentColor" />}
                    
                    <p className="text-[13.5px] font-medium leading-relaxed">
                      {m.texto}
                    </p>
                  </div>
                </div>

                {souEu && (
                  <div className="relative">
                    <img 
                      src={getImagemUrl(getUserPhotoUrl(dadosUsuario))} 
                      className={`w-10 h-10 rounded-[1.2rem] object-cover shadow-md ${isHost ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`} 
                    />
                    <span className="absolute -top-2 -left-2 text-xs drop-shadow-md">{meuStatus}</span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        {/* INPUT FIXO EMBAIXO */}
        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-100/50 p-2 rounded-[2.2rem] border border-slate-100 focus-within:border-red-200 focus-within:bg-white transition-all shadow-inner">
            <div className="pl-4 text-xl select-none">{meuStatus}</div>
            <input 
              type="text" 
              value={novoTexto} 
              onChange={e => setNovoTexto(e.target.value)} 
              placeholder="Escreva algo para a galera..." 
              className="flex-1 bg-transparent p-4 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400" 
            />
            <button type="submit" className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-red-600 shadow-lg shadow-red-200 active:scale-95 transition-all">
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}