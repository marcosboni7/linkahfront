'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, Paperclip, Send, Video, Phone, 
  MoreVertical, Smile, ChevronLeft, X, Image as ImageIcon,
  Calendar, PhoneOff 
} from 'lucide-react';

export default function SalaLinkahSkype() {
  const { id } = useParams();
  const router = useRouter();
  
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // ESTADO PARA CONTROLE DA CHAMADA DE GRUPO
  const [chamadaAtiva, setChamadaAtiva] = useState(false);

  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sinalInterval = useRef<any>(null);

  // FUNÇÃO DE FORMATAÇÃO DE DATA
  const formatarData = (evento: any) => {
    if (!evento) return 'A carregar...';
    const dataBruta = evento.data || evento.data_evento || evento.criado_em || evento.date;
    if (!dataBruta) return 'Data em breve';
    try {
      const data = new Date(dataBruta);
      if (isNaN(data.getTime())) return 'Data a definir';
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Data a definir';
    }
  };

  // 1. CARREGAR USUÁRIO DO LOCALSTORAGE
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else {
      router.push('/site/login');
    }
  }, [router]);

  // 2. LÓGICA DE PRESENÇA E SINCRONIZAÇÃO (ADAPTADO PARA STATUS DE CALL)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const enviarSinalVida = async () => {
      try {
        await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            evento_id: Number(id), 
            usuario_nome: dadosUsuario.nome, 
            // Se o usuário estiver na call, manda um ping especial
            texto: chamadaAtiva ? "system_ping_on_call" : "system_ping_active", 
            tipo: "status" 
          })
        });
      } catch (e) { console.error("Falha no sinal de vida"); }
    };

    const atualizarDados = async () => {
      try {
        const [resEv, resMsg] = await Promise.all([
          fetch(`https://linkah-api.onrender.com/api/eventos/${id}`),
          fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`)
        ]);

        if (resEv.ok) setDadosEvento(await resEv.json());

        if (resMsg.ok) {
          const lista = await resMsg.json();
          setMensagens(lista);

          const AGORA = Date.now();
          const LIMITE_ONLINE = 35 * 1000; 

          // Mapeia usuários ativos e verifica se estão em call
          const ativosAgora = lista.reduce((acc: any[], curr: any) => {
            const dataInteracao = new Date(curr.criado_em).getTime();
            const estaAtivo = (AGORA - dataInteracao) < LIMITE_ONLINE;

            if (estaAtivo) {
               const index = acc.findIndex((u: any) => u.usuario_nome === curr.usuario_nome);
               const statusCall = curr.texto === "system_ping_on_call";

               if (index === -1) {
                 acc.push({ usuario_nome: curr.usuario_nome, emCall: statusCall });
               } else if (statusCall) {
                 acc[index].emCall = true; // Se qualquer ping recente for de call, marca como em call
               }
            }
            return acc;
          }, []);

          setUsuariosOnline(ativosAgora);
        }
        setCarregando(false);
      } catch (err) { console.error("Erro na sincronização:", err); }
    };

    enviarSinalVida();
    atualizarDados();

    const chatInt = setInterval(atualizarDados, 4000);
    sinalInterval.current = setInterval(enviarSinalVida, 10000); // Ping mais rápido quando em call

    return () => {
      clearInterval(chatInt);
      clearInterval(sinalInterval.current);
    };
  }, [id, dadosUsuario, chamadaAtiva]); // Adicionado chamadaAtiva para atualizar o ping na hora

  // 3. AUTO-SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 4. ENVIO DE MENSAGENS
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada) || !dadosUsuario) return;
    
    const bkpTexto = novoTexto;
    const bkpImg = imagemAnexada;
    setNovoTexto('');
    setImagemAnexada(null);

    try {
      await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          evento_id: Number(id), 
          usuario_nome: dadosUsuario.nome, 
          texto: bkpTexto, 
          imagem: bkpImg 
        })
      });
    } catch (err) {
      setNovoTexto(bkpTexto);
      setImagemAnexada(bkpImg);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagemAnexada(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (carregando) return <div className="h-screen flex items-center justify-center font-bold text-[#d6006d] animate-pulse">CARREGANDO LINKAH...</div>;

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#f8f9fa] border-r border-slate-200 flex flex-col hidden lg:flex shrink-0">
        <div className="p-4 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#d6006d] flex items-center justify-center text-white font-bold border-2 border-white shadow-sm uppercase">
                {dadosUsuario?.nome?.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="font-bold text-sm truncate">{dadosUsuario?.nome}</div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar na sala..." className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:bg-white" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Membros Ativos ({usuariosOnline.length})</p>
          <div className="px-2 space-y-0.5">
            {usuariosOnline.map((user, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border shadow-sm mb-1 ${user.emCall ? 'bg-pink-50/50 border-pink-100' : 'hover:bg-white border-transparent hover:border-slate-100'}`}>
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold uppercase ${user.emCall ? 'bg-[#d6006d] text-white border-white' : 'bg-white text-slate-500 border-slate-200'}`}>
                    {user.usuario_nome.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full ${user.emCall ? 'bg-[#d6006d] border-white animate-pulse' : 'bg-green-500 border-[#f8f9fa]'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-700 truncate">{user.usuario_nome}</h4>
                  {user.emCall ? (
                    <p className="text-[10px] text-[#d6006d] font-black uppercase flex items-center gap-1">
                       <span className="w-1 h-1 bg-[#d6006d] rounded-full animate-ping"></span>
                       Em chamada
                    </p>
                  ) : (
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Online agora</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ÁREA DE CHAT */}
      <main className="flex-1 flex flex-col bg-white relative">
        
        {/* INTERFACE DA CHAMADA (MODAL SOBREPOSTO) */}
        {chamadaAtiva && (
          <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col">
            <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm tracking-tight">Chamada de Grupo: {dadosEvento?.nome}</span>
              </div>
              <button 
                onClick={() => setChamadaAtiva(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full flex items-center gap-2 text-xs font-black transition-all active:scale-95 shadow-lg"
              >
                <PhoneOff size={16} /> SAIR DA CHAMADA
              </button>
            </div>
            <iframe 
              src={`https://meet.jit.si/Linkah_Room_${id}#userInfo.displayName="${dadosUsuario?.nome}"`}
              className="flex-1 w-full border-none"
              allow="camera; microphone; display-capture; autoplay; clipboard-write"
            />
          </div>
        )}

        <header className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shadow-sm z-10 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="lg:hidden text-slate-400"><ChevronLeft /></button>
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#d6006d] font-black border border-slate-200 uppercase">
                {dadosEvento?.nome?.charAt(0) || 'L'}
             </div>
             <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">{dadosEvento?.nome}</h3>
                  {/* INDICADOR DE PESSOAS NA CALL NO HEADER */}
                  {usuariosOnline.filter(u => u.emCall).length > 0 && (
                    <div className="flex items-center gap-1.5 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100 animate-in fade-in zoom-in">
                       <span className="w-1.5 h-1.5 bg-[#d6006d] rounded-full animate-pulse"></span>
                       <span className="text-[9px] font-black text-[#d6006d] uppercase">
                         {usuariosOnline.filter(u => u.emCall).length} na call
                       </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} className="text-slate-400" />
                    <p className="text-[10px] text-slate-500 font-medium">{formatarData(dadosEvento)}</p>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sincronizado</p>
                  </div>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4 text-sky-500">
             <Video 
                size={20} 
                className={`cursor-pointer rounded-full p-0.5 transition-all ${chamadaAtiva ? 'bg-pink-100 text-[#d6006d]' : 'hover:bg-sky-50'}`} 
                onClick={() => setChamadaAtiva(true)}
             />
             <Phone 
                size={18} 
                className={`cursor-pointer rounded-full p-0.5 transition-all ${chamadaAtiva ? 'bg-pink-100 text-[#d6006d]' : 'hover:bg-sky-50'}`} 
                onClick={() => setChamadaAtiva(true)}
             />
             <MoreVertical size={20} className="text-slate-300" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/30">
          {mensagens.map((msg, idx) => {
            if (msg.texto === "system_ping_active" || msg.texto === "system_ping_on_call") return null;

            const souEu = dadosUsuario?.nome === msg.usuario_nome;
            return (
              <div key={idx} className={`flex gap-3 ${souEu ? 'flex-row-reverse' : 'flex-row'} items-start animate-in fade-in slide-in-from-bottom-2`}>
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase border border-white shadow-sm">
                  {msg.usuario_nome.charAt(0)}
                </div>
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <span className="text-[11px] font-bold text-slate-400 mb-1 px-1">{msg.usuario_nome}</span>
                  <div className={`px-4 py-2 rounded-2xl text-[14px] shadow-sm ${
                    souEu ? 'bg-[#d6006d] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.imagem && <img src={msg.imagem} className="rounded-lg mb-2 max-h-72 w-full object-cover shadow-sm border border-slate-100" />}
                    {msg.texto && <p className="leading-relaxed">{msg.texto}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <footer className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-1 bg-[#F3F4F6] rounded-2xl p-2 flex flex-col focus-within:bg-white transition-all border border-transparent focus-within:border-slate-200">
              {imagemAnexada && (
                <div className="p-2 relative inline-block">
                  <img src={imagemAnexada} className="h-20 w-20 object-cover rounded-lg border-2 border-white shadow-md" />
                  <button type="button" onClick={() => setImagemAnexada(null)} className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 shadow-md hover:bg-red-500 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#d6006d] transition-colors">
                  <Paperclip size={20} />
                </button>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFile} />
                <input 
                  type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)}
                  placeholder="Escreva uma mensagem..." className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-slate-700 placeholder:text-slate-400" 
                />
                <Smile size={20} className="text-slate-400 cursor-pointer hover:text-yellow-500 transition-colors" />
              </div>
            </div>
            <button type="submit" className="bg-[#d6006d] text-white p-3 rounded-full shadow-lg shadow-pink-100 hover:bg-[#b0005a] hover:scale-105 active:scale-95 transition-all">
              <Send size={20} fill="currentColor" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}