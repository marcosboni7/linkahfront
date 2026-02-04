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

  // 1. VALIDAÇÃO DE ACESSO
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
      if (user?.nome) setDadosUsuario(user);
      else throw new Error("User invalid");
    } catch (e) {
      setErroAcesso(true);
      setCarregando(false);
    }
  }, [router]);

  // 2. SINCRONIZAÇÃO EM TEMPO REAL
  useEffect(() => {
    if (!id || !dadosUsuario) return;
    const carregarTudo = async () => {
      try {
        const [resEv, resMsg, resOn] = await Promise.all([
          fetch(`https://linkah-api.onrender.com/api/eventos/${id}`),
          fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`),
          fetch(`https://linkah-api.onrender.com/api/comunidade/${id}/online?usuario_nome=${encodeURIComponent(dadosUsuario.nome)}`)
        ]);
        if (resEv.ok) setDadosEvento(await resEv.json());
        if (resMsg.ok) setMensagens(await resMsg.json());
        if (resOn.ok) setUsuariosOnline(await resOn.json());
        setCarregando(false);
      } catch (err) { console.error(err); }
    };
    carregarTudo();
    const interval = setInterval(carregarTudo, 4000); 
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  // 3. AUTO-SCROLL
  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [mensagens]);

  // --- FUNÇÕES DE AÇÃO (CORRIGINDO O ERRO handleFileChange) ---
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemAnexada(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada) || !dadosUsuario) return;
    
    const backupT = novoTexto; 
    const backupI = imagemAnexada;
    
    setNovoTexto(''); 
    setImagemAnexada(null);
    
    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          evento_id: Number(id), 
          usuario_nome: dadosUsuario.nome, 
          texto: backupT, 
          imagem: backupI 
        })
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setNovoTexto(backupT); 
      setImagemAnexada(backupI);
      alert("Erro ao enviar mensagem.");
    }
  };

  // --- RENDERS ---
  if (carregando) return <div className="h-screen flex items-center justify-center font-bold text-[#d6006d]">Iniciando Linkah...</div>;

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans overflow-hidden">
      
      {/* SIDEBAR SKYPE STYLE */}
      <aside className="w-[320px] bg-[#f8f9fa] border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#d6006d] flex items-center justify-center text-white font-bold">
                  {dadosUsuario?.nome?.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="font-bold text-sm">{dadosUsuario?.nome}</div>
            </div>
            <Settings size={18} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Pessoas e grupos" className="w-full bg-slate-200/50 border-none rounded-full py-2 pl-10 pr-4 text-xs outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <div className="p-3 bg-pink-50/50 rounded-lg flex items-center gap-3 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-[#d6006d] font-bold">
              {dadosEvento?.nome?.charAt(0) || 'L'}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold text-sm truncate">{dadosEvento?.nome || 'Chat Principal'}</h4>
              <p className="text-xs text-slate-400 truncate">Ativo agora</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CHAT AREA SKYPE STYLE */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="md:hidden"><ChevronLeft size={20} /></button>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#d6006d] font-bold border">
              {dadosEvento?.nome?.charAt(0) || 'L'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{dadosEvento?.nome || 'Comunidade'}</h3>
              <p className="text-[10px] text-green-500 font-bold uppercase">{usuariosOnline.length} Online</p>
            </div>
          </div>
          <div className="flex gap-4 text-slate-400">
            <Video size={20} className="cursor-pointer hover:text-[#d6006d]" />
            <Phone size={18} className="cursor-pointer hover:text-[#d6006d]" />
            <MoreVertical size={20} className="cursor-pointer" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
          {mensagens.map((msg, idx) => {
            const souEu = dadosUsuario?.nome === msg.usuario_nome;
            return (
              <div key={idx} className={`flex gap-3 ${souEu ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                  {msg.usuario_nome.charAt(0)}
                </div>
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-500">{msg.usuario_nome}</span>
                    <span className="text-[9px] text-slate-300">{new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[14px] ${
                    souEu ? 'bg-pink-50 text-slate-800 rounded-tr-none border border-pink-100' : 'bg-[#F3F4F6] text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.imagem && <img src={msg.imagem} className="rounded-lg mb-2 max-h-60 w-full object-cover" />}
                    {msg.texto && <p>{msg.texto}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* INPUT STYLE SKYPE */}
        <footer className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-1 bg-[#F3F4F6] rounded-2xl p-2 flex flex-col">
              {imagemAnexada && (
                <div className="p-2 relative inline-block">
                  <img src={imagemAnexada} className="h-20 w-20 object-cover rounded-lg border" />
                  <button type="button" onClick={() => setImagemAnexada(null)} className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm"><X size={12} /></button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#d6006d]">
                  <Paperclip size={20} />
                </button>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
                <textarea 
                  rows={1}
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 bg-transparent border-none outline-none py-2 text-sm resize-none"
                />
                <Smile size={20} className="text-slate-400 mr-2 cursor-pointer" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={!novoTexto.trim() && !imagemAnexada}
              className="bg-[#d6006d] text-white p-3 rounded-full shadow-md disabled:opacity-30 active:scale-95 transition-all"
            >
              <Send size={20} fill="currentColor" />
            </button>
          </form>
          <div className="flex justify-center gap-6 mt-3 text-slate-300">
            <Mic size={18} />
            <ImageIcon size={18} />
            <Plus size={18} />
          </div>
        </footer>
      </main>
    </div>
  );
}