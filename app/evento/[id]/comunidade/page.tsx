'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

const gerarCorTag = (nome: string) => {
  const cores = ['bg-cyan-500', 'bg-pink-500', 'bg-emerald-500', 'bg-orange-500', 'bg-violet-500'];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return cores[Math.abs(hash) % cores.length];
};

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setDadosUsuario(JSON.parse(user));
  }, []);

  const carregarMensagens = async () => {
    if (!id) return;
    try {
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) setMensagens(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;
    const txt = novoTexto; setNovoTexto('');
    try {
      await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: Number(id), usuario_nome: dadosUsuario.nome, texto: txt })
      });
      setTimeout(carregarMensagens, 400);
    } catch (err) { setNovoTexto(txt); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold tracking-tight">Comunidade VIP</h1>
          <div className="flex items-center gap-1 justify-center">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-slate-400 uppercase tracking-widest">Live Chat</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-black border border-white/20 shadow-lg text-white">
          {dadosUsuario?.nome?.substring(0,2).toUpperCase() || '??'}
        </div>
      </header>

      {/* Área de Mensagens */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f172a]">
        {mensagens.map((msg, idx) => {
          // Normalizamos os nomes para evitar erros de comparação (trim e lowercase)
          const nomeEu = dadosUsuario?.nome?.trim().toLowerCase();
          const nomeMsg = msg.usuario_nome?.trim().toLowerCase();
          const souEu = nomeEu === nomeMsg;

          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start animate-in slide-in-from-left-2 duration-300'}`}>
              
              {/* Nome do outro usuário (Tag colorida) */}
              {!souEu && (
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white mb-1 shadow-sm ${gerarCorTag(msg.usuario_nome)}`}>
                  {msg.usuario_nome}
                </div>
              )}

              {/* Balão de Mensagem */}
              <div className={`group relative px-4 py-2 rounded-2xl max-w-[80%] shadow-lg transition-all ${
                souEu 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-700/90 text-slate-100 rounded-tl-none border border-slate-600'
              }`}>
                <div className="flex items-end gap-3">
                  <p className="text-[14px] leading-relaxed font-medium">{msg.texto}</p>
                  <span className={`text-[9px] whitespace-nowrap mb-[-2px] ${souEu ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-2" />
      </main>

      {/* Input de Mensagem */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-4xl mx-auto bg-slate-800/60 p-1 rounded-2xl border border-slate-700 shadow-xl focus-within:border-indigo-500 transition-all">
          <input 
            type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-4 py-2.5 text-slate-100 placeholder:text-slate-500" 
            placeholder="Diga algo legal..."
          />
          <button 
            type="submit" disabled={!novoTexto.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white p-2.5 rounded-xl transition-all active:scale-90 flex items-center justify-center shadow-lg"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}