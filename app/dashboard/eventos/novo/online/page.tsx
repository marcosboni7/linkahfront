'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// --- CONFIGURAÇÃO DA API DA AWS ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://r8amtavirp.us-east-1.awsapprunner.com';

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
  const [naoAutorizado, setNaoAutorizado] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. LÓGICA DE PROTEÇÃO E CAPTURA DE NOME
  useEffect(() => {
    // Tenta ler o padrão da Navbar ou os padrões secundários
    const userStorage = localStorage.getItem('@Linkah:User') || localStorage.getItem('user') || localStorage.getItem('userData');
    
    if (userStorage) {
      try {
        const user = JSON.parse(userStorage);
        setDadosUsuario({
          nome: user.nome || user.name || user.username || "Membro",
        });
        setCarregando(false);
      } catch (e) {
        console.error("Erro ao ler dados do usuário", e);
        setNaoAutorizado(true);
      }
    } else {
      setNaoAutorizado(true);
      setTimeout(() => {
        router.push('/site/login'); // Rota padrão que vimos na Navbar
      }, 3000);
    }
  }, [router]);

  // 2. BUSCA DE MENSAGENS NA AWS
  const carregarMensagens = async () => {
    if (!id || naoAutorizado) return;
    try {
      // Agora apontando para a AWS
      const res = await fetch(`${API_URL}/api/comunidade/${id}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) setMensagens(await res.json());
    } catch (err) { 
        console.error("Erro ao carregar mensagens da AWS:", err); 
    }
  };

  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000); // Polling a cada 3s
    return () => clearInterval(interval);
  }, [id, naoAutorizado]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 3. ENVIO DE MENSAGEM PARA AWS
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;
    const txt = novoTexto; 
    setNovoTexto('');
    try {
      await fetch(`${API_URL}/api/comunidade/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            evento_id: Number(id), 
            usuario_nome: dadosUsuario.nome, 
            texto: txt 
        })
      });
      carregarMensagens();
    } catch (err) { 
        console.error("Erro ao enviar para AWS:", err);
        setNovoTexto(txt); 
    }
  };

  // TELA DE "NÃO LOGADO"
  if (naoAutorizado) return (
    <div className="h-screen !bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-slate-800">Acesso Restrito</h2>
      <p className="text-slate-500 mt-2">Você precisa estar logado para participar da comunidade.</p>
      <p className="text-indigo-600 text-sm mt-4 font-medium animate-pulse">Redirecionando para login...</p>
    </div>
  );

  if (carregando) return <div className="h-screen !bg-white flex items-center justify-center text-indigo-600 font-bold">Carregando Chat...</div>;

  return (
    <div className="flex flex-col h-screen !bg-white !text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER CLARO */}
      <header className="p-4 flex items-center justify-between border-b border-slate-100 !bg-white shadow-sm z-10 shrink-0">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        
        <div className="text-center">
          <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 italic">Linkah Chat</h1>
          <div className="flex items-center gap-1.5 justify-center">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Conectado (AWS)</span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-[12px] font-black text-white border-2 border-white shadow-md">
          {dadosUsuario?.nome?.substring(0,2).toUpperCase()}
        </div>
      </header>

      {/* ÁREA DE CHAT */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 !bg-[#f8fafc] custom-scrollbar">
        {mensagens.map((msg, idx) => {
          const meuNome = (dadosUsuario?.nome || "").trim().toLowerCase();
          const nomeDestaMsg = (msg.usuario_nome || "").trim().toLowerCase();
          const souEu = meuNome === nomeDestaMsg && meuNome !== "";

          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <div className={`px-2 py-0.5 rounded-md text-[9px] font-black text-white mb-1 shadow-sm ${
                souEu ? 'bg-indigo-400' : `${gerarCorTag(msg.usuario_nome)}`
              }`}>
                {msg.usuario_nome}
              </div>

              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm border ${
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

      {/* INPUT */}
      <footer className="p-4 !bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-4xl mx-auto !bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:!bg-white focus-within:border-indigo-400 transition-all shadow-sm">
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 !text-slate-800 placeholder:text-slate-400 font-medium" 
            placeholder={`Conversar como ${dadosUsuario?.nome}...`}
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}