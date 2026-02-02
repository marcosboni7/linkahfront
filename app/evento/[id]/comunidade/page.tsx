'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

const gerarCorTag = (nome: string) => {
  const cores = ['bg-purple-500', 'bg-indigo-500', 'bg-violet-600', 'bg-fuchsia-500', 'bg-blue-500'];
  let hash = 0;
  const n = nome || "Visitante";
  for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
  return cores[Math.abs(hash) % cores.length];
};

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setDadosUsuario(JSON.parse(user));
    } else {
      const defaultUser = { nome: 'User_' + Math.floor(Math.random() * 100) };
      setDadosUsuario(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }
    setCarregando(false);
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

  const trocarNomeTeste = () => {
    const novoNome = prompt("Teste outro nome:");
    if (novoNome?.trim()) {
      const u = { nome: novoNome.trim() };
      setDadosUsuario(u);
      localStorage.setItem('user', JSON.stringify(u));
      window.location.reload();
    }
  };

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
      carregarMensagens();
    } catch (err) { setNovoTexto(txt); }
  };

  if (carregando) return <div className="h-screen !bg-white flex items-center justify-center text-indigo-600 font-bold">Iniciando...</div>;

  return (
    <div className="flex flex-col h-screen !bg-white !text-slate-900 font-sans overflow-hidden">
      
      {/* Header Fixo Branco */}
      <header className="p-4 flex items-center justify-between border-b border-slate-200 !bg-white shadow-sm z-10 shrink-0">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        
        <div className="text-center">
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Comunidade</h1>
          <div className="flex items-center gap-1.5 justify-center">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Live Chat</span>
          </div>
        </div>

        <button 
          onClick={trocarNomeTeste}
          className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-[12px] font-bold text-white border-2 border-white shadow-lg"
        >
          {dadosUsuario?.nome?.substring(0,2).toUpperCase()}
        </button>
      </header>

      {/* Fundo do chat levemente cinza para destacar os balões brancos */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 !bg-[#f8fafc] custom-scrollbar">
        {mensagens.map((msg, idx) => {
          const meuNome = (dadosUsuario?.nome || "").trim().toLowerCase();
          const nomeDestaMsg = (msg.usuario_nome || "").trim().toLowerCase();
          const souEu = meuNome === nomeDestaMsg && meuNome !== "";

          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white mb-1 shadow-sm ${
                souEu ? 'bg-indigo-400' : `${gerarCorTag(msg.usuario_nome)}`
              }`}>
                {msg.usuario_nome}
              </div>

              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm border transition-all ${
                souEu 
                  ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' 
                  : '!bg-white border-slate-200 !text-slate-700 rounded-tl-none'
              }`}>
                <p className="text-[14px] leading-relaxed font-medium">{msg.texto}</p>
                <div className={`text-[9px] mt-1 font-bold ${souEu ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'}`}>
                  {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-4" />
      </main>

      {/* Rodapé Branco */}
      <footer className="p-4 !bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-4xl mx-auto !bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:!bg-white focus-within:border-indigo-400 transition-all">
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 !text-slate-800 placeholder:text-slate-400" 
            placeholder="Digite aqui..."
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-90"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}