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

const getUserPhotoUrl = (user: any) => {
  if (!user) return DEFAULT_FOTO;
  const camposFoto = ['avatar', 'foto_perfil', 'usuario_foto', 'foto', 'profile_photo', 'user_photo', 'image', 'img', 'url_foto'];
  for (const campo of camposFoto) {
    if (user[campo] && typeof user[campo] === 'string' && user[campo].trim() !== '' && user[campo] !== 'null' && user[campo] !== 'undefined') {
      return user[campo];
    }
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

export default function SalaLinkahSkype() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  const [chamadaAtivaLocal, setChamadaAtivaLocal] = useState(false);
  const [chamadaNoServidor, setChamadaNoServidor] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const getUsuarioLogado = useCallback(() => {
    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const parsedUser = userStorage ? JSON.parse(userStorage) : null;
      const emailLogado = parsedUser?.email || localStorage.getItem('userEmail') || '';
      const token = localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '') || '';
      return { userStorage, parsedUser, emailLogado, token };
    } catch (error) {
      return { userStorage: null, parsedUser: null, emailLogado: '', token: '' };
    }
  }, []);

  useEffect(() => {
    const { parsedUser, emailLogado, token } = getUsuarioLogado();
    if (!emailLogado) {
      router.push('/site/login');
      return;
    }
    if (parsedUser) {
      setDadosUsuario(parsedUser);
      setCarregando(false);
    }
    const atualizarPerfilEmBackground = async () => {
      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`, {
          method: 'GET',
          headers,
        });
        if (response.ok) {
          const data = await response.json();
          const userUpdated = { ...data, email: emailLogado };
          setDadosUsuario(userUpdated);
          localStorage.setItem('@Linkah:User', JSON.stringify(userUpdated));
          setCarregando(false);
        } else if (!parsedUser) router.push('/site/login');
      } catch (error) {
        if (!parsedUser) router.push('/site/login');
      }
    };
    atualizarPerfilEmBackground();
  }, [router, getUsuarioLogado]);

  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;
    const atualizar = async () => {
      try {
        const minhaFoto = getUserPhotoUrl(dadosUsuario);
        const [resMsg, resOn, resCall] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`),
          fetch(`${API_URL}/api/comunidades/chamada-status/${id}`).catch(() => null)
        ]);
        if (resOn.ok) setUsuariosOnline((await resOn.json()).filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        if (resMsg.ok) setMensagens(await resMsg.json());
        if (resCall?.ok) setChamadaNoServidor((await resCall.json()).ativa);
      } catch (e) { console.error(e); }
    };
    atualizar();
    const interval = setInterval(atualizar, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, chamadaAtivaLocal]);

  const handleImageError = (e: any) => { if (e.target.src !== DEFAULT_FOTO) e.target.src = DEFAULT_FOTO; };

  const gerenciarChamada = async () => {
    setChamadaAtivaLocal(true);
    try {
      await fetch(`${API_URL}/api/comunidades/chamada/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: id, usuario: dadosUsuario.nome, ativa: true })
      });
    } catch (err) { console.error(err); }
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
    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.error(err); }
  };

  const handleOpenProfile = (userName: string) => {
    setSelectedUserId(userName);
    setIsModalOpen(true);
  };

  if (carregando) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-red-500" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden relative font-sans">
      
      {isModalOpen && (
        <UserProfileModal 
          {...({ isOpen: isModalOpen, onClose: () => setIsModalOpen(false), userId: selectedUserId } as any)} 
        />
      )}

      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-slate-900 font-black uppercase text-[11px] tracking-widest italic flex items-center gap-2">
            <Users size={16} className="text-red-500" /> Membros
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {usuariosOnline.map((u, i) => (
            <div key={i} onClick={() => handleOpenProfile(u.usuario_nome || u.nome)} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] cursor-pointer transition-all group">
              <img src={getImagemUrl(getUserPhotoUrl(u))} className="w-11 h-11 rounded-[1rem] object-cover shadow-sm group-hover:scale-105 transition-transform" onError={handleImageError} />
              <span className="font-bold text-slate-700 text-sm">{u.usuario_nome || u.nome}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white relative">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full ${chamadaNoServidor ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <h1 className="font-black uppercase tracking-widest text-[11px] text-slate-400 italic">
              {chamadaNoServidor ? "Chamada em andamento..." : "Chat da Comunidade"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={gerenciarChamada}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all active:scale-95 ${
                chamadaNoServidor 
                ? 'bg-red-500 text-white animate-pulse shadow-xl shadow-red-200' 
                : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Video size={20} strokeWidth={2.5} />
              {chamadaNoServidor && !chamadaAtivaLocal && <span className="text-[10px] font-black uppercase tracking-tighter">Entrar na Call</span>}
            </button>
            <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#FDFDFF]">
          
          {/* CORREÇÃO AQUI: Mudança da URL para evitar tela de moderador */}
          {chamadaAtivaLocal && (
            <div className="absolute inset-0 z-40 bg-slate-900 flex flex-col animate-in slide-in-from-top duration-500">
              <iframe 
                src={`https://8x8.vc/vpaas-magic-cookie-86111f19f1824d55b05809794d01099e/Linkah_Room_${id}#userInfo.displayName="${dadosUsuario?.nome}"&config.prejoinPageEnabled=false`}
                allow="camera; microphone; display-capture; autoplay"
                className="flex-1 w-full border-none"
              />
              <div className="p-6 bg-slate-950 flex items-center justify-center gap-6">
                <button onClick={() => setChamadaAtivaLocal(false)} className="bg-red-500 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 shadow-2xl">
                  <PhoneOff size={18} /> Sair
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {mensagens.map((m, i) => {
              const souEu = m.usuario_nome === dadosUsuario.nome;
              const userObj = usuariosOnline.find(u => u.usuario_nome === m.usuario_nome) || m || (souEu ? dadosUsuario : null);
              const imgLink = getImagemUrl(getUserPhotoUrl(userObj));
              return (
                <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-4 items-end animate-in fade-in`}>
                  {!souEu && <img src={imgLink} onClick={() => handleOpenProfile(m.usuario_nome)} className="w-10 h-10 rounded-[1.2rem] object-cover cursor-pointer hover:scale-110 shadow-md" onError={handleImageError} />}
                  <div className={`p-4 rounded-[1.5rem] shadow-sm max-w-[70%] ${souEu ? 'bg-red-500 text-white rounded-br-none shadow-red-100' : 'bg-white text-slate-700 border border-slate-50 rounded-bl-none'}`}>
                    <p className="text-sm font-medium leading-relaxed">{m.texto}</p>
                    {m.imagem && <img src={getImagemUrl(m.imagem)} className="w-full max-w-[250px] rounded-xl mt-3 border border-black/5" onError={handleImageError} />}
                  </div>
                  {souEu && <img src={imgLink} className="w-10 h-10 rounded-[1.2rem] object-cover shadow-md" onError={handleImageError} />}
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:border-red-200 transition-all">
            <input type="text" value={novoTexto} onChange={e => setNovoTexto(e.target.value)} placeholder="Escreva sua mensagem..." className="flex-1 bg-transparent p-4 outline-none text-sm font-bold text-slate-700" />
            <button type="submit" className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-red-100"><Send size={18} /></button>
          </form>
        </div>
      </main>
    </div>
  );
}