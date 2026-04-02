'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, Video, Loader2, Phone, LogOut, Users, 
  PhoneOff, Maximize2, Radio, Camera, ImageIcon 
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import {UserProfileModal} from '@/app/dashboard/UserProfileModal'; 

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

// --- HELPERS ---
const getUserPhotoUrl = (user: any) => {
  if (!user) return DEFAULT_FOTO;
  const campos = ['avatar', 'foto_perfil', 'usuario_foto', 'foto', 'profile_photo', 'image'];
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

  useEffect(() => {
    const user = localStorage.getItem('@Linkah:User');
    if (!user) return router.push('/site/login');
    setDadosUsuario(JSON.parse(user));
    setCarregando(false);
  }, [router]);

  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;
    const sync = async () => {
      try {
        const minhaFoto = getUserPhotoUrl(dadosUsuario);
        const [resMsg, resOn, resCall] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`),
          fetch(`${API_URL}/api/comunidades/chamada-status/${id}`).catch(() => null)
        ]);
        if (resOn.ok) setUsuariosOnline((await resOn.json()).filter((u: any) => (u.usuario_nome || u.nome) !== dadosUsuario.nome));
        if (resMsg.ok) setMensagens(await resMsg.json());
        if (resCall?.ok) setChamadaNoServidor((await resCall.json()).ativa);
      } catch (e) { console.error(e); }
    };
    sync();
    const interval = setInterval(sync, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens, chamadaAtivaLocal]);

  const handleOpenProfile = (userName: string) => {
    setSelectedUserId(userName);
    setIsModalOpen(true);
  };

  const gerenciarChamada = async () => {
    setChamadaAtivaLocal(true);
    await fetch(`${API_URL}/api/comunidades/chamada/iniciar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evento_id: id, usuario: dadosUsuario.nome, ativa: true })
    });
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

  if (carregando) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-red-500" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden relative">
      {isModalOpen && <UserProfileModal {...({ isOpen: isModalOpen, onClose: () => setIsModalOpen(false), userId: selectedUserId } as any)} />}

      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-8 border-b border-slate-50 font-black uppercase text-[11px] tracking-widest italic flex items-center gap-2">
          <Users size={16} className="text-red-500" /> {t?.members || 'Membros'}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {usuariosOnline.map((u, i) => (
            <div key={i} onClick={() => handleOpenProfile(u.usuario_nome || u.nome)} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] cursor-pointer transition-all">
              <img src={getImagemUrl(getUserPhotoUrl(u))} className="w-11 h-11 rounded-[1rem] object-cover shadow-sm" onError={(e:any) => e.target.src = DEFAULT_FOTO} />
              <span className="font-bold text-slate-700 text-sm">{u.usuario_nome || u.nome}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white relative">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full ${chamadaNoServidor ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <h1 className="font-black uppercase tracking-widest text-[11px] text-slate-400 italic">Chat Linkah</h1>
          </div>
          <button onClick={gerenciarChamada} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${chamadaNoServidor ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-blue-50'}`}>
            <Video size={20} />
            {chamadaNoServidor && !chamadaAtivaLocal && <span className="text-[10px] font-black uppercase">Entrar na Call</span>}
          </button>
        </header>

        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#FDFDFF]">
          {chamadaAtivaLocal && (
            <div className="absolute inset-0 z-40 bg-slate-900 flex flex-col">
              <iframe 
                /* NOVA TENTATIVA: Servidor vpaas com bypass de prejoin */
                src={`https://8x8.vc/vpaas-magic-cookie-86111f19f1824d55b05809794d01099e/Linkah_Sala_${id}#userInfo.displayName="${dadosUsuario?.nome}"&config.prejoinPageEnabled=false&config.disableModeratorIndicator=true&config.makeJsonRpcRequests=false`}
                allow="camera; microphone; display-capture; autoplay"
                className="flex-1 w-full border-none"
              />
              <div className="p-6 bg-slate-950 flex items-center justify-center">
                <button onClick={() => setChamadaAtivaLocal(false)} className="bg-red-500 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <PhoneOff size={18} /> Encerrar Call
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {mensagens.map((m, i) => {
              const souEu = m.usuario_nome === dadosUsuario.nome;
              return (
                <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-4 items-end animate-in fade-in`}>
                  {!souEu && <img src={getImagemUrl(m.usuario_foto)} onClick={() => handleOpenProfile(m.usuario_nome)} className="w-10 h-10 rounded-[1.2rem] object-cover cursor-pointer hover:scale-110 shadow-md" onError={(e:any) => e.target.src = DEFAULT_FOTO} />}
                  <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!souEu && <span className="text-[9px] font-black uppercase text-slate-300 ml-1 mb-1 italic">{m.usuario_nome}</span>}
                    <div className={`p-4 rounded-[1.5rem] shadow-sm ${souEu ? 'bg-red-500 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                      <p className="text-sm font-medium">{m.texto}</p>
                      {m.imagem && <img src={getImagemUrl(m.imagem)} className="w-full max-w-[250px] rounded-xl mt-3 border border-black/5" />}
                    </div>
                  </div>
                  {souEu && <img src={getImagemUrl(getUserPhotoUrl(dadosUsuario))} className="w-10 h-10 rounded-[1.2rem] object-cover shadow-md" onError={(e:any) => e.target.src = DEFAULT_FOTO} />}
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
            <input type="text" value={novoTexto} onChange={e => setNovoTexto(e.target.value)} placeholder="Diga algo..." className="flex-1 bg-transparent p-4 outline-none text-sm font-bold text-slate-700" />
            <button type="submit" className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-105 shadow-lg"><Send size={18} /></button>
          </form>
        </div>
      </main>
    </div>
  );
}