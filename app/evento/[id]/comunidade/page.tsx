'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Paperclip, 
  Send, 
  Calendar, 
  Video, 
  Phone, 
  MoreVertical, 
  Smile, 
  Mic, 
  ChevronLeft, 
  Settings, 
  Users,
  X,
  Plus,
  Heart,
  Image as ImageIcon
} from 'lucide-react';

export default function SalaComunidadeLinkah() {
  const { id } = useParams();
  const router = useRouter();
  
  // --- ESTADOS DE DADOS ---
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  
  // --- ESTADOS DE INTERFACE ---
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. VALIDAÇÃO DE ACESSO (MANTIDA INTEGRALMENTE)
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (!savedUser) {
      setErroAcesso(true);
      setCarregando(false);
      setTimeout(() => router.push('/site/login'), 2000);
      return;
    }
    try {
      const user = JSON.parse(savedUser);
      if (user?.nome) {
        setDadosUsuario(user);
      } else {
        throw new Error("Usuário inválido");
      }
    } catch (e) {
      setErroAcesso(true);
      setCarregando(false);
    }
  }, [router]);

  // 2. SINCRONIZAÇÃO EM TEMPO REAL (EVENTO, CHAT E ONLINE)
  useEffect(() => {
    if (!id || !dadosUsuario) return;

    const carregarTudo = async () => {
      try {
        // Busca Informações do Evento
        const resEv = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (resEv.ok) {
          const evData = await resEv.json();
          setDadosEvento(evData);
        }

        // Busca Mensagens do Chat
        const resMsg = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`);
        if (resMsg.ok) {
          setMensagens(await resMsg.json());
        }

        // Atualiza Heartbeat (Presença) e busca quem está online
        const resOn = await fetch(
          `https://linkah-api.onrender.com/api/comunidade/${id}/online?usuario_nome=${encodeURIComponent(dadosUsuario.nome)}`
        );
        if (resOn.ok) {
          setUsuariosOnline(await resOn.json());
        }
        
        setCarregando(false);
      } catch (err) {
        console.error("Erro na sincronização:", err);
      }
    };

    carregarTudo();
    const interval = setInterval(carregarTudo, 4000); 
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  // 3. AUTO-SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 4. LÓGICA DE IMAGEM
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagemAnexada(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 5. ENVIO DE MENSAGEM
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada) || !dadosUsuario) return;

    const backupTexto = novoTexto;
    const backupImg = imagemAnexada;

    setNovoTexto('');
    setImagemAnexada(null);

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id),
          usuario_nome: dadosUsuario.nome,
          texto: backupTexto,
          imagem: backupImg
        })
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      alert("Erro ao enviar. Tente novamente.");
      setNovoTexto(backupTexto);
      setImagemAnexada(backupImg);
    }
  };

  if (erroAcesso) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-pink-50 text-[#d6006d] rounded-full flex items-center justify-center mb-6">
        <X size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 uppercase">Acesso Negado</h2>
      <p className="text-slate-400 mt-2">Redirecionando...</p>
    </div>
  );

  if (carregando) return (
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="text-[#d6006d] font-black text-xl animate-bounce tracking-[0.3em]">LINKAH</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-slate-700 font-sans overflow-hidden">
      
      {/* --- COLUNA 1: SIDEBAR ESQUERDA --- */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col hidden lg:flex shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#d6006d] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-100">L</div>
            <h2 className="font-black text-lg tracking-tight text-slate-800">LINKAH Community</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar chats..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#d6006d]/20 transition-all" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-6 mb-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Atividade Recente</p>
          <div className="px-3 space-y-1">
            <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-2xl border border-pink-100 cursor-pointer">
              <div className="w-12 h-12 bg-pink-200 rounded-2xl flex items-center justify-center text-[#d6006d] font-black shadow-sm">
                {dadosEvento?.nome?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-black text-sm text-slate-800 truncate">{dadosEvento?.nome || 'Carregando...'}</h4>
                <p className="text-[11px] text-[#d6006d] font-bold truncate italic">Galera online agora</p>
              </div>
              <div className="w-5 h-5 bg-[#d6006d] text-white text-[10px] flex items-center justify-center rounded-full font-black">!</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 flex items-center justify-between text-slate-400">
           <Settings size={22} className="cursor-pointer hover:text-[#d6006d] transition-colors" />
           <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
              <Users size={16} />
              <span className="text-xs font-black">{usuariosOnline.length}</span>
           </div>
        </div>
      </aside>

      {/* --- COLUNA 2: CENTRO (CHAT) --- */}
      <main className="flex-1 flex flex-col bg-white relative">
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="lg:hidden p-2 -ml-2 text-slate-400"><ChevronLeft /></button>
             <div className="w-12 h-12 bg-gradient-to-tr from-[#d6006d] to-[#ff4da6] rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                {dadosEvento?.nome?.charAt(0) || 'L'}
             </div>
             <div>
                <h3 className="font-black text-slate-800 text-lg tracking-tight leading-tight">{dadosEvento?.nome || 'Sala de Evento'}</h3>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Chat Ativo</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-slate-400">
             <button className="p-2.5 hover:bg-pink-50 hover:text-[#d6006d] rounded-xl transition-all hidden sm:block"><Video size={20} /></button>
             <button className="p-2.5 hover:bg-pink-50 hover:text-[#d6006d] rounded-xl transition-all hidden sm:block"><Phone size={20} /></button>
             <button className="p-2.5 hover:bg-pink-50 hover:text-[#d6006d] rounded-xl transition-all"><MoreVertical size={20} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#FAFAFC]">
          {mensagens.map((msg, idx) => {
            const souEu = dadosUsuario?.nome === msg.usuario_nome;
            return (
              <div key={idx} className={`flex ${souEu ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${souEu ? 'flex-row-reverse' : ''}`}>
                  {!souEu && (
                    <div className="w-9 h-9 rounded-xl bg-pink-100 flex-shrink-0 flex items-center justify-center text-[11px] font-black text-[#d6006d] border border-pink-200 shadow-sm">
                      {msg.usuario_nome.charAt(0)}
                    </div>
                  )}
                  <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-black text-slate-300 mb-1 uppercase px-1">{msg.usuario_nome}</span>
                    <div className={`p-4 rounded-3xl text-[15px] font-semibold shadow-sm border ${
                      souEu 
                      ? 'bg-[#d6006d] text-white border-[#d6006d] rounded-tr-none shadow-pink-100' 
                      : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.imagem && <img src={msg.imagem} className="rounded-2xl mb-3 w-full object-cover max-h-72 shadow-sm" />}
                      {msg.texto && <p className="leading-relaxed">{msg.texto}</p>}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 px-1">
                       <p className="text-[9px] font-bold text-slate-300">
                         {new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                       </p>
                       {souEu && <Heart size={8} className="text-[#d6006d] fill-[#d6006d]" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <footer className="p-6 bg-white border-t border-slate-100">
          {imagemAnexada && (
            <div className="mb-4 relative inline-block animate-in zoom-in">
               <img src={imagemAnexada} className="h-24 w-24 object-cover rounded-[25px] border-4 border-white shadow-xl ring-4 ring-pink-50" />
               <button onClick={() => setImagemAnexada(null)} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1.5 shadow-lg border-2 border-white"><X size={12} /></button>
            </div>
          )}
          <form onSubmit={enviarMensagem} className="flex items-center gap-3 bg-[#F4F6F9] p-2.5 rounded-[26px] border border-transparent focus-within:bg-white focus-within:border-[#d6006d]/30 focus-within:shadow-lg focus-within:shadow-pink-50 transition-all">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="p-3 text-slate-400 hover:text-[#d6006d] hover:bg-white rounded-2xl transition-all"
            >
              <Paperclip size={22} />
            </button>
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
            
            <input 
              type="text" 
              value={novoTexto} 
              onChange={(e) => setNovoTexto(e.target.value)}
              placeholder="Envie uma mensagem..." 
              className="flex-1 bg-transparent border-none outline-none text-sm font-bold px-2 text-slate-800 placeholder:text-slate-400" 
            />
            
            <div className="hidden sm:flex items-center gap-1 px-2">
               <button type="button" className="p-2 text-slate-400 hover:text-[#d6006d] transition-colors"><Smile size={20} /></button>
               <button type="button" className="p-2 text-slate-400 hover:text-[#d6006d] transition-colors"><Mic size={20} /></button>
            </div>

            <button 
              type="submit" 
              disabled={!novoTexto.trim() && !imagemAnexada} 
              className="bg-[#d6006d] text-white p-3.5 rounded-2xl shadow-lg shadow-pink-100 hover:bg-[#b0005a] active:scale-90 disabled:opacity-30 disabled:grayscale transition-all"
            >
              <Send size={20} fill="currentColor" />
            </button>
          </form>
        </footer>
      </main>

      {/* --- COLUNA 3: INFO DIREITA --- */}
      <aside className="w-80 bg-white border-l border-slate-200 p-8 hidden xl:flex flex-col items-center shrink-0">
         <div className="relative mb-6">
            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-[#d6006d] to-[#ff4da6] p-1 shadow-2xl">
               <div className="w-full h-full bg-white rounded-[38px] flex items-center justify-center overflow-hidden">
                  <span className="text-4xl font-black text-[#d6006d]">{dadosUsuario?.nome?.charAt(0).toUpperCase()}</span>
               </div>
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-2xl animate-bounce"></div>
         </div>

         <h3 className="font-black text-slate-800 text-xl tracking-tight text-center uppercase">{dadosUsuario?.nome || 'Usuário'}</h3>
         <p className="text-[10px] font-black text-[#d6006d] bg-pink-50 px-4 py-1 rounded-full mt-2 uppercase tracking-[0.2em]">Membro Premium</p>
         
         <div className="w-full mt-10 space-y-3">
            <button className="w-full py-4 bg-slate-50 rounded-2xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-pink-50 hover:text-[#d6006d] transition-all flex items-center justify-center gap-3">
               <Users size={16} /> Membros ({usuariosOnline.length})
            </button>
            <button className="w-full py-4 bg-slate-50 rounded-2xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-pink-50 hover:text-[#d6006d] transition-all flex items-center justify-center gap-3">
               <ImageIcon size={16} /> Galeria de Fotos
            </button>
            <button className="w-full py-4 bg-slate-50 rounded-2xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-pink-50 hover:text-[#d6006d] transition-all flex items-center justify-center gap-3">
               <Calendar size={16} /> Detalhes do Evento
            </button>
         </div>

         <div className="mt-auto w-full">
            <div className="bg-slate-900 rounded-[30px] p-5 text-white shadow-2xl">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Galera Online</p>
               <div className="flex -space-x-3 mb-4">
                  {usuariosOnline.slice(0, 5).map((u, i) => (
                    <div key={i} className="w-10 h-10 rounded-2xl bg-[#d6006d] border-4 border-slate-900 flex items-center justify-center text-[11px] font-black shadow-lg">
                      {u.usuario_nome.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {usuariosOnline.length > 5 && (
                    <div className="w-10 h-10 rounded-2xl bg-slate-700 border-4 border-slate-900 flex items-center justify-center text-[10px] font-black">
                      +{usuariosOnline.length - 5}
                    </div>
                  )}
               </div>
               <button className="w-full py-3 bg-white/10 hover:bg-[#d6006d] rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Convidar Amigos
               </button>
            </div>
         </div>
      </aside>

    </div>
  );
}