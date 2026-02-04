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
  
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (e) {
      setErroAcesso(true);
    }
  }, [router]);

  useEffect(() => {
    if (!id || !dadosUsuario) return;

    const carregarDados = async () => {
      try {
        // 1. Info do Evento
        const resEv = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (resEv.ok) setDadosEvento(await resEv.json());

        // 2. Mensagens
        const resMsg = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`);
        if (resMsg.ok) {
          const data = await resMsg.json();
          setMensagens(data);
          
          // LÓGICA ALTERNATIVA PARA ONLINE: 
          // Se a rota /online dá 404, pegamos os nomes únicos das últimas mensagens para mostrar na lateral
          const nomesUnicos = Array.from(new Set(data.map((m: any) => m.usuario_nome)))
            .map(nome => ({ usuario_nome: nome }));
          setUsuariosOnline(nomesUnicos);
        }

        // 3. Tentativa da rota Online (com tratamento de erro para evitar o 404 no console travar tudo)
        try {
          const resOn = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}/online?usuario_nome=${encodeURIComponent(dadosUsuario.nome)}`);
          if (resOn.ok) {
            const lista = await resOn.json();
            if (Array.isArray(lista)) setUsuariosOnline(lista);
          }
        } catch (e) {
          // Silencia erro 404 da rota específica de online
        }

        setCarregando(false);
      } catch (err) {
        console.error("Erro na sync:", err);
      }
    };

    carregarDados();
    const interval = setInterval(carregarDados, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

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
    const backupT = novoTexto; const backupI = imagemAnexada;
    setNovoTexto(''); setImagemAnexada(null);
    try {
      await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: Number(id), usuario_nome: dadosUsuario.nome, texto: backupT, imagem: backupI })
      });
    } catch (err) { setNovoTexto(backupT); setImagemAnexada(backupI); }
  };

  if (carregando) return <div className="h-screen bg-white flex items-center justify-center text-[#d6006d] font-bold">LINKAH...</div>;

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans overflow-hidden">
      
      {/* SIDEBAR SKYPE STYLE */}
      <aside className="w-80 bg-[#f8f9fa] border-r border-slate-200 flex flex-col hidden lg:flex shrink-0">
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#d6006d] flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                  {dadosUsuario?.nome?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="font-bold text-sm truncate max-w-[120px]">{dadosUsuario?.nome}</div>
            </div>
            <Settings size={18} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Pessoas e grupos" className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-sky-300" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participantes Online ({usuariosOnline.length})</p>
          <div className="px-2 space-y-0.5">
            {usuariosOnline.map((user, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 hover:bg-slate-200/50 rounded-xl cursor-pointer transition-all">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase shadow-sm">
                    {user.usuario_nome.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f8f9fa] rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-700 truncate">{user.usuario_nome}</h4>
                  <p className="text-[10px] text-green-600 font-bold uppercase">Disponível</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="lg:hidden text-slate-400"><ChevronLeft /></button>
             <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#d6006d] font-black border border-slate-200">
                    {dadosEvento?.nome?.charAt(0) || 'L'}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
             </div>
             <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">{dadosEvento?.nome || 'Comunidade'}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Chat ativo</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-sky-500">
             <Video size={20} className="cursor-pointer hover:bg-slate-50 rounded-full" />
             <Phone size={18} className="cursor-pointer hover:bg-slate-50 rounded-full" />
             <MoreVertical size={20} className="text-slate-300" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-white">
          {mensagens.map((msg, idx) => {
            const souEu = dadosUsuario?.nome === msg.usuario_nome;
            return (
              <div key={idx} className={`flex gap-3 ${souEu ? 'flex-row-reverse' : 'flex-row'} items-start animate-in fade-in`}>
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase border border-slate-100 shadow-sm">
                  {msg.usuario_nome.charAt(0)}
                </div>
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-400">{msg.usuario_nome}</span>
                    <span className="text-[9px] text-slate-300">{new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    souEu ? 'bg-[#d6006d] text-white rounded-tr-none' : 'bg-[#F3F4F6] text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.imagem && <img src={msg.imagem} className="rounded-lg mb-2 max-h-72 w-full object-cover" />}
                    {msg.texto && <p>{msg.texto}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <footer className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-1 bg-[#F3F4F6] rounded-2xl p-2 flex flex-col focus-within:bg-white focus-within:ring-1 focus-within:ring-sky-200 transition-all shadow-inner">
              {imagemAnexada && (
                <div className="p-2 relative inline-block">
                  <img src={imagemAnexada} className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => setImagemAnexada(null)} className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 shadow-md"><X size={12} /></button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#d6006d]">
                  <Paperclip size={20} />
                </button>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
                <input 
                  type="text" 
                  value={novoTexto} 
                  onChange={(e) => setNovoTexto(e.target.value)}
                  placeholder="Escreva uma mensagem..." 
                  className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-slate-700" 
                />
                <Smile size={20} className="text-slate-400 cursor-pointer" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={!novoTexto.trim() && !imagemAnexada} 
              className="bg-[#d6006d] text-white p-3 rounded-full shadow-lg hover:bg-[#b0005a] disabled:opacity-30 active:scale-95 transition-all"
            >
              <Send size={20} fill="currentColor" />
            </button>
          </form>
          <div className="flex justify-center gap-8 mt-3 text-slate-300">
            <Mic size={18} />
            <ImageIcon size={18} />
            <Plus size={18} />
          </div>
        </footer>
      </main>
    </div>
  );
}