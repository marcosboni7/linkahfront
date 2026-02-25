'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, LogIn, ArrowRight, MessageCircle, Users, Loader2, Sparkles, Globe } from 'lucide-react';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

interface Evento {
  id: string;
  nome: string;
  imagem_capa?: string;
  descricao?: string;
}

export default function ListaComunidades() {
  const { t, language } = useLanguage();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [estaLogado, setEstaLogado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('@Linkah:Token');
    // Corrigido para verificar o padrão de salvamento que usamos no login
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
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error();
        
        const data = await res.json();
        setEventos(data);
      } catch (err) {
        setErro(t.errorLoadingCommunities);
      } finally {
        setLoading(false);
      }
    };

    fetchComunidades();
  }, [t.errorLoadingCommunities]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#FCFBFA]">
      <div className="relative mb-4">
        <Loader2 className="animate-spin text-[#ff4d4d]" size={40} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{t.sync || "Carregando Universos..."}</p>
    </div>
  );

  if (!estaLogado) return (
    <div className="min-h-screen flex flex-col bg-[#FCFBFA]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-14 shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <Lock className="text-[#ff4d4d]" size={32} />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-950 leading-tight mb-4 tracking-tight">
            {t.restrictedAccess || "Acesso Restrito"}
          </h1>
          
          <p className="text-slate-500 font-light mb-10 leading-relaxed">
            {t.restrictedSub || "Para explorar nossas comunidades e conectar-se, você precisa estar autenticado."}
          </p>

          <div className="space-y-4">
            <Link 
              href="/site/login"
              className="flex items-center justify-center gap-2 w-full bg-slate-950 text-white py-5 rounded-2xl font-bold text-sm tracking-tight hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <LogIn size={18} className="text-[#ff4d4d]" />
              {t.login || "Entrar na conta"}
            </Link>
            
            <Link 
              href="/site/register" 
              className="flex items-center justify-center gap-2 w-full bg-white text-slate-600 py-5 rounded-2xl font-bold text-sm tracking-tight border border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
            >
              {t.createFreeAccount || "Criar conta gratuita"}
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

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-20 pb-24 w-full">
        <div className="mb-20 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
             <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Rede Ativa</span>
             </div>
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <Globe size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Global</span>
             </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-slate-950 mb-6">
            Explore <span className="text-[#ff4d4d]">Comunidades</span>
          </h1>
          <p className="text-slate-500 max-w-xl leading-relaxed text-lg font-light">
            {t.exploreSub || "Conecte-se com pessoas que compartilham seus interesses nos eventos mais exclusivos do mundo."}
          </p>
        </div>

        {erro && (
          <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl text-center mb-12 border border-rose-100 font-bold text-xs uppercase tracking-widest">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <div key={evento.id} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-[#ff4d4d]/20 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={evento.imagem_capa || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
                    alt={evento.nome} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold text-slate-950 uppercase tracking-widest shadow-sm flex items-center gap-2">
                      <Users size={14} className="text-[#ff4d4d]" /> 
                      {t.activeChat || "Ativa agora"}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold mb-3 text-slate-950 tracking-tight group-hover:text-[#ff4d4d] transition-colors">
                    {evento.nome}
                  </h2>
                  <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-light leading-relaxed">
                    {evento.descricao || "Participe da conversa oficial e networking exclusivo deste evento."}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      href={`/evento/${evento.id}/comunidade`}
                      className="flex items-center justify-between w-full bg-slate-950 text-white p-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all group/btn shadow-lg shadow-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle size={18} className="text-[#ff4d4d]" />
                        {t.joinGroup || "Entrar no Chat"}
                      </div>
                      <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform text-[#ff4d4d]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : !erro && (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Sparkles className="mx-auto text-slate-100 mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{t.noCommunities || "Nenhuma comunidade disponível"}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}