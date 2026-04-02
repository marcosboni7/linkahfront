'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Send, Video, Loader2
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') return DEFAULT_FOTO;
  // URL externa
  if (/^(http|blob|data):/.test(foto)) return foto;
  // URL interna
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

  const handleImageError = (e: any) => { e.target.src = DEFAULT_FOTO; };

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id),
          usuario_nome: dadosUsuario.nome,
          usuario_foto: dadosUsuario.foto_perfil || dadosUsuario.avatar || null,
          texto: `CALL_INVITE|${destino}|${sala}`,
          tipo: 'status'
        })
      });
      setNomeSalaCall(sala);
      setChamadaAtiva(true);
    } catch (err) { console.error(err); }
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;
    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: dadosUsuario.foto_perfil || dadosUsuario.avatar || null,
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

  const abrirPerfil = async (nome: string) => {
    setCarregandoPerfil(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/perfil-publico?nome=${encodeURIComponent(nome)}`);
      if (res.ok) setUsuarioSelecionado(await res.json());
      else setUsuarioSelecionado({ nome, bio: null });
    } catch (err) { setUsuarioSelecionado({ nome, bio: null }); }
    finally { setCarregandoPerfil(false); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) setDadosUsuario(JSON.parse(savedUser));
    else router.push('/site/login');
  }, [router]);

  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        const minhaFoto = dadosUsuario.foto_perfil || dadosUsuario.avatar || '';
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
        if (resMsg.ok) setMensagens(await resMsg.json());
        setCarregando(false);
      } catch (e) { console.error(e); }
    };

    atualizar();
    const int = setInterval(atualizar, 4000);
    return () => clearInterval(int);
  }, [id, dadosUsuario]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  if (carregando) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#ff4d4d]" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6"><h2 className="font-bold text-2xl">Membros</h2></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => {
            const imgLink = getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto);
            return (
              <div key={i} onClick={() => abrirPerfil(u.usuario_nome)} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img src={imgLink} className="w-full h-full object-cover" alt={u.usuario_nome} onError={handleImageError} />
                </div>
                <span className="text-sm font-bold truncate">{u.usuario_nome}</span>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col bg-white lg:rounded-l-[3rem] shadow-2xl border-l border-slate-100 relative">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl">
          <h1 className="font-bold text-lg">{dadosEvento?.nome || 'Chat Geral'}</h1>
          <button onClick={() => iniciarCall('Todos')} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#ff4d4d]"><Video size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {mensagens.map((m, i) => {
            if (m.tipo === 'status' || m.texto?.includes("CALL_INVITE|")) return null;
            const souEu = m.usuario_nome === dadosUsuario.nome;
            const imgLink = getImagemUrl(m.foto_perfil || m.avatar || m.usuario_foto || m.foto);
            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${souEu ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img src={imgLink} className="w-full h-full object-cover" onError={handleImageError} alt={m.usuario_nome} />
                  </div>
                  <div className={`p-3 rounded-[1.5rem] ${souEu ? 'bg-[#ff4d4d]/10 text-[#ff4d4d]' : 'bg-slate-50 text-slate-900'}`}>
                    {m.texto && <p className="text-[11px] font-medium">{m.texto}</p>}
                    {m.imagem && <img src={getImagemUrl(m.imagem)} className="w-48 h-48 object-cover rounded-xl mt-2" onError={handleImageError} alt="" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={enviarMensagem} className="p-6 border-t border-slate-50 flex items-center gap-4">
          <input type="text" placeholder="Escreva aqui..." value={novoTexto} onChange={e => setNovoTexto(e.target.value)} className="flex-1 p-3 rounded-2xl border border-slate-100 text-sm focus:outline-none" />
          <button type="submit" className="p-3 bg-[#ff4d4d] text-white rounded-full"><Send size={18} /></button>
        </form>
      </main>
    </div>
  );
}