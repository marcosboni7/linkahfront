'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Paperclip, X, Image as ImageIcon, Send, Calendar } from 'lucide-react';

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null); // ESTADO PARA O EVENTO
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Validar Usuário
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
      }
    } catch (e) {
      setErroAcesso(true);
    }
  }, [router]);

  // 2. Carregar Dados do Evento e Mensagens
  useEffect(() => {
    if (!id) return;

    const carregarInformacoes = async () => {
      try {
        // Busca Detalhes do Evento (Nome e Data)
        const resEvento = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (resEvento.ok) {
          const evento = await resEvento.json();
          setDadosEvento(evento);
        }

        // Busca Mensagens
        const resMsg = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`);
        if (resMsg.ok) setMensagens(await resMsg.json());
        
        setCarregando(false);
      } catch (err) { 
        console.error(err);
        setCarregando(false);
      }
    };

    carregarInformacoes();
    const interval = setInterval(carregarInformacoes, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

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

    const msgData = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      texto: novoTexto,
      imagem: imagemAnexada
    };

    setNovoTexto('');
    setImagemAnexada(null);

    try {
      await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
    } catch (err) {
      console.error("Erro ao enviar:", err);
    }
  };

  if (erroAcesso) return <div className="h-screen flex items-center justify-center font-black uppercase text-red-500">Acesso Negado</div>;
  if (carregando) return <div className="h-screen flex items-center justify-center animate-pulse font-black text-[#d6006d]">Linkah...</div>;

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* HEADER ATUALIZADO */}
      <header className="p-4 flex items-center justify-between border-b border-slate-100 bg-white shrink-0 shadow-sm">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        
        <div className="text-center flex-1 px-2">
          <h1 className="text-[11px] font-black uppercase tracking-tight text-slate-900 line-clamp-1">
            {dadosEvento?.nome || 'Carregando evento...'}
          </h1>
          <div className="flex items-center gap-1.5 justify-center mt-0.5">
              <Calendar size={10} className="text-[#d6006d]" />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                {dadosEvento?.data_inicio ? new Date(dadosEvento.data_inicio).toLocaleDateString('pt-BR') : '--/--/--'}
              </span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#d6006d] flex items-center justify-center text-white text-[11px] font-black border-2 border-white shadow-md shrink-0">
          {dadosUsuario?.nome?.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8fafc]">
        {mensagens.map((msg, idx) => {
          const souEu = dadosUsuario?.nome === msg.usuario_nome;
          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <span className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">{msg.usuario_nome}</span>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm border ${souEu ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' : 'bg-white border-slate-200 text-slate-700 rounded-tl-none'}`}>
                {msg.imagem && (
                  <img src={msg.imagem} alt="Anexo" className="rounded-lg mb-2 max-w-full border border-black/10" />
                )}
                {msg.texto && <p className="text-[14px] leading-relaxed font-medium">{msg.texto}</p>}
                <div className={`text-[8px] mt-1 font-bold opacity-70 text-right`}>
                   {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* FOOTER */}
      <footer className="p-4 bg-white border-t border-slate-100 shrink-0">
        {imagemAnexada && (
          <div className="mb-3 relative inline-block">
            <img src={imagemAnexada} className="h-20 w-20 object-cover rounded-xl border-2 border-[#d6006d] shadow-md" alt="Preview" />
            <button onClick={() => setImagemAnexada(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600">
              <X size={12} />
            </button>
          </div>
        )}

        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-4xl mx-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-[#d6006d] transition-all">
          <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-[#d6006d] hover:bg-pink-50 rounded-xl transition-all">
            <Paperclip size={20} />
          </button>
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-2 text-slate-800" 
            placeholder="Digite algo..."
          />
          <button type="submit" disabled={!novoTexto.trim() && !imagemAnexada} className="bg-[#d6006d] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50 transition-all">
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}