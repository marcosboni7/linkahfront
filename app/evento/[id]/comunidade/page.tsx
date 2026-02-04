'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Paperclip, X, Image as ImageIcon, Send, Calendar, ChevronLeft, Users } from 'lucide-react';

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  
  // Estados
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]); // ESTADO DOS USUÁRIOS ONLINE
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Validar Acesso do Usuário
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
      else throw new Error();
    } catch (e) {
      setErroAcesso(true);
      setCarregando(false);
    }
  }, [router]);

  // 2. Carregar Tudo (Evento, Mensagens e Presença Online)
  useEffect(() => {
    if (!id || !dadosUsuario) return;

    const carregarDados = async () => {
      try {
        // Busca Evento
        const resEv = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (resEv.ok) setDadosEvento(await resEv.json());

        // Busca Mensagens
        const resMsg = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`);
        if (resMsg.ok) setMensagens(await resMsg.json());

        // ATUALIZA PRESENÇA E BUSCA ONLINE (ESTILO ZOOM)
        const resOnline = await fetch(
          `https://linkah-api.onrender.com/api/comunidade/${id}/online?usuario_nome=${encodeURIComponent(dadosUsuario.nome)}`
        );
        if (resOnline.ok) setUsuariosOnline(await resOnline.json());
        
        setCarregando(false);
      } catch (err) {
        console.error("Erro:", err);
      }
    };

    carregarDados();
    const interval = setInterval(carregarDados, 4000); // Atualiza a cada 4 segundos
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  // Scroll automático
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

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

    const backupT = novoTexto;
    const backupI = imagemAnexada;
    setNovoTexto('');
    setImagemAnexada(null);

    try {
      await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id),
          usuario_nome: dadosUsuario.nome,
          texto: backupT,
          imagem: backupI
        })
      });
    } catch (err) {
      setNovoTexto(backupT);
      setImagemAnexada(backupI);
    }
  };

  if (erroAcesso || carregando) return (
    <div className="h-screen bg-white flex items-center justify-center font-black text-[#d6006d] animate-pulse">
      {erroAcesso ? "ACESSO NEGADO" : "LINKAH..."}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER ZOOM STYLE */}
      <header className="pt-4 pb-3 px-5 border-b border-slate-100 bg-white shrink-0 shadow-md z-20">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400">
            <ChevronLeft size={28} strokeWidth={3} />
          </button>
          
          <div className="text-center flex-1 px-2">
            <h1 className="text-[16px] font-extrabold uppercase tracking-tight text-slate-900 line-clamp-1">
              {dadosEvento?.nome || 'Comunidade'}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <Calendar size={10} className="text-[#d6006d]" />
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                {dadosEvento?.data_inicio ? new Date(dadosEvento.data_inicio).toLocaleDateString('pt-BR') : '--/--/--'}
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#d6006d] flex items-center justify-center text-white text-[13px] font-black border-2 border-pink-50 shadow-md shrink-0">
            {dadosUsuario?.nome?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* LISTA DE USUÁRIOS ONLINE (BOLINHAS ZOOM) */}
        <div className="flex items-center justify-center mt-3 gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {usuariosOnline.slice(0, 5).map((u, i) => (
              <div 
                key={i} 
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-200"
              >
                {u.usuario_nome.charAt(0).toUpperCase()}
              </div>
            ))}
            {usuariosOnline.length > 5 && (
              <div className="flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-white bg-slate-800 text-white text-[9px] font-black">
                +{usuariosOnline.length - 5}
              </div>
            )}
          </div>
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1 animate-pulse">
            • {usuariosOnline.length} online
          </span>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8fafc]">
        {mensagens.map((msg, idx) => {
          const souEu = dadosUsuario?.nome === msg.usuario_nome;
          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <span className="text-[9px] font-black text-slate-400 mb-1 uppercase px-1">{msg.usuario_nome}</span>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm border ${souEu ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' : 'bg-white border-slate-200 text-slate-700 rounded-tl-none'}`}>
                {msg.imagem && <img src={msg.imagem} alt="Anexo" className="rounded-lg mb-2 max-h-60 object-cover" />}
                {msg.texto && <p className="text-[14px] leading-relaxed font-medium">{msg.texto}</p>}
                <div className="text-[8px] mt-1 font-bold opacity-60 text-right">
                   {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-2" />
      </main>

      {/* FOOTER */}
      <footer className="p-4 bg-white border-t border-slate-100 shrink-0">
        {imagemAnexada && (
          <div className="mb-3 relative inline-block">
            <img src={imagemAnexada} className="h-20 w-20 object-cover rounded-xl border-2 border-[#d6006d]" alt="Preview" />
            <button onClick={() => setImagemAnexada(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X size={12} /></button>
          </div>
        )}
        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-5xl mx-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-[#d6006d]">
          <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-[#d6006d]"><Paperclip size={22} /></button>
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm px-2 text-slate-800" 
            placeholder="Conversar com a galera..."
          />
          <button type="submit" disabled={!novoTexto.trim() && !imagemAnexada} className="bg-[#d6006d] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg disabled:opacity-40 transition-all">
            <Send size={18} fill="currentColor" />
          </button>
        </form>
      </footer>
    </div>
  );
}