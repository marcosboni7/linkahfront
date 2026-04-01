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

// Função para garantir que src de <img> nunca seja null
const getImagemUrl = (foto: string | null | undefined) => foto || undefined;

export default function SalaLinkahSkype() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // Estados para Call
  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [nomeSalaCall, setNomeSalaCall] = useState('');
  const [conviteRecebido, setConviteRecebido] = useState<any>(null);

  // Estados para Chat
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  // ESTADOS PARA PERFIL
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Autenticação e Carregamento de Dados Locais
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else {
      router.push('/site/login');
    }
  }, [router]);

  // 2. Sync Loop (Eventos, Mensagens e Presença com Foto)
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
          setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          setMensagens(msgs);

          const AGORA = Date.now();
          const MEU_NOME_LIMPO = dadosUsuario.nome.trim().toLowerCase();

          msgs.slice(-5).forEach((msg: any) => {
            if (msg.texto?.includes("CALL_INVITE|")) {
              const partes = msg.texto.split("|");
              const destino = partes[1]?.trim().toLowerCase();
              const salaSugerida = partes[2];
              const dataMsg = new Date(msg.criado_em).getTime();
              const segundosPassados = (AGORA - dataMsg) / 1000;

              if (
                destino === MEU_NOME_LIMPO &&
                segundosPassados < 25 &&
                msg.usuario_nome.trim().toLowerCase() !== MEU_NOME_LIMPO &&
                !chamadaAtiva &&
                conviteRecebido?.sala !== salaSugerida
              ) {
                setConviteRecebido({
                  de: msg.usuario_nome,
                  sala: salaSugerida,
                  foto: msg.usuario_foto || msg.foto || msg.avatar
                });
              }
            }
          });
        }
        setCarregando(false);
      } catch (e) {
        console.error("Erro sync:", e);
      }
    };

    atualizar();
    const int = setInterval(atualizar, 4000);
    return () => clearInterval(int);
  }, [id, dadosUsuario, chamadaAtiva, conviteRecebido]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const abrirPerfil = async (nome: string) => {
    setCarregandoPerfil(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/perfil-publico?nome=${encodeURIComponent(nome)}`);
      if (res.ok) {
        const data = await res.json();
        setUsuarioSelecionado(data);
      } else {
        setUsuarioSelecionado({ nome, bio: null });
      }
    } catch (err) {
      setUsuarioSelecionado({ nome, bio: null });
    } finally {
      setCarregandoPerfil(false);
    }
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const fotoParaEnviar = dadosUsuario?.foto || dadosUsuario?.usuario_foto || null;

    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: fotoParaEnviar,
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

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    const fotoCall = dadosUsuario.foto || dadosUsuario.usuario_foto || null;

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
  };

  if (carregando) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FCFBFA]">
      <Loader2 className="animate-spin text-[#ff4d4d]" size={48} />
      <p className="mt-6 font-bold text-slate-400 text-xs uppercase tracking-[0.3em]">Sincronizando Linkah...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden text-slate-900 font-sans">

      {/* MODAL CONVITE RECEBIDO */}
      {conviteRecebido && (
        <div className="fixed inset-0 z-[999] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden bg-slate-100">
              {(conviteRecebido.foto) ? (
                <img src={getImagemUrl(conviteRecebido.foto)} className="w-full h-full object-cover" alt="Avatar" />
              ) : <Phone size={40} className="text-[#ff4d4d] animate-pulse" />}
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2">{conviteRecebido.de}</h3>
            <p className="font-medium text-slate-400 text-sm mb-8">está te chamando para vídeo.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setNomeSalaCall(conviteRecebido.sala); setChamadaAtiva(true); setConviteRecebido(null); }} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-sm shadow-xl">Atender Chamada</button>
              <button onClick={() => setConviteRecebido(null)} className="w-full bg-white text-slate-400 py-4 rounded-2xl font-bold text-sm">Agora não</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PERFIL */}
      {usuarioSelecionado && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setUsuarioSelecionado(null)}>
          <div className="bg-white w-full max-w-md rounded-[3.5rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-32 bg-slate-950 relative">
              <button onClick={() => setUsuarioSelecionado(null)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white"><X size={20} /></button>
            </div>
            <div className="px-10 pb-12 -mt-16 text-center relative z-10">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] mx-auto p-2 shadow-2xl relative">
                <div className="w-full h-full bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black overflow-hidden">
                  {(usuarioSelecionado.foto || usuarioSelecionado.usuario_foto) ? (
                    <img src={getImagemUrl(usuarioSelecionado.foto || usuarioSelecionado.usuario_foto)} className="w-full h-full object-cover" alt="Avatar" />
                  ) : usuarioSelecionado.nome?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center border-4 border-white">
                  <ShieldCheck className="text-white" size={18} />
                </div>
              </div>
              <h3 className="mt-6 text-3xl font-black text-slate-950 uppercase">{usuarioSelecionado.nome}</h3>
              <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase mb-8"><Sparkles size={12} className="inline text-[#ff4d4d] mr-1" /> Linkah Member</p>
              <button onClick={() => { iniciarCall(usuarioSelecionado.nome); setUsuarioSelecionado(null); }} className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#ff4d4d] transition-all flex items-center justify-center gap-4">
                <Video size={18} /> Iniciar Vídeo Chamada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR ONLINE */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-950 mb-8 transition-colors"><ChevronLeft size={18} /><span className="font-bold text-xs">Voltar</span></Link>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-2xl text-slate-950">Membros</h2>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{usuariosOnline.length} Online</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {usuariosOnline.map((u, i) => (
            <div key={i} onClick={() => abrirPerfil(u.usuario_nome)} className="flex items-center gap-3 p-3 hover:bg-[#FCFBFA] rounded-2xl cursor-pointer border border-transparent hover:border-slate-100 transition-all">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                  {(u.usuario_foto || u.foto || u.avatar) ?
                    <img src={getImagemUrl(u.usuario_foto || u.foto || u.avatar)} className="w-full h-full object-cover" alt="F" />
                    : u.usuario_nome.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{u.usuario_nome}</p>
                <p className="text-[10px] font-medium text-emerald-500 uppercase">Online</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT PRINCIPAL */}
      <main className="flex-1 flex flex-col relative bg-white lg:rounded-l-[3rem] shadow-2xl border-l border-slate-100">
        {chamadaAtiva && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col lg:rounded-l-[3rem] overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-slate-950/80 border-b border-white/5">
              <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 px-4">Linkah Live Secured</span>
              <button onClick={() => setChamadaAtiva(false)} className="bg-[#ff4d4d] text-white px-8 py-2.5 rounded-full text-[10px] font-black hover:brightness-110 transition-all">DESCONECTAR</button>
            </div>
            <iframe src={`https://meet.jit.si/${nomeSalaCall}#userInfo.displayName="${dadosUsuario?.nome}"&config.prejoinPageEnabled=false`} className="flex-1 border-none bg-black" allow="camera; microphone; display-capture; autoplay; clipboard-write" />
          </div>
        )}

        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-2xl overflow-hidden shadow-sm">
              {dadosEvento?.capa ? <img src={getImagemUrl(dadosEvento.capa)} className="w-full h-full object-cover" alt="Capa" /> : dadosEvento?.nome?.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-950">{dadosEvento?.nome}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Canal Geral</p>
            </div>
          </div>
          <button onClick={() => iniciarCall('Todos')} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#ff4d4d] transition-all"><Video size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#FCFBFA]/50">
          {mensagens.map((m, i) => {
            if (m.tipo === 'status' || m.texto?.includes("CALL_INVITE|")) return null;
            const souEu = m.usuario_nome === dadosUsuario.nome;

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-3 max-w-[80%] ${souEu ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div onClick={() => !souEu && abrirPerfil(m.usuario_nome)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden cursor-pointer shadow-sm">
                    {(m.usuario_foto || m.foto || m.avatar) ? (
                      <img src={getImagemUrl(m.usuario_foto || m.foto || m.avatar)} className="w-full h-full object-cover" alt="User" />
                    ) : m.usuario_nome.charAt(0)}
                  </div>
                  <div className={`space-y-1 ${souEu ? 'items-end' : 'items-start'}`}>
                    <span className="text-[11px] font-bold text-slate-900 px-1">{souEu ? 'Você' : m.usuario_nome}</span>
                    <div className={`p-4 rounded-[1.5rem] shadow-sm ${souEu ? 'bg-[#ff4d4d] text-white rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'}`}>
                      {m.imagem && <img src={getImagemUrl(m.imagem)} alt="Anexo" className="rounded-2xl mb-2 max-h-52 object-cover" />}
                      <p className="text-[13px] font-medium">{m.texto}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={enviarMensagem} className="p-6 border-t border-slate-100 bg-white flex items-center gap-4 sticky bottom-0 z-10">
          <input type="file" ref={fileInputRef} className="hidden" onChange={e => setImagemAnexada(URL.createObjectURL(e.target.files?.[0] || null))} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all"><Paperclip size={18} /></button>
          <input type="text" placeholder="Digite sua mensagem..." value={novoTexto} onChange={e => setNovoTexto(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl text-sm outline-none" />
          <button type="submit" className="p-3 rounded-2xl bg-[#ff4d4d] text-white hover:brightness-110 transition-all"><Send size={18} /></button>
        </form>
      </main>
    </div>
  );
}