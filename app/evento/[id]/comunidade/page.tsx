'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Cores para as tags dos outros usuários
const gerarCorTag = (nome: string) => {
  const cores = ['bg-cyan-500', 'bg-pink-500', 'bg-emerald-500', 'bg-orange-500', 'bg-violet-500'];
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carregamento inicial do usuário
  useEffect(() => {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : { nome: 'Visitante' };
    setDadosUsuario(parsedUser);
    console.log("👤 Usuário logado:", parsedUser.nome);
  }, []);

  const carregarMensagens = async () => {
    if (!id) return;
    try {
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`, { 
        cache: 'no-store' 
      });
      if (res.ok) {
        const data = await res.json();
        setMensagens(data);
      }
    } catch (err) { console.error("Erro ao carregar:", err); }
  };

  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // FUNÇÃO DE ENVIO CORRIGIDA
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim()) return;

    // Pegamos o nome direto da fonte para não ter erro
    const storageUser = JSON.parse(localStorage.getItem('user') || '{"nome":"Visitante"}');
    const nomeEnvio = storageUser.nome;

    const textoParaEnviar = novoTexto;
    setNovoTexto(''); // Limpa o campo para o usuário

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          evento_id: Number(id), 
          usuario_nome: nomeEnvio, 
          texto: textoParaEnviar 
        })
      });

      if (res.ok) {
        carregarMensagens();
      } else {
        setNovoTexto(textoParaEnviar);
        alert("Erro ao enviar. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro conexão:", err);
      setNovoTexto(textoParaEnviar);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-center">
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Comunidade</h1>
          <div className="flex items-center gap-1.5 justify-center">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
             <span className="text-[10px] text-slate-400 font-medium">LIVE CHAT</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-black border border-white/20 shadow-xl">
          {dadosUsuario?.nome?.substring(0,2).toUpperCase() || '??'}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f172a] custom-scrollbar">
        {mensagens.map((msg, idx) => {
          // COMPARAÇÃO SEGURA: ignoramos espaços e maiúsculas
          const eu = dadosUsuario?.nome?.trim().toLowerCase();
          const outro = msg.usuario_nome?.trim().toLowerCase();
          const souEu = eu === outro;

          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              {!souEu && (
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white mb-1 shadow-sm ${gerarCorTag(msg.usuario_nome)}`}>
                  {msg.usuario_nome}
                </div>
              )}

              <div className={`px-4 py-2 rounded-2xl max-w-[85%] shadow-lg border transition-all ${
                souEu 
                  ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' 
                  : 'bg-slate-700/90 border-slate-600 text-slate-100 rounded-tl-none'
              }`}>
                <div className="flex items-end gap-3">
                  <p className="text-[14px] leading-relaxed font-medium py-0.5">{msg.texto}</p>
                  <span className="text-[9px] opacity-50 whitespace-nowrap mb-[-2px]">
                    {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-4" />
      </main>

      <footer className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-4xl mx-auto bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700 shadow-2xl focus-within:border-indigo-500/50">
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 text-slate-100" 
            placeholder="Diga algo..."
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}