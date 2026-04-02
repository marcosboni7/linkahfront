'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, Video, Loader2, Phone, LogOut, Users, 
  PhoneOff, Maximize2, Radio 
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import {UserProfileModal} from '@/app/dashboard/UserProfileModal'; 

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

// --- LOGICA DE IMAGEM ROBUSTA ---
const getUserPhotoUrl = (user: any) => {
  if (!user) return DEFAULT_FOTO;
  // Lista de todas as colunas possíveis que sua API pode retornar
  const campos = ['avatar', 'foto_perfil', 'usuario_foto', 'foto', 'image', 'url_foto', 'user_photo'];
  for (const c of campos) {
    if (user[c] && typeof user[c] === 'string' && user[c].trim() !== '' && user[c] !== 'null' && user[c] !== 'undefined') {
      return user[c];
    }
  }
  // Se for um objeto aninhado (comum em algumas rotas da sua API)
  if (user.usuario && typeof user.usuario === 'object') return getUserPhotoUrl(user.usuario);
  return DEFAULT_FOTO;
};

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') return DEFAULT_FOTO;
  const f = foto.trim();
  if (/^(https?:\/\/|blob:|data:)/.test(f)) return f;
  return `${API_URL.replace(/\/$/, '')}/${f.replace(/^\//, '')}`;
};

export default function SalaLinkahSkype() {
  const { id } = useParams();
  const router = useRouter();

  // Estados Principais
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');
  
  // Estados de Chamada e Modal
  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [chamadaNoServidor, setChamadaNoServidor] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Carregar Usuário e Token
  useEffect(() => {
    const userStorage = localStorage.getItem('@Linkah:User');
    const token = localStorage.getItem('@Linkah:Token');
    if (!userStorage || !token) {
      router.push('/site/login');
      return;
    }
    setDadosUsuario(JSON.parse(userStorage));
    setCarregando(false);
  }, [router]);

  // 2. Sincronização em Tempo Real (Mensagens + Presença + Chamada)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizarDados = async () => {
      try {
        const minhaFoto = getUserPhotoUrl(dadosUsuario);
        const [resMsg, resOn, resCall] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`),
          fetch(`${API_URL}/api/comunidades/chamada-status/${id}`).catch(() => null)
        ]);

        if (resOn.ok) {
          const on = await resOn.json();
          setUsuariosOnline(on.filter((u: any) => (u.usuario_nome || u.nome) !== dadosUsuario.nome));
        }

        if (resMsg.ok) {
          setMensagens(await resMsg.json());
        }

        if (resCall?.ok) {
          const callData = await resCall.json();
          setChamadaNoServidor(callData.ativa);
        }
      } catch (e) {
        console.error("Erro na sincronização:", e);
      }
    };

    atualizarDados();
    const interval = setInterval(atualizarDados, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, chamadaAtiva]);

  // 3. Ações
  const handleOpenProfile = (name: string) => {
    setSelectedUserId(name);
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
      tipo: 'chat'
    };

    setNovoTexto('');
    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.error(err); }
  };

  const dispararChamada = async () => {
    setChamadaAtiva(true);
    try {
      await fetch(`${API_URL}/api/comunidades/chamada/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: id, usuario: dadosUsuario.nome, ativa: true })
      });
    } catch (e) { console.error(e); }
  };

  if (carregando) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-500" size={48} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden relative font-sans">
      
      {/* MODAL DE PERFIL (Com fix para o erro de Propriedades do TS) */}
      {isModalOpen && (
        <UserProfileModal 
          {...({
            isOpen: isModalOpen,
            onClose: () => setIsModalOpen(false),
            userId: selectedUserId
          } as any)}
        />
      )}

      {/* Sidebar de Membros */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-slate-900 font-black uppercase text-[11px] tracking-widest italic flex items-center gap-2">
            <Users size={16} className="text-red-500" /> Membros Online
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {usuariosOnline.map((u, i) => (
            <div key={i} onClick={() => handleOpenProfile(u.usuario_nome || u.nome)} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] cursor-pointer transition-all group">
              <img 
                src={getImagemUrl(getUserPhotoUrl(u))} 
                className="w-11 h-11 rounded-[1rem] object-cover shadow-sm group-hover:scale-105 transition-transform" 
                onError={(e:any) => e.target.src = DEFAULT_FOTO}
              />
              <span className="font-bold text-slate-700 text-sm">{u.usuario_nome || u.nome}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Área Principal do Chat */}
      <main className="flex-1 flex flex-col bg-white relative">
        
        {/* Header com Botão de Vídeo dinâmico */}
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${chamadaNoServidor ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <h1 className="font-black uppercase tracking-widest text-[11px] text-slate-400 italic">Chat Geral</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={dispararChamada}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all active:scale-95 ${
                chamadaNoServidor 
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
                : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Video size={20} strokeWidth={2.5} />
              {chamadaNoServidor && <span className="text-[10px] font-black uppercase">Entrar ao vivo</span>}
            </button>
            <div className="w-[1px] h-6 bg-slate-100 mx-2" />
            <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Listagem de Mensagens */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#FDFDFF]">
          
          {/* Overlay da Chamada (Jitsi) */}
          {chamadaAtiva && (
            <div className="absolute inset-0 z-40 bg-slate-900 flex flex-col animate-in slide-in-from-top duration-500">
              <iframe 
                src={`https://meet.jit.si/Linkah_Room_${id}#userInfo.displayName="${dadosUsuario?.nome}"`}
                allow="camera; microphone; display-capture; autoplay"
                className="flex-1 w-full border-none"
              />
              <div className="p-6 bg-slate-950 flex items-center justify-center">
                <button 
                  onClick={() => setChamadaAtiva(false)}
                  className="bg-red-500 text-white px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all flex items-center gap-2"
                >
                  <PhoneOff size={18} /> Encerrar ou Minimizar
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {mensagens.map((m, i) => {
              const souEu = m.usuario_nome === dadosUsuario.nome;
              
              // Busca a foto: Prioridade para o objeto da mensagem, depois fallback
              const fotoMsgBruta = m.usuario_foto || m.foto_perfil || m.avatar || m.foto;
              const imgFinal = souEu 
                ? getImagemUrl(getUserPhotoUrl(dadosUsuario))
                : getImagemUrl(fotoMsgBruta);

              return (
                <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-4 items-end animate-in fade-in duration-300`}>
                  {!souEu && (
                    <img 
                      src={imgFinal} 
                      onClick={() => handleOpenProfile(m.usuario_nome)}
                      className="w-10 h-10 rounded-[1.2rem] object-cover cursor-pointer hover:scale-110 transition-all shadow-md"
                      onError={(e:any) => e.target.src = DEFAULT_FOTO}
                    />
                  )}
                  
                  <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!souEu && <span className="text-[9px] font-black uppercase text-slate-300 ml-1 mb-1 italic tracking-tighter">{m.usuario_nome}</span>}
                    <div className={`p-4 rounded-[1.5rem] shadow-sm ${souEu ? 'bg-red-500 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-50 rounded-bl-none'}`}>
                      <p className="text-sm font-medium leading-relaxed">{m.texto}</p>
                    </div>
                  </div>

                  {souEu && (
                    <img 
                      src={imgFinal} 
                      className="w-10 h-10 rounded-[1.2rem] object-cover shadow-md"
                      onError={(e:any) => e.target.src = DEFAULT_FOTO}
                    />
                  )}
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>
        </div>

        {/* Input de Mensagem */}
        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:border-red-200 transition-all">
            <input
              type="text"
              value={novoTexto}
              onChange={e => setNovoTexto(e.target.value)}
              placeholder="Escreva sua mensagem..."
              className="flex-1 bg-transparent p-4 outline-none text-sm font-bold text-slate-700"
            />
            <button type="submit" className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-red-100">
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}