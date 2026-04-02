'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, Video, Loader2, Phone, LogOut, Users, 
  VideoOff, MicOff, PhoneOff, Maximize2 
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

  // Estados do Chat e Usuários
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');
  
  // Estados do Modal de Perfil
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Estados da Chamada (Vídeo/Voz)
  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [tipoChamada, setTipoChamada] = useState<'audio' | 'video' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const avatarMap = Object.fromEntries(
    usuariosOnline.map(u => [u.usuario_nome, getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto)])
  );

  const handleOpenProfile = (nome: string) => {
    setSelectedUser(nome);
    setIsModalOpen(true);
  };

  // Carregar usuário do LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else router.push('/site/login');
  }, [router]);

  // Atualização em Tempo Real (Polling)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;
    const atualizar = async () => {
      try {
        const minhaFoto = dadosUsuario.foto_perfil || dadosUsuario.avatar || '';
        const [resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);
        if (resOn.ok) {
          const on = await resOn.json();
          setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }
        if (resMsg.ok) setMensagens(await resMsg.json());
        setCarregando(false);
      } catch (e) { console.error('Erro ao sincronizar:', e); }
    };
    atualizar();
    const interval = setInterval(atualizar, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, chamadaAtiva]);

  // Funções de Chamada Integradas
  const iniciarChamada = (tipo: 'audio' | 'video') => {
    setTipoChamada(tipo);
    setChamadaAtiva(true);
  };

  const encerrarChamada = () => {
    setChamadaAtiva(false);
    setTipoChamada(null);
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
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Entrando na sala...</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden font-sans">
      
      <UserProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={selectedUser} 
      />

      {/* Sidebar de Membros */}
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
            <div 
              key={i} 
              onClick={() => handleOpenProfile(u.usuario_nome)}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] cursor-pointer transition-all group"
            >
              <div className="relative">
                <img
                  src={getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto)}
                  className="w-11 h-11 rounded-[1rem] object-cover shadow-sm group-hover:scale-105 transition-transform"
                  onError={(e:any) => e.target.src = DEFAULT_FOTO}
                  alt={u.usuario_nome}
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <span className="font-bold text-slate-700 text-sm">{u.usuario_nome}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col bg-white relative">
        
        {/* HEADER */}
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${chamadaAtiva ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <h1 className="font-black uppercase tracking-widest text-[11px] text-slate-400 italic">
              {chamadaAtiva ? `Em Chamada de ${tipoChamada === 'video' ? 'Vídeo' : 'Voz'}` : 'Chat da Comunidade'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => iniciarChamada('audio')}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${tipoChamada === 'audio' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
            >
              <Phone size={18} strokeWidth={2.5} />
            </button>

            <button 
              onClick={() => iniciarChamada('video')}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${tipoChamada === 'video' ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
            >
              <Video size={20} strokeWidth={2.5} />
            </button>

            <div className="w-[1px] h-6 bg-slate-100 mx-2" />

            <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-[#FF4D4D] transition-colors">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO (CHAMADA OU CHAT) */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#FDFDFF]">
          
          {/* OVERLAY DE VÍDEO/VOZ QUANDO ATIVO */}
          {chamadaAtiva && (
            <div className="absolute inset-0 z-40 bg-slate-900 animate-in fade-in duration-500 flex flex-col">
              <div className="flex-1 relative">
                 {/* IFRAME DO JITSI INTEGRADO */}
                 <iframe 
                   src={`https://meet.jit.si/Linkah_${id}#userInfo.displayName="${dadosUsuario?.nome}"&config.startWithAudioMuted=${tipoChamada === 'audio' ? 'false' : 'true'}&config.startWithVideoMuted=${tipoChamada === 'video' ? 'false' : 'true'}`}
                   allow="camera; microphone; display-capture; autoplay; clipboard-write"
                   className="w-full h-full border-none"
                 />
              </div>
              
              {/* Controles da Chamada */}
              <div className="p-6 bg-slate-950 flex items-center justify-center gap-6">
                <button onClick={encerrarChamada} className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-xl shadow-red-900/20">
                  <PhoneOff size={24} />
                </button>
                <button onClick={() => setChamadaAtiva(false)} className="text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Maximize2 size={14} /> Minimizar e ver chat
                </button>
              </div>
            </div>
          )}

          {/* MENSAGENS DO CHAT */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {mensagens.map((m, i) => {
              const souEu = m.usuario_nome === dadosUsuario.nome;
              const avatarMsg = souEu
                ? getImagemUrl(dadosUsuario.foto_perfil || dadosUsuario.avatar)
                : avatarMap[m.usuario_nome] || DEFAULT_FOTO;

              return (
                <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-4 items-end`}>
                  {!souEu && (
                    <img 
                      src={avatarMsg} 
                      onClick={() => handleOpenProfile(m.usuario_nome)}
                      className="w-10 h-10 rounded-[1rem] object-cover cursor-pointer hover:scale-110 transition-all shadow-md" 
                      onError={(e:any) => e.target.src = DEFAULT_FOTO} 
                    />
                  )}
                  
                  <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!souEu && <span className="text-[9px] font-black uppercase text-slate-300 ml-1 mb-1 italic">{m.usuario_nome}</span>}
                    <div className={`p-4 rounded-[1.5rem] shadow-sm ${souEu ? 'bg-[#FF4D4D] text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-50 rounded-bl-none'}`}>
                      <p className="text-sm font-medium leading-relaxed">{m.texto}</p>
                    </div>
                  </div>

                  {souEu && (
                    <img 
                      src={avatarMsg} 
                      onClick={() => handleOpenProfile(m.usuario_nome)}
                      className="w-10 h-10 rounded-[1rem] object-cover cursor-pointer hover:scale-110 transition-all shadow-md" 
                      onError={(e:any) => e.target.src = DEFAULT_FOTO} 
                    />
                  )}
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>
        </div>

        {/* INPUT DE MENSAGEM */}
        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:border-red-200 transition-all">
            <input
              type="text"
              value={novoTexto}
              onChange={e => setNovoTexto(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent p-4 outline-none text-sm font-bold text-slate-700"
            />
            <button type="submit" className="w-12 h-12 bg-[#FF4D4D] text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-all shadow-lg shadow-red-100">
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}