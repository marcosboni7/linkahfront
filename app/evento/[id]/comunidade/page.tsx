'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, Paperclip, Send, Video, Phone, 
  MoreVertical, Smile, ChevronLeft, X, 
  Check, Loader2 
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
  const [conviteRecebido, setConviteRecebido] = useState<any>(null);

  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Autenticação e Perfil
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else {
      router.push('/site/login');
    }
  }, [router]);

  // 2. Loop de Sincronização (Polling)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        // Buscamos Evento, Mensagens e a Presença Real simultaneamente
        const [resEv, resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/eventos/${id}`),
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}`)
        ]);

        if (resEv.ok) setDadosEvento(await resEv.json());

        // Atualiza Lista de Usuários Online
        if (resOn.ok) {
          const on = await resOn.json();
          // Filtra para não mostrar você mesmo na lista lateral
          setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }

        // Atualiza Mensagens e Detecta Convites de Call
        if (resMsg.ok) {
          const msgs = await resMsg.json();
          setMensagens(msgs);

          const AGORA = Date.now();
          const MEU_NOME_LIMPO = dadosUsuario.nome.trim().toLowerCase();

          // Analisa as últimas mensagens em busca de um CALL_INVITE para mim
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
        console.error("Erro na sincronização:", e); 
      }
    };

    atualizar();
    const int = setInterval(atualizar, 4000);
    return () => clearInterval(int);
  }, [id, dadosUsuario, chamadaAtiva, conviteRecebido]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 3. Funções de Ação
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
    } catch (err) { 
      console.error(err); 
    }
  };

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    
    // Envia o convite via sistema (tipo status para não poluir o chat)
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
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#C22973] mb-4" size={40} />
      <p className="font-black italic text-slate-900 uppercase tracking-widest text-xs">Conectando...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden text-slate-700 font-sans">
      
      {/* MODAL CONVITE RECEBIDO */}
      {conviteRecebido && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] text-center max-w-xs w-full shadow-2xl">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C22973]">
              <Phone size={40} className="animate-bounce" />
            </div>
            <p className="font-black uppercase text-xs mb-6 text-slate-400 tracking-widest">
              {conviteRecebido.de} está chamando...
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setNomeSalaCall(conviteRecebido.sala); setChamadaAtiva(true); setConviteRecebido(null); }} 
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs tracking-widest shadow-lg"
              >
                ACEITAR
              </button>
              <button 
                onClick={() => setConviteRecebido(null)} 
                className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs tracking-widest"
              >
                RECUSAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR ONLINE */}
      <aside className="w-80 border-r hidden lg:flex flex-col bg-[#fbfbfc]">
        <div className="p-6 border-b bg-white">
          <h2 className="font-black italic text-[#C22973] uppercase tracking-tighter text-2xl mb-6">Linkah</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Buscar membros..." className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[10px] font-black text-slate-300 uppercase p-2 tracking-[0.2em]">Membros Online</p>
          {usuariosOnline.length === 0 ? (
            <p className="text-center text-[10px] font-bold text-slate-300 uppercase py-10">Ninguém online agora</p>
          ) : usuariosOnline.map((u, i) => (
            <div 
              key={i} 
              onClick={() => iniciarCall(u.usuario_nome)} 
              className="flex items-center gap-3 p-3 hover:bg-white rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group shadow-sm hover:shadow-md"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#C22973] flex items-center justify-center font-black uppercase tracking-tighter">
                  {u.usuario_nome.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate uppercase italic tracking-tighter">{u.usuario_nome}</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase">Disponível</p>
              </div>
              <Video size={18} className="text-slate-200 group-hover:text-[#C22973]" />
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT PRINCIPAL */}
      <main className="flex-1 flex flex-col relative bg-white">
        
        {/* TELA DE CHAMADA (JITSI) */}
        {chamadaAtiva && (
          <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col">
            <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Linkah Live Secured</span>
              </div>
              <button 
                onClick={() => setChamadaAtiva(false)} 
                className="bg-red-500 text-white px-8 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-red-600 transition-colors"
              >
                ENCERRAR
              </button>
            </div>
            <iframe 
              src={`https://meet.jit.si/${nomeSalaCall}#userInfo.displayName="${dadosUsuario?.nome}"&config.prejoinPageEnabled=false`} 
              className="flex-1 border-none" 
              allow="camera; microphone; display-capture; autoplay; clipboard-write" 
            />
          </div>
        )}

        {/* HEADER DO CHAT */}
        <header className="p-6 border-b flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl italic border-4 border-slate-100 shadow-lg">
              {dadosEvento?.nome?.charAt(0)}
            </div>
            <div>
              <h1 className="font-black uppercase italic text-base tracking-tighter text-slate-900">{dadosEvento?.nome}</h1>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Comunidade Ativa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <Video size={22} className="text-slate-300 hover:text-[#C22973] cursor-pointer" onClick={() => iniciarCall('Todos')} />
            <Phone size={20} className="text-slate-300 hover:text-[#C22973] cursor-pointer" onClick={() => iniciarCall('Todos')} />
            <MoreVertical size={22} className="text-slate-200" />
          </div>
        </header>

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {mensagens.map((m, i) => {
            // Esconde pings de sistema e convites do fluxo principal de texto
            if(m.tipo === 'status' || m.texto?.includes("CALL_INVITE|")) return null;
            
            const souEu = m.usuario_nome === dadosUsuario.nome;
            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!souEu && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase mb-1">
                    {m.usuario_nome.charAt(0)}
                  </div>
                )}
                <div className={`max-w-[75%] p-4 rounded-[2rem] shadow-sm ${
                  souEu 
                  ? 'bg-[#C22973] text-white rounded-br-none shadow-pink-100' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                }`}>
                  {!souEu && (
                    <p className="text-[9px] font-black uppercase mb-1 opacity-50 tracking-widest">{m.usuario_nome}</p>
                  )}
                  {m.imagem && (
                    <img src={m.imagem} className="rounded-2xl mb-2 max-h-80 w-full object-cover border border-black/5" alt="Anexo" />
                  )}
                  {m.texto && <p className="text-[15px] font-medium leading-relaxed">{m.texto}</p>}
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>

        {/* FOOTER - ENTRADA DE TEXTO */}
        <footer className="p-6 border-t bg-white">
          <form onSubmit={enviarMensagem} className="max-w-5xl mx-auto flex gap-4 items-end">
            <div className="flex-1 bg-slate-50 rounded-[2rem] p-2 flex flex-col focus-within:bg-white border-2 border-transparent focus-within:border-pink-50 transition-all">
              {imagemAnexada && (
                <div className="p-3 relative inline-block">
                  <img src={imagemAnexada} className="h-24 w-24 object-cover rounded-2xl border-2 border-white shadow-md" alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => setImagemAnexada(null)} 
                    className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-3 text-slate-400 hover:text-[#C22973] transition-colors"
                >
                  <Paperclip size={22} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*"
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
                  className="flex-1 bg-transparent py-4 text-sm font-bold outline-none text-slate-800" 
                  placeholder="Escreva sua mensagem..." 
                />
                <button type="button" className="p-3 text-slate-300">
                  <Smile size={22} />
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="bg-[#C22973] text-white p-5 rounded-[1.5rem] shadow-xl shadow-pink-100 hover:scale-105 active:scale-95 transition-all"
            >
              <Send size={24} />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}