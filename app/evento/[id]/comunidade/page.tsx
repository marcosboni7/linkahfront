'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

const gerarCorNome = (nome: string) => {
  const cores = ['text-blue-400', 'text-purple-400', 'text-pink-400', 'text-cyan-400', 'text-yellow-400'];
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
    setDadosUsuario(user ? JSON.parse(user) : { nome: 'Visitante' });
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
    if (!novoTexto.trim()) return;
    const txt = novoTexto; setNovoTexto('');
    try {
      await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: Number(id), usuario_nome: dadosUsuario?.nome, texto: txt })
      });
      setTimeout(carregarMensagens, 400);
    } catch (err) { setNovoTexto(txt); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* Header Minimalista */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-semibold tracking-tight">Comunidade VIP</h1>
          <div className="flex items-center gap-1 justify-center">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-slate-400 uppercase">Live Chat</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold border border-white/20">
          {dadosUsuario?.nome?.substring(0,2).toUpperCase()}
        </div>
      </header>

      {/* Área de Mensagens */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {mensagens.map((msg, idx) => {
          const souEu = msg.usuario_nome === dadosUsuario?.nome;
          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                {!souEu && <span className={`text-[11px] font-medium ${gerarCorNome(msg.usuario_nome)}`}>{msg.usuario_nome}</span>}
                <span className="text-[9px] text-slate-500">
                  {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-lg border ${
                souEu 
                  ? 'bg-indigo-600 border-indigo-400 text-white rounded-tr-none shadow-indigo-500/10' 
                  : 'bg-slate-800 border-slate-700 text-slate-200 rounded-tl-none shadow-black/20'
              }`}>
                <p className="text-[14px] leading-relaxed">{msg.texto}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* Input de Vidro (Glassmorphism) */}
      <footer className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
        <form onSubmit={enviarMensagem} className="flex items-center gap-3 max-w-4xl mx-auto bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
          <input 
            type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 placeholder:text-slate-500" 
            placeholder="Escreva sua mensagem..."
          />
          <button 
            type="submit" disabled={!novoTexto.trim()}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white p-2 rounded-xl transition-all active:scale-90 shadow-lg shadow-indigo-500/20"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}