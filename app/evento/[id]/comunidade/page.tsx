'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, Loader2, LogOut, Users, 
  Camera, ImageIcon, MessageSquare
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import {UserProfileModal} from '@/app/dashboard/UserProfileModal'; 

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

// --- HELPERS DE IMAGEM ---
const getUserPhotoUrl = (user: any) => {
  if (!user) return DEFAULT_FOTO;
  const campos = ['avatar', 'foto_perfil', 'usuario_foto', 'foto', 'profile_photo', 'image'];
  for (const c of campos) {
    if (user[c] && typeof user[c] === 'string' && user[c].trim() !== '' && user[c] !== 'null') return user[c];
  }
  if (user.usuario && typeof user.usuario === 'object') return getUserPhotoUrl(user.usuario);
  return DEFAULT_FOTO;
};

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '' || foto === DEFAULT_FOTO) return DEFAULT_FOTO;
  foto = foto.trim();
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
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  // Estados do Modal de Perfil
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Autenticação e Perfil
  const getUsuarioLogado = useCallback(() => {
    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const parsedUser = userStorage ? JSON.parse(userStorage) : null;
      const emailLogado = parsedUser?.email || localStorage.getItem('userEmail') || '';
      const token = localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '') || '';
      return { parsedUser, emailLogado, token };
    } catch (error) {
      return { parsedUser: null, emailLogado: '', token: '' };
    }
  }, []);

  useEffect(() => {
    const { parsedUser, emailLogado, token } = getUsuarioLogado();
    if (!emailLogado) { router.push('/site/login'); return; }
    if (parsedUser) { setDadosUsuario(parsedUser); setCarregando(false); }

    const atualizarPerfil = async () => {
      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`, { method: 'GET', headers });
        if (response.ok) {
          const data = await response.json();
          const userUpdated = { ...data, email: emailLogado };
          setDadosUsuario(userUpdated);
          localStorage.setItem('@Linkah:User', JSON.stringify(userUpdated));
          setCarregando(false);
        }
      } catch (error) { console.error(error); }
    };
    atualizarPerfil();
  }, [router, getUsuarioLogado]);

  // 2. Polling de Mensagens e Presença
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;
    const sync = async () => {
      try {
        const minhaFoto = getUserPhotoUrl(dadosUsuario);
        const [resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);
        if (resOn.ok) setUsuariosOnline((await resOn.json()).filter((u: any) => (u.usuario_nome || u.nome) !== dadosUsuario.nome));
        if (resMsg.ok) setMensagens(await resMsg.json());
      } catch (e) { console.error(e); }
    };
    sync();
    const interval = setInterval(sync, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  // --- AÇÕES ---
  const handleOpenProfile = (userName: string) => {
    setSelectedUserId(userName);
    setIsModalOpen(true);
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;
    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: getUserPhotoUrl(dadosUsuario),
      texto: novoTexto,
      imagem: imagemAnexada,
      tipo: 'chat'
    };
    setNovoTexto('');
    setImagemAnexada(null);
    await fetch(`${API_URL}/api/comunidades/enviar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  };

  if (carregando) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-red-500" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden relative font-sans">
      
      {/* Modal de Perfil */}
      {isModalOpen && (
        <UserProfileModal 
          {...({ isOpen: isModalOpen, onClose: () => setIsModalOpen(false), userId: selectedUserId } as any)} 
        />
      )}

      {/* Sidebar de Membros */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-slate-900 font-black uppercase text-[11px] tracking-widest italic flex items-center gap-2">
            <Users size={16} className="text-red-500" /> {t?.members || 'Membros'}
          </h2>
          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
            {usuariosOnline.length + 1} online
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Você (Logado) */}
          <div onClick={() => handleOpenProfile(dadosUsuario.nome)} className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-50 rounded-[1.5rem] cursor-pointer group transition-all">
            <img src={getImagemUrl(getUserPhotoUrl(dadosUsuario))} className="w-11 h-11 rounded-[1rem] object-cover shadow-sm group-hover:scale-105" onError={(e:any) => e.target.src = DEFAULT_FOTO} />
            <div className="flex flex-col">
              <span className="font-bold text-slate-700 text-sm">{dadosUsuario.nome}</span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Você</span>
            </div>
          </div>

          {/* Outros Usuários */}
          {usuariosOnline.map((u, i) => (
            <div key={i} onClick={() => handleOpenProfile(u.usuario_nome || u.nome)} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] cursor-pointer group transition-all border border-transparent hover:border-slate-100">
              <img src={getImagemUrl(getUserPhotoUrl(u))} className="w-11 h-11 rounded-[1rem] object-cover shadow-sm group-hover:scale-105" onError={(e:any) => e.target.src = DEFAULT_FOTO} />
              <span className="font-bold text-slate-700 text-sm">{u.usuario_nome || u.nome}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white relative">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-red-500">
              <MessageSquare size={20} />
            </div>
            <div>
              <h1 className="font-black uppercase tracking-widest text-[11px] text-slate-400 italic leading-none">Chat</h1>
              <p className="text-[10px] font-bold text-slate-700 mt-1 uppercase">Linkah Community</p>
            </div>
          </div>

          <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#FDFDFF]">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {mensagens.map((m, i) => {
              const souEu = m.usuario_nome === dadosUsuario.nome;
              const imgLink = getImagemUrl(m.usuario_foto || m.foto_perfil || m.avatar);

              return (
                <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-4 items-end animate-in fade-in slide-in-from-bottom-2`}>
                  {!souEu && <img src={imgLink} onClick={() => handleOpenProfile(m.usuario_nome)} className="w-10 h-10 rounded-[1.2rem] object-cover cursor-pointer hover:scale-110 shadow-md transition-all" onError={(e:any) => e.target.src = DEFAULT_FOTO} />}
                  
                  <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!souEu && <span className="text-[9px] font-black uppercase text-slate-300 ml-1 mb-1 italic tracking-tighter">{m.usuario_nome}</span>}
                    <div className={`p-4 rounded-[1.5rem] shadow-sm ${souEu ? 'bg-red-500 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                      <p className="text-sm font-medium leading-relaxed">{m.texto}</p>
                      {m.imagem && <img src={getImagemUrl(m.imagem)} className="w-full max-w-[250px] rounded-xl mt-3 border border-black/5 shadow-inner" />}
                    </div>
                  </div>

                  {souEu && <img src={getImagemUrl(getUserPhotoUrl(dadosUsuario))} className="w-10 h-10 rounded-[1.2rem] object-cover shadow-md" onError={(e:any) => e.target.src = DEFAULT_FOTO} />}
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:border-red-200 transition-all">
            <input 
              type="text" 
              value={novoTexto} 
              onChange={e => setNovoTexto(e.target.value)} 
              placeholder={t?.type_message || "Diga algo para a comunidade..."} 
              className="flex-1 bg-transparent p-4 outline-none text-sm font-bold text-slate-700" 
            />
            
            <div className="flex items-center gap-2 pr-2">
               <button type="button" className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                  <ImageIcon size={20} />
               </button>
               <button type="submit" className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95">
                 <Send size={18} />
               </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}