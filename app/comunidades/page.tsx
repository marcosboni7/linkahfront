'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, LogIn, ArrowRight, MessageCircle, Users, Loader2, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'api-linkah.onrender.com';

interface Evento {
  id: string;
  nome: string;
  imagem_capa?: string;
  descricao?: string;
  participantes_count?: number;
}

export default function ListaComunidades() {
  const { t, language } = useLanguage();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [estaLogado, setEstaLogado] = useState(false);

  useEffect(() => {
    // Protocolo de verificação Linkah
    const token = localStorage.getItem('@Linkah:Token');
    const user = localStorage.getItem('@Linkah:User');

    if (!token || !user) {
      setEstaLogado(false);
      setLoading(false);
      return;
    }

    setEstaLogado(true);

    const fetchComunidades = async () => {
      try {
        const res = await fetch(`${API_URL}/api/eventos/vitrine`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error();
        
        const data = await res.json();
        setEventos(data);
      } catch (err) {
        setErro(t.errorLoadingCommunities || "Falha ao sincronizar com a rede.");
      } finally {
        setLoading(false);
      }
    };

    fetchComunidades();
  }, [t.errorLoadingCommunities]);

  // LOADING STATE (BRANDED)
  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#FCFBFA]">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#ff4d4d]/20 blur-xl rounded-full animate-pulse" />
        <Loader2 className="animate-spin text-[#ff4d4d] relative z-10" size={48} strokeWidth={3} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic animate-pulse">
        {t.sync || "Sincronizando Universos..."}
      </p>
    </div>
  );

  // RESTRICTED ACCESS STATE
  if (!estaLogado) return (
    <div className="min-h-screen flex flex-col bg-[#FCFBFA]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 mt-12">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-slate-100 relative group">
            <div className="absolute inset-0 bg-[#ff4d4d]/5 rounded-[2rem] scale-0 group-hover:scale-110 transition-transform duration-500" />
            <Lock className="text-[#ff4d4d] relative z-10" size={36} />
          </div>
          
          <h1 className="text-4xl font-black text-slate-950 leading-none mb-6 tracking-tighter italic uppercase">
            {t.restrictedAccess || "Acesso Restrito"}
          </h1>
          
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-12 leading-relaxed">
            {t.restrictedSub || "Autentique sua identidade para explorar comunidades exclusivas."}
          </p>

          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="flex items-center justify-center gap-3 w-full bg-slate-950 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              <LogIn size={18} className="text-[#ff4d4d]" />
              {t.login || "Entrar na conta"}
            </Link>
            
            <Link 
              href="/auth/registro" 
              className="flex items-center justify-center gap-2 w-full bg-white text-slate-400 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] border border-slate-100 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              {t.createFreeAccount || "Criar Identidade"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBFA] text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 pt-24 pb-32 w-full">
        {/* HEADER SECTION */}
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Network Live</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full">
                <Globe size={14} className="text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Global Hub</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 mb-8 italic uppercase leading-none">
              Explore <br/><span className="text-[#ff4d4d]">Comunidades.</span>
            </h1>
            <p className="text-slate-400 max-w-lg leading-relaxed text-lg font-medium uppercase tracking-tight">
              {t.exploreSub || "Conecte-se com pessoas que compartilham seus interesses nos eventos mais exclusivos."}
            </p>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex -space-x-3 mb-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-4 border-white bg-black flex items-center justify-center text-[10px] text-white font-black">+2k</div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Produtores Conectados</p>
            </div>
          </div>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center gap-4 mb-16 animate-shake">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] italic">{erro}</p>
          </div>
        )}

        {/* GRID DE COMUNIDADES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <div 
                key={evento.id} 
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-[#ff4d4d]/30 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 flex flex-col relative"
              >
                {/* IMAGE WRAPPER */}
                <div className="relative aspect-[4/3] overflow-hidden m-3 rounded-[2rem]">
                  <img 
                    src={evento.imagem_capa || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
                    alt={evento.nome} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#4ade80]" />
                      {t.activeChat || "Live Now"}
                    </span>
                  </div>
                </div>

                <div className="p-8 pt-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                     <ShieldCheck size={14} className="text-[#ff4d4d]" />
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Official Channel</span>
                  </div>
                  
                  <h2 className="text-2xl font-black mb-4 text-slate-950 tracking-tighter italic uppercase group-hover:text-[#ff4d4d] transition-colors leading-none">
                    {evento.nome}
                  </h2>
                  
                  <p className="text-slate-400 text-sm mb-10 line-clamp-2 font-medium leading-relaxed tracking-tight">
                    {evento.descricao || "Acesse o ecossistema exclusivo de conversas e networking para este evento."}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      href={`/evento/${evento.id}/comunidade`}
                      className="flex items-center justify-between w-full bg-slate-950 text-white p-6 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all group/btn shadow-xl shadow-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle size={20} className="text-[#ff4d4d]" />
                        {t.joinGroup || "Acessar Hub"}
                      </div>
                      <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform text-[#ff4d4d]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : !erro && (
            <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200">
                <div className="relative inline-block mb-8">
                    <Sparkles className="text-[#ff4d4d]/20 animate-pulse" size={64} />
                    <Sparkles className="absolute -top-4 -right-4 text-[#ff4d4d] animate-bounce" size={24} />
                </div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em] italic">
                    {t.noCommunities || "Nenhum universo disponível no momento"}
                </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}