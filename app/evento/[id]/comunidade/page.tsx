'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, Paperclip, Send, Calendar, Video, Phone, 
  MoreVertical, Smile, Mic, ChevronLeft, Settings, 
  Users, X, Plus, Heart, Image as ImageIcon 
} from 'lucide-react';

export default function SalaLinkahSkype() {
  const { id } = useParams();
  const router = useRouter();
  
  // --- ESTADOS ---
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. LOGIN & USER
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else {
      router.push('/site/login');
    }
  }, [router]);

  // 2. SINCRONIZAÇÃO TOTAL (CORRIGIDA)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const syncOnline = async () => {
      try {
        const url = `https://linkah-api.onrender.com/api/comunidade/${id}/online?usuario_nome=${encodeURIComponent(dadosUsuario.nome)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Garante que os dados sejam um array antes de salvar
          setUsuariosOnline(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Erro online:", e);
      }
    };

    const syncChat = async () => {
      try {
        const [resEv, resMsg] = await Promise.all([
          fetch(`https://linkah-api.onrender.com/api/eventos/${id}`),
          fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`)
        ]);
        if (resEv.ok) setDadosEvento(await resEv.json());
        if (resMsg.ok) setMensagens(await resMsg.json());
        setCarregando(false);
      } catch (e) {
        console.error("Erro chat:", e);
      }
    };

    // Execução inicial
    syncOnline();
    syncChat();

    // Intervalo de batimento (Heartbeat)
    const timer = setInterval(() => {
      syncOnline();
      syncChat();
    }, 4000);

    return () => {
      clearInterval(timer);
      setUsuariosOnline([]);
    };
  }, [id, dadosUsuario]);

  // AUTO-SCROLL
  useEffect(() => { 
    if (mensagens.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }
  }, [mensagens]);

  // FUNÇÕES DE AÇÃO
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagemAnexada(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada) || !dadosUsuario) return;
    const bt = novoTexto; const bi = imagemAnexada;
    setNovoTexto(''); setImagemAnexada(null);
    try {
      await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: Number(id), usuario_nome: dadosUsuario.nome, texto: bt, imagem: bi })
      });
    } catch (err) { setNovoTexto(bt); setImagemAnexada(bi); }
  };

  if (carregando) return <div className="h-screen flex items-center justify-center font-bold text-[#d6006d]">LINKAH...</div>;

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans overflow-hidden">
      
      {/* SIDEBAR AMIGOS */}
      <aside className="w-80 bg-[#f8f9fa] border-r border-slate-200 flex flex-col hidden lg:flex shrink-0">
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#d6006d] flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                {dadosUsuario?.nome?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="font-bold text-sm truncate">{dadosUsuario?.nome}</div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar..." className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Online ({usuariosOnline.length})
          </div>
          <div className="px-2 space-y-1">
            {usuariosOnline.map((user, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100 shadow-sm">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase shadow-inner">
                    {user.usuario_nome?.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f8f9fa] rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-700 truncate">{user.usuario_nome}</h4>
                  <p className="text-[10px] text-green-600 font-bold uppercase">Online</p>
                </div>
              </div>
            ))}
            {usuariosOnline.length === 0 && (
                <div className="text-center p-10">
                    <Users className="mx-auto text-slate-200 mb-2" size={32} />
                    <p className="text-[10px] text-slate-400 italic font-medium uppercase tracking-tight">Ninguém na sala</p>
                </div>
            )}
          </div>
        </div>
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="lg:hidden text-slate-400"><ChevronLeft /></button>
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#d6006d] font-black border border-slate-200 uppercase">
                {dadosEvento?.nome?.charAt(0) || 'L'}
             </div>
             <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">{dadosEvento?.nome || 'Comunidade'}</h3>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Sala Ativa</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-sky-500">
             <Video size={20} className="cursor-pointer" />
             <Phone size={18} className="cursor-pointer" />
             <MoreVertical size={20} className="text-slate-300" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#f9fafb]/50">
          {mensagens.map((msg, idx) => {
            const souEu = dadosUsuario?.nome === msg.usuario_nome;
            return (
              <div key={idx} className={`flex gap-3 ${souEu ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase border border-white shadow-sm">
                  {msg.usuario_nome?.charAt(0)}
                </div>
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <span className="text-[11px] font-bold text-slate-400 mb-1 px-1">{msg.usuario_nome}</span>
                  <div className={`px-4 py-2 rounded-2xl text-[14px] shadow-sm ${
                    souEu ? 'bg-[#d6006d] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.imagem && <img src={msg.imagem} className="rounded-lg mb-2 max-h-72 w-full object-cover" />}
                    {msg.texto && <p className="whitespace-pre-wrap">{msg.texto}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* FOOTER */}
        <footer className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-1 bg-[#F3F4F6] rounded-2xl p-2 flex flex-col focus-within:bg-white focus-within:ring-1 focus-within:ring-sky-100 transition-all">
              {imagemAnexada && (
                <div className="p-2 relative inline-block">
                  <img src={imagemAnexada} className="h-20 w-20 object-cover rounded-lg border border-slate-200 shadow-sm" />
                  <button type="button" onClick={() => setImagemAnexada(null)} className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5"><X size={12} /></button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#d6006d]">
                  <Paperclip size={20} />
                </button>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
                <input 
                  type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)}
                  placeholder="Escreva algo..." className="flex-1 bg-transparent border-none outline-none py-2 text-sm" 
                />
                <Smile size={20} className="text-slate-400 cursor-pointer hover:text-orange-400" />
              </div>
            </div>
            <button type="submit" disabled={!novoTexto.trim() && !imagemAnexada} className="bg-[#d6006d] text-white p-3 rounded-full shadow-lg hover:bg-[#b0005a] disabled:opacity-30 transition-all">
              <Send size={20} fill="currentColor" />
            </button>
          </form>
          <div className="flex justify-center gap-8 mt-3 text-slate-300">
            <Mic size={18} className="cursor-pointer hover:text-sky-500" />
            <ImageIcon size={18} className="cursor-pointer hover:text-sky-500" />
            <Plus size={18} className="cursor-pointer hover:text-sky-500" />
          </div>
        </footer>
      </main>
    </div>
  );
}