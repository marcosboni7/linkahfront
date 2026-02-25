'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Send, Loader2, ShieldCheck, Clock } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

const gerarCorTag = (nome: string) => {
  const cores = ['bg-pink-500', 'bg-indigo-500', 'bg-violet-600', 'bg-fuchsia-500', 'bg-blue-500'];
  let hash = 0;
  const n = nome || "Visitante";
  for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
  return cores[Math.abs(hash) % cores.length];
};

export default function SalaComunidade() {
  const { t } = useLanguage();
  const { id } = useParams();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [naoAutorizado, setNaoAutorizado] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('@Linkah:Token');
    const nomeSalvo = localStorage.getItem('userName');
    const emailSalvo = localStorage.getItem('userEmail');
    
    if (token && emailSalvo) {
      setDadosUsuario({
        nome: nomeSalvo || "Membro",
        email: emailSalvo
      });
      setCarregando(false);
    } else {
      setNaoAutorizado(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2500);
    }
  }, [router]);

  const carregarMensagens = async () => {
    if (!id || naoAutorizado) return;
    try {
      const res = await fetch(`${API_URL}/api/comunidade/${id}?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('@Linkah:Token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMensagens(data);
      }
    } catch (err) { 
        console.error("AWS Error:", err); 
    }
  };

  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000);
    return () => clearInterval(interval);
  }, [id, naoAutorizado]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;
    
    const textoParaEnviar = novoTexto; 
    setNovoTexto('');

    try {
      await fetch(`${API_URL}/api/comunidade/enviar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('@Linkah:Token')}`
        },
        body: JSON.stringify({ 
            evento_id: Number(id), 
            usuario_nome: dadosUsuario.nome, 
            texto: textoParaEnviar 
        })
      });
      carregarMensagens();
    } catch (err) { 
        setNovoTexto(textoParaEnviar);
    }
  };

  if (naoAutorizado) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <ShieldCheck className="text-[#C22973]" size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 uppercase italic">{t.chatRestrictedTitle}</h2>
      <p className="text-slate-400 mt-2 font-medium">{t.chatRestrictedSub}</p>
      <div className="mt-6 flex items-center gap-2 text-[#C22973] font-bold text-xs uppercase tracking-[0.2em]">
        <Loader2 className="animate-spin" size={16} /> {t.chatRedirecting}
      </div>
    </div>
  );

  if (carregando) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-[#C22973] mb-4" size={32} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.chatEncrypting}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      
      <header className="p-4 flex items-center justify-between border-b border-slate-100 bg-white shadow-sm z-10 shrink-0">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        
        <div className="text-center">
          <h1 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#C22973] italic">Linkah Community</h1>
          <div className="flex items-center gap-1.5 justify-center">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t.chatCloudActive}</span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-[#C22973] flex items-center justify-center text-[12px] font-black text-white shadow-lg shadow-pink-100">
          {dadosUsuario?.nome?.substring(0,2).toUpperCase()}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {mensagens.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
            <Clock size={40} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-center">{t.chatNoMessages}<br/>{t.chatFirstSpeak}</p>
          </div>
        ) : (
          mensagens.map((msg, idx) => {
            const meuNome = (dadosUsuario?.nome || "").trim().toLowerCase();
            const nomeDestaMsg = (msg.usuario_nome || "").trim().toLowerCase();
            const souEu = meuNome === nomeDestaMsg && meuNome !== "";

            return (
              <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`px-2 py-0.5 rounded-md text-[9px] font-black text-white mb-1 shadow-sm ${
                  souEu ? 'bg-[#C22973]' : `${gerarCorTag(msg.usuario_nome)}`
                }`}>
                  {msg.usuario_nome}
                </div>

                <div className={`px-4 py-3 rounded-2xl max-w-[85%] shadow-sm border ${
                  souEu 
                    ? 'bg-[#C22973] border-pink-400 text-white rounded-tr-none' 
                    : 'bg-white border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                  <p className="text-[14px] leading-relaxed font-bold">{msg.texto}</p>
                  <div className={`text-[8px] mt-1.5 font-black uppercase ${souEu ? 'text-pink-200 text-right' : 'text-slate-300 text-left'}`}>
                    {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : t.chatTimeNow}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} className="h-4" />
      </main>

      <footer className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-4xl mx-auto bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 focus-within:bg-white focus-within:border-[#C22973] transition-all">
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-4 py-2 text-slate-800 font-bold" 
            placeholder={t.chatPlaceholder.replace('{name}', dadosUsuario?.nome.split(' ')[0] || '')}
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-[#C22973] hover:bg-[#a62262] disabled:opacity-20 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all"
          >
            <Send size={20} fill="currentColor" />
          </button>
        </form>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}