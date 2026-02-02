'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. BUSCA O USUÁRIO NA CHAVE CORRETA DO SEU SISTEMA
    const savedUser = localStorage.getItem('@Linkah:User');
    
    if (!savedUser) {
      // Se não tem a chave no localStorage, bloqueia na hora
      setErroAcesso(true);
      setCarregando(false);
      // Redireciona após 2 segundos
      setTimeout(() => router.push('/site/login'), 2000);
      return;
    }

    try {
      const user = JSON.parse(savedUser);
      if (user && user.nome) {
        setDadosUsuario(user);
        setCarregando(false);
      } else {
        throw new Error("Dados inválidos");
      }
    } catch (e) {
      setErroAcesso(true);
      setCarregando(false);
      setTimeout(() => router.push('/site/login'), 2000);
    }
  }, [router]);

  // Carregar mensagens (SÓ RODA SE TIVER USUÁRIO)
  useEffect(() => {
    if (!dadosUsuario || !id) return;

    const carregarMensagens = async () => {
      try {
        const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`);
        if (res.ok) setMensagens(await res.json());
      } catch (err) { console.error(err); }
    };

    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

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
        body: JSON.stringify({ 
          evento_id: Number(id), 
          usuario_nome: dadosUsuario.nome, 
          texto: txt 
        })
      });
    } catch (err) { setNovoTexto(txt); }
  };

  // TELA DE BLOQUEIO (MODO CLARO)
  if (erroAcesso) return (
    <div className="h-screen !bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 10h10a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7a2 2 0 012-2z"/></svg>
      </div>
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ops! Você está deslogado.</h2>
      <p className="text-slate-500 mt-2 font-medium">Identifique-se para entrar na comunidade.</p>
      <div className="mt-6 flex gap-2 items-center text-indigo-600 font-bold text-sm animate-pulse">
        <span>Redirecionando para o login</span>
        <span className="flex gap-1"><span className="w-1 h-1 bg-current rounded-full"></span><span className="w-1 h-1 bg-current rounded-full"></span><span className="w-1 h-1 bg-current rounded-full"></span></span>
      </div>
    </div>
  );

  if (carregando) return <div className="h-screen !bg-white flex items-center justify-center text-indigo-600 font-bold uppercase tracking-widest animate-pulse">Validando acesso...</div>;

  return (
    <div className="flex flex-col h-screen !bg-white !text-slate-900 font-sans overflow-hidden">
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between border-b border-slate-100 !bg-white z-10 shrink-0">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-center">
          <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d6006d]">Comunidade Linkah</h1>
          <div className="flex items-center gap-1.5 justify-center">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Chat Online</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#d6006d] flex items-center justify-center text-[12px] font-black text-white border-2 border-white shadow-md">
          {dadosUsuario?.nome?.substring(0,2).toUpperCase()}
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 !bg-[#f8fafc]">
        {mensagens.map((msg, idx) => {
          const souEu = dadosUsuario?.nome === msg.usuario_nome;
          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <div className={`px-2 py-0.5 rounded-md text-[9px] font-black text-white mb-1 shadow-sm ${souEu ? 'bg-indigo-400' : 'bg-slate-400'}`}>
                {msg.usuario_nome}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm border ${souEu ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' : '!bg-white border-slate-200 !text-slate-700 rounded-tl-none'}`}>
                <p className="text-[14px] leading-relaxed font-medium">{msg.texto}</p>
                <div className={`text-[9px] mt-1 font-bold ${souEu ? 'text-indigo-200' : 'text-slate-400'}`}>
                   {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* INPUT */}
      <footer className="p-4 !bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-4xl mx-auto !bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:!bg-white focus-within:border-[#d6006d] transition-all">
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 !text-slate-800" 
            placeholder={`Eai, ${dadosUsuario?.nome.split(' ')[0]}? Digite algo...`}
          />
          <button type="submit" disabled={!novoTexto.trim()} className="bg-[#d6006d] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
      </footer>
    </div>
  );
}