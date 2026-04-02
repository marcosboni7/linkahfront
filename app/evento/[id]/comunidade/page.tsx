'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Search, Paperclip, Send, Video, Phone,
  X, Loader2, Sparkles, ChevronLeft,
  Instagram, Linkedin, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';

const API_URL = 'https://api-linkah.onrender.com';

// Fallback de foto padrão (GIF)
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

// Função utilitária para tratar URLs de imagem com debug
const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') {
    return DEFAULT_FOTO;
  }

  foto = foto.trim();

  // Se já for URL externa ou blob/data, retorna direto
  if (/^(http|https|blob|data):/.test(foto)) {
    return foto;
  }

  // Senão, monta URL completa
  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
};

export default function SalaLinkahSkype() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [nomeSalaCall, setNomeSalaCall] = useState('');
  const [conviteRecebido, setConviteRecebido] = useState<any>(null);

  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- FUNÇÕES DE AÇÃO ---

  const handleImageError = (e: any, local: string) => {
    console.error(`❌ Erro [${local}]:`, e.target.src);
    e.target.src = DEFAULT_FOTO;
  };

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    const fotoCall = dadosUsuario.foto || dadosUsuario.usuario_foto || null;

    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id),
          usuario_nome: dadosUsuario.nome,
          usuario_foto: fotoCall,
          texto: `CALL_INVITE|${destino}|${sala}`,
          tipo: 'status'
        })
      });

      setNomeSalaCall(sala);
      setChamadaAtiva(true);
    } catch (err) {
      console.error("Erro ao iniciar call:", err);
    }
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: dadosUsuario?.foto || dadosUsuario?.usuario_foto || null,
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
    } catch (err) {
      console.error(err);
    }
  };

  const abrirPerfil = async (nome: string) => {
    setCarregandoPerfil(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/perfil-publico?nome=${encodeURIComponent(nome)}`);
      if (res.ok) setUsuarioSelecionado(await res.json());
      else setUsuarioSelecionado({ nome, bio: null });
    } catch (err) {
      console.error('Erro ao abrir perfil:', err);
      setUsuarioSelecionado({ nome, bio: null });
    } finally {
      setCarregandoPerfil(false);
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else {
      router.push('/site/login');
    }
  }, [router]);

  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        const minhaFoto = dadosUsuario.foto || dadosUsuario.usuario_foto || '';
        const [resEv, resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/eventos/${id}`),
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);

        if (resEv.ok) setDadosEvento(await resEv.json());

        if (resOn.ok) {
          const on = await resOn.json();
          if (Array.isArray(on)) setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          setMensagens(msgs);

          const AGORA = Date.now();
          msgs.slice(-5).forEach((msg: any) => {
            if (msg.texto?.includes("CALL_INVITE|")) {
              const partes = msg.texto.split("|");
              const destino = partes[1]?.trim().toLowerCase();
              if (destino === dadosUsuario.nome.toLowerCase() && (AGORA - new Date(msg.criado_em).getTime()) / 1000 < 25 && !chamadaAtiva) {
                setConviteRecebido({ de: msg.usuario_nome, sala: partes[2], foto: msg.usuario_foto || msg.foto });
              }
            }
          });
        }

        setCarregando(false);
      } catch (e) { console.error('Erro ao atualizar dados:', e); }
    };

    atualizar();
    const int = setInterval(atualizar, 4000);
    return () => clearInterval(int);
  }, [id, dadosUsuario, chamadaAtiva]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  if (carregando) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#ff4d4d]" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden text-slate-900 font-sans">
      {/* MODAL CONVITE */}
      {conviteRecebido && (
        <div className="fixed inset-0 z-[999] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-2xl">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden bg-slate-100 flex items-center justify-center">
              <img src={getImagemUrl(conviteRecebido.foto)} className="w-full h-full object-cover" alt="" onError={(e) => handleImageError(e, 'Modal Convite')} />
            </div>
            <h3 className="font-bold text-xl mb-8">{conviteRecebido.de} chamando...</h3>
            <button onClick={() => { setNomeSalaCall(conviteRecebido.sala); setChamadaAtiva(true); setConviteRecebido(null); }} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold mb-2">Atender</button>
            <button onClick={() => setConviteRecebido(null)} className="w-full text-slate-400 py-4 font-bold">Recusar</button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6"><h2 className="font-bold text-2xl">Membros</h2></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => {
            const imgLink = getImagemUrl(u.usuario_foto || u.foto);
            return (
              <div key={i} onClick={() => abrirPerfil(u.usuario_nome)} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center overflow-hidden">
                  <img src={imgLink} className="w-full h-full object-cover" alt={u.usuario_nome} onError={(e) => handleImageError(e, 'Sidebar')} />
                </div>
                <span className="text-sm font-bold truncate">{u.usuario_nome}</span>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col bg-white lg:rounded-l-[3rem] shadow-2xl border-l border-slate-100 relative">
        {chamadaAtiva && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col lg:rounded-l-[3rem] overflow-hidden">
            <div className="p-4 flex justify-end">
              <button onClick={() => setChamadaAtiva(false)} className="bg-[#ff4d4d] text-white px-6 py-2 rounded-full text-xs font-bold uppercase">Sair da Call</button>
            </div>
            <iframe src={`https://meet.jit.si/${nomeSalaCall}#userInfo.displayName="${dadosUsuario?.nome}"`} className="flex-1 border-none" allow="camera; microphone; display-capture; autoplay" />
          </div>
        )}

        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl">
          <h1 className="font-bold text-lg">{dadosEvento?.nome || 'Chat Geral'}</h1>
          <button onClick={() => iniciarCall('Todos')} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#ff4d4d]"><Video size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {mensagens.map((m, i) => {
            if (m.tipo === 'status' || m.texto?.includes("CALL_INVITE|")) return null;

            const souEu = m.usuario_nome === dadosUsuario.nome;
            const avatarOriginal = m.usuario_foto || m.foto || m.avatar;
            const imgLink = getImagemUrl(avatarOriginal);

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${souEu ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={imgLink}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, 'Chat')}
                      alt={m.usuario_nome}
                    />
                  </div>
                  <div className={`p-3 rounded-[1.5rem] ${souEu ? 'bg-[#ff4d4d]/10 text-[#ff4d4d]' : 'bg-slate-50 text-slate-900'}`}>
                    {m.texto && <p className="text-[11px] font-medium">{m.texto}</p>}
                    {m.imagem && (
                      <img
                        src={getImagemUrl(m.imagem)}
                        className="w-48 h-48 object-cover rounded-xl mt-2"
                        onError={(e) => handleImageError(e, 'Chat Imagem')}
                        alt=""
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={enviarMensagem} className="p-6 border-t border-slate-50 flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Escreva aqui..." 
            value={novoTexto} 
            onChange={e => setNovoTexto(e.target.value)} 
            className="flex-1 p-3 rounded-2xl border border-slate-100 text-sm focus:outline-none" 
          />
          <button type="submit" className="p-3 bg-[#ff4d4d] text-white rounded-full">
            <Send size={18} />
          </button>
        </form>
      </main>
    </div>
  );
}