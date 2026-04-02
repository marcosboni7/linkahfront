'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, Video, Loader2, Phone, LogOut, Users, 
  PhoneOff, Maximize2, Radio
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { UserProfileModal } from '@/app/dashboard/UserProfileModal'; 

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') return DEFAULT_FOTO;
  foto = foto.trim();
  if (/^(https?:\/\/|blob:|data:)/.test(foto)) return foto;
  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
};

export default function SalaLinkahSkype() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  // Estados de Dados
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');
  
  // Estados do Modal de Perfil
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Estados da Chamada (Sincronizada)
  const [chamadaAtiva, setChamadaAtiva] = useState(false); // Se EU estou na chamada
  const [chamadaNoServidor, setChamadaNoServidor] = useState(false); // Se ALGUÉM ligou na sala
  const [tipoChamada, setTipoChamada] = useState<'audio' | 'video' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const avatarMap = Object.fromEntries(
    usuariosOnline.map(u => [u.usuario_nome, getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto)])
  );

  const handleOpenProfile = (nome: string) => {
    setSelectedUser(nome);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else router.push('/site/login');
  }, [router]);

  // POLLING: Atualiza mensagens, usuários e STATUS DA CHAMADA
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizarTudo = async () => {
      try {
        const minhaFoto = dadosUsuario.foto_perfil || dadosUsuario.avatar || '';
        
        // Buscamos mensagens, presença e o status da chamada no servidor
        const [resMsg, resOn, resCall] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`),
          fetch(`${API_URL}/api/comunidades/chamada-status/${id}`).catch(() => null)
        ]);

        if (resOn.ok) {
          const on = await resOn.json();
          setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }
        if (resMsg.ok) setMensagens(await resMsg.json());
        
        // Verifica se existe uma chamada ativa iniciada por outra pessoa
        if (resCall && resCall.ok) {
          const callData = await resCall.json();
          setChamadaNoServidor(callData.ativa);
        }

        setCarregando(false);
      } catch (e) { console.error('Erro de sincronização:', e); }
    };

    atualizarTudo();
    const interval = setInterval(atualizarTudo, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, chamadaAtiva]);

  // FUNÇÃO PARA INICIAR/ENTRAR NA CHAMADA
  const gerenciarChamada = async (tipo: 'audio' | 'video') => {
    setTipoChamada(tipo);
    setChamadaAtiva(true);

    // Avisa o servidor que a chamada está rolando (para os outros verem)
    try {
      await fetch(`${API_URL}/api/comunidades/chamada/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: id, usuario: dadosUsuario.nome, tipo })
      });
    } catch (e) { console.error(e); }
  };

  const encerrarChamada = () => {
    setChamadaAtiva(false);
    setTipoChamada(null);
    // Opcional: avisar backend que você saiu
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim()) return;
    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: dadosUsuario?.foto_perfil || dadosUsuario?.avatar || null,
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

  if (carregando) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-[#FF4D4D]" size={48} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Linkah Chat...</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden font-sans">
      
      <UserProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={selectedUser} 
      />

      {/* Sidebar Membros */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-slate-900 font-black uppercase text-[11px] tracking-[0.3em] italic flex items-center gap-2">
            <Users size={16} className="text-[#FF4D4D]" /> Membros
          </h2>
          <span className="bg-red-50 text-[#FF4D4D] text-[10px] font-black px-2 py-1 rounded-lg">
            {usuariosOnline.length + 1}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {usuariosOnline.map((u, i) => (
            <div key={i} onClick={() => handleOpenProfile(u.usuario_nome)} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] cursor-pointer transition-all group">
              <div className="relative">
                <img src={getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto)} className="w-11 h-11 rounded-[1rem] object-cover group-hover:scale-105 transition-transform" onError={(e:any) => e.target.src = DEFAULT_FOTO} />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <span className="font-bold text-slate-700 text-sm">{u.usuario_nome}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col bg-white relative">
        
        {/* HEADER DINÂMICO */}
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${chamadaNoServidor ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <h1 className="font-black uppercase tracking-widest text-[11px] text-slate-400 italic">
              {chamadaNoServidor ? "Chamada em andamento..." : "Chat da Comunidade"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão Telefone */}
            <button 
              onClick={() => gerenciarChamada('audio')}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${chamadaAtiva && tipoChamada === 'audio' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
            >
              <Phone size={18} strokeWidth={2.5} />
            </button>

            {/* Botão Vídeo / Entrar na Chamada */}
            <button 
              onClick={() => gerenciarChamada('video')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-90 ${
                chamadaNoServidor 
                ? 'bg-[#FF4D4D] text-white shadow-xl animate-pulse ring-4 ring-red-100' 
                : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Video size={20} strokeWidth={2.5} />
              {chamadaNoServidor && !chamadaAtiva && (
                <span className="text-[10px] font-black uppercase tracking-tighter">Entrar</span>
              )}
            </button>

            <div className="w-[1px] h-6 bg-slate-100 mx-2" />
            <button onClick={() => router.back()} className="text-[10px] font-black uppercase text-slate-400 hover:text-[#FF4D4D]"><LogOut size={14} /></button>
          </div>
        </header>

        {/* FEED / VIDEO */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#FDFDFF]">
          
          {/* OVERLAY DO JITSI */}
          {chamadaAtiva && (
            <div className="absolute inset-0 z-40 bg-slate-900 flex flex-col animate-in slide-in-from-top duration-500">
              <iframe 
                src={`https://meet.jit.si/Linkah_Room_${id}#userInfo.displayName="${dadosUsuario?.nome}"`}
                allow="camera; microphone; display-capture; autoplay"
                className="flex-1 w-full h-full border-none"
              />
              <div className="p-6 bg-slate-950 flex items-center justify-center gap-6">
                <button onClick={encerrarChamada} className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
                  <PhoneOff size={24} />
                </button>
                <button onClick={() => setChamadaAtiva(false)} className="text-white/40 hover:text-white text-[10px] font-black uppercase flex items-center gap-2">
                  <Maximize2 size={14} /> Minimizar Vídeo
                </button>
              </div>
            </div>
          )}

          {/* CHAT MESSAGES */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {mensagens.map((m, i) => {
              const souEu = m.usuario_nome === dadosUsuario.nome;
              return (
                <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-4 items-end animate-in fade-in`}>
                  {!souEu && <img src={avatarMap[m.usuario_nome] || DEFAULT_FOTO} onClick={() => handleOpenProfile(m.usuario_nome)} className="w-10 h-10 rounded-[1rem] object-cover cursor-pointer hover:scale-110 transition-all shadow-md" />}
                  <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!souEu && <span className="text-[9px] font-black uppercase text-slate-300 ml-1 mb-1 italic">{m.usuario_nome}</span>}
                    <div className={`p-4 rounded-[1.5rem] shadow-sm ${souEu ? 'bg-[#FF4D4D] text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-50 rounded-bl-none'}`}>
                      <p className="text-sm font-medium">{m.texto}</p>
                    </div>
                  </div>
                  {souEu && <img src={getImagemUrl(dadosUsuario.avatar || dadosUsuario.foto_perfil)} className="w-10 h-10 rounded-[1rem] object-cover" />}
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
            <input type="text" value={novoTexto} onChange={e => setNovoTexto(e.target.value)} placeholder="Mande uma mensagem..." className="flex-1 bg-transparent p-4 outline-none text-sm font-bold text-slate-700" />
            <button type="submit" className="w-12 h-12 bg-[#FF4D4D] text-white rounded-full flex items-center justify-center hover:scale-105 transition-all"><Send size={18} /></button>
          </form>
        </div>
      </main>
    </div>
  );
}