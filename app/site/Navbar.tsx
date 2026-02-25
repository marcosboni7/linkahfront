'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext'; // Garanta que o caminho está correto
import { 
  Ticket, LogOut, X, Calendar, 
  Loader2, MessagesSquare, ChevronRight 
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export function Navbar() {
  const [usuario, setUsuario] = useState<{ nome: string; email?: string; role?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buscandoTickets, setBuscandoTickets] = useState(false);
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);
  
  // 🟢 CONEXÃO COM O CONTEXTO GLOBAL (Isso faz o site todo traduzir)
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      try { 
        setUsuario(JSON.parse(savedUser)); 
      } catch (e) { 
        console.error("Erro ao ler usuário"); 
      }
    }

    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModalOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = () => {
    setIsModalOpen(false);
    localStorage.removeItem('@Linkah:Token');
    localStorage.removeItem('@Linkah:User');
    setUsuario(null);
    window.location.href = '/';
  };

  const carregarMeusIngressos = async () => {
    if (!usuario?.email) return;
    setIsModalOpen(true);
    setBuscandoTickets(true);
    try {
      const response = await fetch(`${API_URL}/api/pagamentos/meus-ingressos?email=${usuario.email}`);
      if (response.ok) {
        const dados = await response.json();
        setMeusIngressos(dados);
      }
    } catch (err) {
      console.error("Erro ao buscar ingressos:", err);
    } finally {
      setBuscandoTickets(false);
    }
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 md:px-10 py-3 flex items-center justify-between sticky top-0 z-[60]">

        {/* LOGO & LINKS ESQUERDA */}
        <div className="flex items-center gap-10">
          <Link href="/" className="text-slate-900 text-xl font-bold tracking-tight hover:opacity-70 transition-all flex items-center gap-1">
            LINKAH<span className="text-[#ff4d4d] text-2xl leading-none">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/comunidades" 
              className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <MessagesSquare size={16} className="text-slate-400 group-hover:text-[#ff4d4d] transition-colors" />
              {t.community}
            </Link>
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="flex items-center gap-4">
          
          {/* SELETOR DE IDIOMA GLOBAL */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setLanguage('PT')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 ${
                language === 'PT' 
                ? 'bg-white shadow-sm text-[#ff4d4d] scale-105' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              PT
            </button>
            <button 
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 ${
                language === 'EN' 
                ? 'bg-white shadow-sm text-[#ff4d4d] scale-105' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              EN
            </button>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          {usuario ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-500">
              <button
                onClick={carregarMeusIngressos}
                className="hidden sm:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-100"
              >
                <Ticket size={14} className="text-[#ff4d4d]" />
                {t.tickets}
              </button>

              <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[11px] font-bold text-slate-900 leading-none">{usuario.nome.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">{t.member}</span>
                </div>
                
                <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-[11px] text-white font-bold hover:ring-4 hover:ring-slate-100 transition-all">
                    {usuario.nome.charAt(0).toUpperCase()}
                  </button>
                  
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl">
                    <button 
                      onClick={handleLogout}
                      className="bg-white border border-slate-100 shadow-xl rounded-xl p-3 flex items-center gap-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors whitespace-nowrap"
                    >
                      <LogOut size={14} /> {t.logout}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/site/login"
              className="bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              {t.login}
            </Link>
          )}
        </div>
      </nav>

      {/* MODAL DE INGRESSOS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-[#FCFBFA] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.myTickets}</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">{usuario?.email}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors group">
                <X size={20} className="text-slate-400 group-hover:text-slate-900" />
              </button>
            </div>

            <div className="p-6 max-h-[450px] overflow-y-auto space-y-4">
              {buscandoTickets ? (
                <div className="flex flex-col items-center py-24 gap-4">
                  <Loader2 className="animate-spin text-slate-300" size={32} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.sync}</p>
                </div>
              ) : meusIngressos.length > 0 ? (
                meusIngressos.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    onClick={() => {
                      setIsModalOpen(false);
                      window.location.href = `/pagamento/sucesso?session_id=${ticket.stripe_session_id}`;
                    }}
                    className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:border-[#ff4d4d]/30 transition-all hover:translate-y-[-2px] cursor-pointer group/card"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 leading-tight group-hover/card:text-[#ff4d4d] transition-colors">{ticket.evento}</h4>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                          <Calendar size={12} className="text-slate-300" /> {ticket.data}
                        </div>
                      </div>
                      <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                        {ticket.status === 'completed' ? (language === 'PT' ? 'Aprovado' : 'Approved') : (ticket.status || 'Pendente')}
                      </span>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-[10px] font-mono text-slate-300 uppercase tracking-tighter">REF: {ticket.id.toString().padStart(6, '0')}</div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg group-hover/card:bg-slate-100 transition-colors">
                         {ticket.qtd} {ticket.qtd > 1 ? t.placesPlural : t.places}
                         <ChevronRight size={14} className="text-[#ff4d4d]" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket size={24} className="text-slate-200" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">{t.noTickets}</p>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                {t.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}