'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  Ticket, LogOut, X, Calendar, 
  Loader2, MessagesSquare, ChevronRight,
  User, ChevronDown, Sparkles, MapPin
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export function Navbar() {
  const [usuario, setUsuario] = useState<{ nome: string; email?: string; role?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buscandoTickets, setBuscandoTickets] = useState(false);
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);
  
  const { language, setLanguage, t } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      try { setUsuario(JSON.parse(savedUser)); } catch (e) { console.error("Erro ao ler usuário"); }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@Linkah:Token');
    localStorage.removeItem('@Linkah:User');
    window.location.href = '/';
  };

  const carregarMeusIngressos = async () => {
    if (!usuario?.email) return;
    setIsModalOpen(true);
    setIsMenuOpen(false);
    setBuscandoTickets(true);
    try {
      const response = await fetch(`${API_URL}/api/pagamentos/meus-ingressos?email=${usuario.email}`);
      if (response.ok) {
        const dados = await response.json();
        setMeusIngressos(dados);
      }
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setBuscandoTickets(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex items-center gap-10">
            <Link href="/" className="relative group">
              <span className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-1">
                LINKAH<span className="w-2 h-2 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 group-hover:scale-125 transition-transform" />
              </span>
            </Link>

            {/* LINKS PRINCIPAIS */}
            <div className="hidden md:flex items-center gap-2">
              <Link 
                href="/comunidades" 
                className="group px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                    <MessagesSquare size={16} className="group-hover:text-indigo-600" />
                </div>
                {t.community}
              </Link>
            </div>
          </div>

          {/* ACTIONS DIREITA */}
          <div className="flex items-center gap-4">
            
            {/* IDIOMA - VISUAL CLEAN */}
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
              {['PT', 'EN'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as any)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    language === lang 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {usuario ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {usuario.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left leading-none">
                    <p className="text-xs font-bold text-slate-900 mb-0.5">{usuario.nome.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{t.member}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN LUXO */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg border border-slate-200 rounded-[24px] shadow-2xl shadow-slate-200/50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 mb-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{t.myAccount}</p>
                    </div>

                    <button 
                      onClick={carregarMeusIngressos}
                      className="w-full flex items-center gap-3 p-3 text-sm text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100/50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                        <Ticket size={18} />
                      </div>
                      {t.myTickets}
                    </button>

                    <Link href="/perfil" className="w-full flex items-center gap-3 p-3 text-sm text-slate-600 font-bold hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                        <User size={18} />
                      </div>
                      {t.myProfileTitle}
                    </Link>

                    <div className="mt-2 pt-2 border-t border-slate-100">
                        <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 text-sm text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-all"
                        >
                        <div className="w-10 h-10 flex items-center justify-center">
                            <LogOut size={18} />
                        </div>
                        {t.logout}
                        </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/site/login"
                className="relative overflow-hidden group bg-slate-900 text-white text-sm font-bold px-8 py-3 rounded-2xl hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-95"
              >
                <span className="relative z-10">{t.login}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL DE INGRESSOS REESTILIZADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-slate-50 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {/* Header Modal */}
            <div className="bg-white px-8 py-8 flex justify-between items-center border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  {t.myTickets} <Sparkles className="text-amber-400" size={20} />
                </h2>
                <p className="text-xs font-medium text-slate-400 mt-1">{usuario?.email}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-100 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {buscandoTickets ? (
                <div className="flex flex-col items-center py-16">
                  <div className="relative">
                    <Loader2 className="animate-spin text-slate-900" size={40} />
                    <div className="absolute inset-0 animate-ping rounded-full bg-slate-200 opacity-20" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-6">{t.sync}</p>
                </div>
              ) : meusIngressos.length > 0 ? (
                <div className="grid gap-4">
                  {meusIngressos.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      onClick={() => window.location.href = `/pagamento/sucesso?session_id=${ticket.stripe_session_id}`}
                      className="group bg-white rounded-[28px] p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer border border-transparent hover:border-slate-100 flex gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                         <span className="text-[10px] font-black uppercase opacity-60">Qtd</span>
                         <span className="text-xl font-black">{ticket.qtd}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-slate-900 text-lg group-hover:text-red-500 transition-colors">{ticket.evento}</h4>
                           <div className="px-2 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-lg uppercase tracking-wider border border-green-100">
                              {t.done}
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                              <Calendar size={13} className="text-slate-300" /> {ticket.data}
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                              <MapPin size={13} className="text-slate-300" /> Presencial
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <Ticket size={32} className="text-slate-300" />
                  </div>
                  <p className="text-base font-bold text-slate-400">{t.noTickets}</p>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white border-t border-slate-100">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                {t.done}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="h-20" />
    </>
  );
}