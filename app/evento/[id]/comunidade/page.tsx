'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, Paperclip, Send, Video, Phone, 
  MoreVertical, Smile, ChevronLeft, X, 
  PhoneOff, Check, Ban, Loader2
} from 'lucide-react';

// --- CONFIGURAÇÃO DA API DA AWS ---
const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function SalaLinkahSkype() {
  const { id } = useParams();
  const router = useRouter();
  
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [nomeSalaCall, setNomeSalaCall] = useState(''); 
  const [conviteRecebido, setConviteRecebido] = useState<{ de: string, sala: string, idMsg: any } | null>(null);

  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Autenticação e Carregamento de Perfil
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) setDadosUsuario(JSON.parse(savedUser));
    else router.push('/site/login');
  }, [router]);

  // 2. Loop de Sincronização (Polling)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizarDados = async () => {
      try {
        const [resEv, resMsg] = await Promise.all([
          fetch(`${API_URL}/eventos/${id}`),
          fetch(`${API_URL}/comunidade/${id}?t=${Date.now()}`)
        ]);

        if (resEv.ok) setDadosEvento(await resEv.json());

        if (resMsg.ok) {
          const lista = await resMsg.json();
          setMensagens(lista);

          const AGORA = Date.now();
          const MEU_NOME_LIMPO = dadosUsuario.nome.trim().toLowerCase();

          // LÓGICA DE DETECÇÃO DE CHAMADA (RINGING)
          lista.forEach((msg: any) => {
            if (msg.texto && msg.texto.includes("CALL_INVITE|")) {
              const partes = msg.texto.split("|");
              const destino = partes[1]?.trim().toLowerCase();
              const salaSugerida = partes[2];
              
              const dataMsg = new Date(msg.criado_em).getTime();
              const segundosPassados = (AGORA - dataMsg) / 1000;

              if (
                destino === MEU_NOME_LIMPO && 
                segundosPassados < 30 && 
                msg.usuario_nome.trim().toLowerCase() !== MEU_NOME_LIMPO &&
                !chamadaAtiva && 
                conviteRecebido?.idMsg !== msg.id
              ) {
                setConviteRecebido({ de: msg.usuario_nome, sala: salaSugerida, idMsg: msg.id });
              }
            }
          });

          // MAPEAMENTO DE USUÁRIOS ATIVOS (PINGS ÚLTIMOS 40s)
          const ativosAgora = lista.reduce((acc: any[], curr: any) => {
            const dataInteracao = new Date(curr.criado_em).getTime();
            if ((AGORA - dataInteracao) < 40000) {
               const index = acc.findIndex((u: any) => u.usuario_nome === curr.usuario_nome);
               const statusCall = curr.texto === "system_ping_on_call";
               if (index === -1) {
                acc.push({ usuario_nome: curr.usuario_nome, emCall: statusCall });
               } else if (statusCall) {
                acc[index].emCall = true;
               }
            }
            return acc;
          }, []);
          
          setUsuariosOnline(ativosAgora.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }
        setCarregando(false);
      } catch (err) { console.error("Erro fetch:", err); }
    };

    const enviarSinalVida = async () => {
        try {
          await fetch(`${API_URL}/comunidade/enviar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              evento_id: Number(id), 
              usuario_nome: dadosUsuario.nome, 
              texto: chamadaAtiva ? "system_ping_on_call" : "system_ping_active", 
              tipo: "status" 
            })
          });
        } catch (e) {}
    };

    atualizarDados();
    const chatInt = setInterval(atualizarDados, 4000);
    const pingInt = setInterval(enviarSinalVida, 15000);
    return () => { clearInterval(chatInt); clearInterval(pingInt); };
  }, [id, dadosUsuario, chamadaAtiva, conviteRecebido]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 3. Funções de Ação
  const iniciarCallPrivada = async (nomeDestino: string) => {
    if (!dadosUsuario) return;
    const par = [dadosUsuario.nome, nomeDestino].sort();
    const salaPrivada = `Linkah_Priv_${par[0].replace(/\s/g, '_')}_${par[1].replace(/\s/g, '_')}`;
    
    await fetch(`${API_URL}/comunidade/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        evento_id: Number(id), 
        usuario_nome: dadosUsuario.nome, 
        texto: `CALL_INVITE|${nomeDestino}|${salaPrivada}`, 
        tipo: "status" 
      })
    });

    setNomeSalaCall(salaPrivada);
    setChamadaAtiva(true);
  };

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada) || !dadosUsuario) return;
    
    const payload = { 
      evento_id: Number(id), 
      usuario_nome: dadosUsuario.nome, 
      texto: novoTexto, 
      imagem: imagemAnexada, 
      tipo: "chat" 
    };

    setNovoTexto(''); setImagemAnexada(null);
    try {
      await fetch(`${API_URL}/comunidade/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.error(err); }
  };

  if (carregando) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#C22973] mb-4" size={48} />
        <p className="font-black italic text-slate-900 uppercase tracking-widest text-xs">Conectando à Comunidade...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans overflow-hidden">
      
      {/* MODAL DE CONVITE */}
      {conviteRecebido && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center border border-white animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#C22973] shadow-inner">
              <Phone size={48} className="animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1 uppercase italic tracking-tighter">Chamada de Vídeo</h2>
            <p className="text-slate-400 mb-10 font-bold text-xs uppercase tracking-widest">{conviteRecebido.de} está chamando...</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setNomeSalaCall(conviteRecebido.sala); setChamadaAtiva(true); setConviteRecebido(null); }}
                className="bg-emerald-500 text-white py-5 rounded-2xl font-black tracking-widest text-xs shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
              >
                <Check size={20} /> ACEITAR
              </button>
              <button 
                onClick={() => setConviteRecebido(null)}
                className="bg-slate-100 text-slate-400 py-5 rounded-2xl font-black tracking-widest text-xs hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
              >
                <X size={18} /> RECUSAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR DE CONTATOS */}
      <aside className="w-80 bg-[#fbfbfc] border-r border-slate-100 flex flex-col hidden lg:flex">
        <div className="p-6 bg-white border-b border-slate-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#C22973] flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-pink-100">{dadosUsuario?.nome?.charAt(0)}</div>
            <div className="font-black text-slate-900 italic uppercase tracking-tighter truncate">{dadosUsuario?.nome}</div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Buscar membros..." className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 ring-[#C22973]/10" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <p className="px-4 mb-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Pessoas Online</p>
          {usuariosOnline.length === 0 ? (
            <p className="text-center text-[10px] font-bold text-slate-300 uppercase py-10 tracking-widest">Aguardando membros...</p>
          ) : usuariosOnline.map((user, idx) => (
            <div 
              key={idx} 
              onClick={() => iniciarCallPrivada(user.usuario_nome)}
              className="flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group border border-transparent hover:border-slate-50"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black uppercase text-slate-400 border border-white group-hover:bg-pink-50 group-hover:text-[#C22973] transition-colors">{user.usuario_nome.charAt(0)}</div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 truncate uppercase italic">{user.usuario_nome}</h4>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Disponível</p>
              </div>
              <Video size={18} className="text-slate-200 group-hover:text-[#C22973] transition-colors" />
            </div>
          ))}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col bg-white relative">
        
        {/* JANELA DE VÍDEO (JITSI) */}
        {chamadaAtiva && (
          <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4 bg-slate-900 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Chamada Linkah Secured</span>
              </div>
              <button onClick={() => setChamadaAtiva(false)} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] tracking-widest shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2">
                <PhoneOff size={14} /> ENCERRAR
              </button>
            </div>
            <iframe 
              src={`https://meet.jit.si/${nomeSalaCall}#userInfo.displayName="${dadosUsuario?.nome}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.disableDeepLinking=true`}
              className="flex-1 w-full border-none"
              allow="camera; microphone; display-capture; autoplay; clipboard-write"
            />
          </div>
        )}

        {/* HEADER DO CHAT */}
        <header className="px-8 py-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="lg:hidden text-slate-400"><ChevronLeft /></button>
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#C22973] font-black border border-slate-100 uppercase italic text-lg shadow-inner">{dadosEvento?.nome?.charAt(0)}</div>
             <div>
                <h3 className="font-black text-slate-900 text-base uppercase italic tracking-tighter">{dadosEvento?.nome}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Linkah Community • {mensagens.length} msgs</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <Video size={22} className="cursor-pointer text-slate-300 hover:text-[#C22973] transition-colors" onClick={() => { setNomeSalaCall(`Group_${id}`); setChamadaAtiva(true); }} />
             <Phone size={20} className="cursor-pointer text-slate-300 hover:text-[#C22973] transition-colors" onClick={() => { setNomeSalaCall(`Group_${id}`); setChamadaAtiva(true); }} />
             <MoreVertical size={22} className="text-slate-200 cursor-pointer" />
          </div>
        </header>

        {/* MENSAGENS */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20">
          {mensagens.map((msg, idx) => {
            // Esconde pings de sistema e convites da timeline principal
            if (msg.texto?.includes("system_ping") || msg.texto?.includes("CALL_INVITE|")) return null;
            const souEu = dadosUsuario?.nome === msg.usuario_nome;
            return (
              <div key={idx} className={`flex gap-4 ${souEu ? 'flex-row-reverse' : 'flex-row'} items-start animate-in slide-in-from-bottom-2`}>
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0 flex items-center justify-center text-[11px] font-black text-slate-400 uppercase shadow-sm">{msg.usuario_nome.charAt(0)}</div>
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <span className="text-[10px] font-black text-slate-300 mb-2 uppercase tracking-widest">{msg.usuario_nome}</span>
                  <div className={`px-6 py-4 rounded-[2rem] text-[15px] font-medium shadow-sm ${souEu ? 'bg-[#C22973] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                    {msg.imagem && <img src={msg.imagem} className="rounded-2xl mb-3 max-h-80 w-full object-cover border border-black/5" alt="Anexo" />}
                    {msg.texto && <p className="leading-relaxed">{msg.texto}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* INPUT */}
        <footer className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={enviarMensagem} className="max-w-5xl mx-auto flex items-end gap-4">
            <div className="flex-1 bg-slate-50 rounded-[2rem] p-3 flex flex-col focus-within:bg-white border-2 border-transparent focus-within:border-pink-50 transition-all shadow-inner">
              {imagemAnexada && (
                <div className="p-3 relative inline-block">
                  <img src={imagemAnexada} className="h-24 w-24 object-cover rounded-2xl border-4 border-white shadow-lg" alt="Preview" />
                  <button type="button" onClick={() => setImagemAnexada(null)} className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-1 shadow-lg hover:bg-red-500"><X size={14} /></button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-300 hover:text-[#C22973] transition-colors"><Paperclip size={22} /></button>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { const r = new FileReader(); r.onloadend = () => setImagemAnexada(r.result as string); r.readAsDataURL(f); }
                }} />
                <input type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} placeholder="Envie algo incrível..." className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300" />
                <Smile size={22} className="text-slate-300 hover:text-yellow-500 cursor-pointer transition-colors" />
              </div>
            </div>
            <button type="submit" className="bg-[#C22973] text-white p-5 rounded-[1.5rem] shadow-xl shadow-pink-100 active:scale-90 hover:bg-[#a62262] transition-all"><Send size={24} /></button>
          </form>
        </footer>
      </main>
    </div>
  );
}