'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, Paperclip, Send, Video, Phone, 
  MoreVertical, Smile, X, Loader2, Users, Sparkles, ChevronLeft,
  Instagram, Linkedin, UserCircle, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';

const API_URL = 'https://api-linkah.onrender.com';

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

  // ESTADOS PARA PERFIL (NOVO)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Autenticação
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else {
      router.push('/site/login');
    }
  }, [router]);

  // 2. Sync Loop
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        const [resEv, resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/eventos/${id}`),
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}`)
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
                setConviteRecebido({ de: msg.usuario_nome, sala: salaSugerida });
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

  // FUNÇÃO ABRIR PERFIL (NOVO)
  const abrirPerfil = async (nome: string) => {
    setCarregandoPerfil(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/perfil-publico?nome=${encodeURIComponent(nome)}`);
      if (res.ok) {
        const data = await res.json();
        setUsuarioSelecionado(data);
      } else {
        // Fallback caso não tenha perfil completo ainda
        setUsuarioSelecionado({ nome, bio: null });
      }
    } catch (err) {
      console.error(err);
      setUsuarioSelecionado({ nome, bio: null });
    } finally {
      setCarregandoPerfil(false);
    }
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const payload = { 
      evento_id: Number(id), 
      usuario_nome: dadosUsuario.nome, 
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
    
    await fetch(`${API_URL}/api/comunidades/enviar`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        evento_id: Number(id), 
        usuario_nome: dadosUsuario.nome, 
        texto: `CALL_INVITE|${destino}|${sala}`, 
        tipo: 'status' 
      })
    });

    setNomeSalaCall(sala); 
    setChamadaAtiva(true);
  };

  if (carregando) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FCFBFA]">
      <div className="relative">
        <Loader2 className="animate-spin text-[#ff4d4d]" size={48} />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#ff4d4d] rounded-full"></div>
        </div>
      </div>
      <p className="mt-6 font-bold text-slate-400 text-xs uppercase tracking-[0.3em]">{t.sync || "Sincronizando Linkah..."}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden text-slate-900 font-sans">
      
      {/* MODAL CONVITE RECEBIDO */}
      {conviteRecebido && (
        <div className="fixed inset-0 z-[999] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#ff4d4d] relative">
              <Phone size={40} className="animate-pulse" />
              <div className="absolute inset-0 border-4 border-[#ff4d4d]/10 rounded-full animate-ping"></div>
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2">{conviteRecebido.de}</h3>
            <p className="font-medium text-slate-400 text-sm mb-8">
              {t.chatIsCalling || "está te convidando para uma conversa por vídeo."}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setNomeSalaCall(conviteRecebido.sala); setChamadaAtiva(true); setConviteRecebido(null); }} 
                className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-sm tracking-tight shadow-xl hover:bg-black transition-all"
              >
                Atender Chamada
              </button>
              <button 
                onClick={() => setConviteRecebido(null)} 
                className="w-full bg-white text-slate-400 py-4 rounded-2xl font-bold text-sm hover:text-rose-500 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PERFIL DO USUÁRIO (NOVO) */}
      {usuarioSelecionado && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setUsuarioSelecionado(null)}>
          <div className="bg-white w-full max-w-md rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20" onClick={e => e.stopPropagation()}>
            <div className="h-32 bg-slate-950 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff4d4d]/20 to-transparent"></div>
              <button onClick={() => setUsuarioSelecionado(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
                <X size={20} />
              </button>
            </div>
            
            <div className="px-10 pb-12 -mt-16 text-center relative z-10">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] mx-auto p-2 shadow-2xl relative">
                <div className="w-full h-full bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black italic">
                  {usuarioSelecionado.nome?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                  <ShieldCheck className="text-white" size={18} />
                </div>
              </div>

              <h3 className="mt-6 text-3xl font-black text-slate-950 tracking-tighter italic uppercase">{usuarioSelecionado.nome}</h3>
              <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase mb-8 italic flex items-center justify-center gap-2">
                <Sparkles size={12} className="text-[#ff4d4d]" /> Linkah Producer
              </p>

              <div className="bg-slate-50/80 rounded-[2rem] p-6 mb-8 border border-slate-100">
                {usuarioSelecionado.bio ? (
                  <p className="text-slate-600 text-sm font-bold leading-relaxed italic">
                    "{usuarioSelecionado.bio}"
                  </p>
                ) : (
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Sem bio disponível</p>
                )}
              </div>

              <div className="flex justify-center gap-4 mb-10">
                {usuarioSelecionado.instagram && (
                  <a href={`https://instagram.com/${usuarioSelecionado.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="w-14 h-14 flex items-center justify-center bg-pink-50 text-pink-500 rounded-2xl hover:scale-110 hover:bg-pink-500 hover:text-white transition-all shadow-sm">
                    <Instagram size={22} />
                  </a>
                )}
                {usuarioSelecionado.linkedin && (
                  <a href={usuarioSelecionado.linkedin} target="_blank" rel="noreferrer" className="w-14 h-14 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl hover:scale-110 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <Linkedin size={22} />
                  </a>
                )}
                <div className="w-14 h-14 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl">
                  <UserCircle size={22} />
                </div>
              </div>

              <button 
                onClick={() => { iniciarCall(usuarioSelecionado.nome); setUsuarioSelecionado(null); }}
                className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-[#ff4d4d] active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                <Video size={18} />
                Iniciar Vídeo Chamada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR ONLINE */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-950 mb-8 transition-colors">
             <ChevronLeft size={18} />
             <span className="font-bold text-xs tracking-tight">Voltar ao início</span>
          </Link>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-2xl tracking-tight text-slate-950">Membros</h2>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {usuariosOnline.length} Online
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d4d] transition-colors" size={16} />
            <input type="text" placeholder="Filtrar membros..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-medium outline-none focus:bg-white focus:border-[#ff4d4d] transition-all" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {usuariosOnline.length === 0 ? (
            <div className="text-center py-20 px-6">
                <Users className="mx-auto text-slate-100 mb-4" size={40} />
                <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">{t.noOneOnline || "Ninguém online"}</p>
            </div>
          ) : usuariosOnline.map((u, i) => (
            <div 
              key={i} 
              onClick={() => abrirPerfil(u.usuario_nome)} // MUDOU AQUI
              className="flex items-center gap-3 p-3 hover:bg-[#FCFBFA] rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm">
                  {u.usuario_nome.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{u.usuario_nome}</p>
                <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest">Disponível</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-lg shadow-sm">
                <UserCircle size={16} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT PRINCIPAL */}
      <main className="flex-1 flex flex-col relative bg-white lg:rounded-l-[3rem] shadow-2xl border-l border-slate-100">
        
        {/* TELA DE CHAMADA JITSI */}
        {chamadaAtiva && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col lg:rounded-l-[3rem] overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center gap-3 px-4">
                <div className="w-2 h-2 bg-[#ff4d4d] rounded-full animate-pulse shadow-[0_0_10px_#ff4d4d]"></div>
                <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase opacity-70">Linkah Live Secured</span>
              </div>
              <button 
                onClick={() => setChamadaAtiva(false)} 
                className="bg-[#ff4d4d] text-white px-8 py-2.5 rounded-full text-[10px] font-black tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-rose-500/20"
              >
                DESCONECTAR
              </button>
            </div>
            <iframe 
              src={`https://meet.jit.si/${nomeSalaCall}#userInfo.displayName="${dadosUsuario?.nome}"&config.prejoinPageEnabled=false`} 
              className="flex-1 border-none bg-black" 
              allow="camera; microphone; display-capture; autoplay; clipboard-write" 
              title="Chamada de Vídeo"
            />
          </div>
        )}

        {/* HEADER DO CHAT */}
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-950 flex items-center justify-center font-black text-2xl shadow-sm overflow-hidden">
               {dadosEvento?.capa ? (
                   <img src={dadosEvento.capa} className="w-full h-full object-cover" alt="Capa" />
               ) : dadosEvento?.nome?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-slate-950">{dadosEvento?.nome}</h1>
                <Sparkles size={14} className="text-[#ff4d4d]" />
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Canal Geral • 24h ativo
                 </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <button onClick={() => iniciarCall('Todos')} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-[#ff4d4d]/5 hover:text-[#ff4d4d] transition-all group">
                <Video size={20} />
            </button>
            <button onClick={() => iniciarCall('Todos')} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all">
                <Phone size={18} />
            </button>
            <button className="p-3 text-slate-200">
                <MoreVertical size={22} />
            </button>
          </div>
        </header>

        {/* MENSAGENS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#FCFBFA]/50">
          {mensagens.map((m, i) => {
            if(m.tipo === 'status' || m.texto?.includes("CALL_INVITE|")) return null;
            const souEu = m.usuario_nome === dadosUsuario.nome;
            
            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-3 max-w-[80%] ${souEu ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!souEu && (
                    <div 
                      onClick={() => abrirPerfil(m.usuario_nome)} // MUDOU AQUI
                      className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm cursor-pointer hover:border-[#ff4d4d] transition-all"
                    >
                      {m.usuario_nome.charAt(0)}
                    </div>
                  )}
                  
                  <div className={`space-y-1 ${souEu ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 mb-1 px-1 ${souEu ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[11px] font-bold text-slate-900">{souEu ? 'Você' : m.usuario_nome}</span>
                        <span className="text-[9px] font-medium text-slate-300 uppercase tracking-tighter">
                            {new Date(m.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    
                    <div className={`p-4 rounded-[1.5rem] shadow-sm relative ${
                      souEu 
                      ? 'bg-slate-950 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      {m.imagem && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-black/5">
                           <img src={m.imagem} className="max-h-80 w-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in" alt="Anexo" />
                        </div>
                      )}
                      {m.texto && <p className="text-sm font-medium leading-snug tracking-tight">{m.texto}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>

        {/* INPUT */}
        <footer className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto">
            <div className="bg-slate-50 rounded-[1.5rem] p-2 flex flex-col focus-within:bg-white border border-transparent focus-within:border-slate-100 focus-within:ring-4 focus-within:ring-[#ff4d4d]/5 transition-all">
              
              {imagemAnexada && (
                <div className="p-3 relative inline-block">
                  <div className="relative h-24 w-24">
                    <img src={imagemAnexada} className="h-full w-full object-cover rounded-xl border border-slate-100 shadow-xl" alt="Preview" />
                    <button 
                        type="button" 
                        onClick={() => setImagemAnexada(null)} 
                        className="absolute -top-2 -right-2 bg-slate-950 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                    >
                        <X size={12} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-[#ff4d4d] transition-colors rounded-xl">
                  <Paperclip size={20} />
                </button>
                <input type="file" ref={fileInputRef} hidden accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if(f){ 
                      const r = new FileReader(); 
                      r.onloadend = () => setImagemAnexada(r.result as string); 
                      r.readAsDataURL(f); 
                    }
                  }} 
                />
                <input 
                  value={novoTexto} 
                  onChange={e => setNovoTexto(e.target.value)} 
                  className="flex-1 bg-transparent py-4 px-2 text-sm font-medium outline-none text-slate-900 placeholder:text-slate-300" 
                  placeholder={`Enviar mensagem para ${dadosEvento?.nome || 'comunidade'}...`} 
                />
                <div className="flex items-center gap-1 px-2">
                    <button type="button" className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                        <Smile size={20} />
                    </button>
                    <button type="submit" className="bg-slate-950 text-white p-3.5 rounded-xl shadow-lg hover:bg-black hover:scale-105 active:scale-95 transition-all">
                        <Send size={18} className="text-[#ff4d4d]" />
                    </button>
                </div>
              </div>
            </div>
          </form>
        </footer>
      </main>
    </div>
  );
}