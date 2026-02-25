'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, LogIn, ArrowRight, MessageCircle, Users, Loader2 } from 'lucide-react';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

// Interface simples para evitar erros de tipagem
interface Evento {
  id: string;
  nome: string;
  imagem_capa?: string;
  descricao?: string;
}

export default function ListaComunidades() {
  // Extraímos 'language' e 't' do contexto
  const { t, language } = useLanguage();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [estaLogado, setEstaLogado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('@Linkah:Token');
    const userEmail = localStorage.getItem('userEmail');

    if (!token || !userEmail) {
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
    <div className="flex flex-col justify-center items-center h-screen bg-[#FCFBFA] gap-4">
      <Loader2 className="animate-spin text-[#C22973]" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.sync}</p>
    </div>
  );

  if (!estaLogado) return (
    <div className="min-h-screen flex flex-col bg-[#FCFBFA]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Lock className="text-[#C22973]" size={32} />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4 tracking-tight italic uppercase">
            {t.restrictedAccess}
          </h1>
          
          <p className="text-slate-500 font-light mb-10 leading-relaxed text-lg">
            {t.restrictedSub}
          </p>

          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full bg-[#C22973] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#a62262] transition-all shadow-lg shadow-pink-100 active:scale-95"
            >
              <LogIn size={18} />
              {t.login}
            </Link>
            
            <Link 
              href="/auth/registro" 
              className="flex items-center justify-center gap-2 w-full bg-white text-slate-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
            >
              {t.createFreeAccount}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBFA] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-16 pb-24 w-full">
        <div className="mb-16 text-center md:text-left space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{t.cloudSyncActive}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic">
            {t.exploreRooms.split(' ')[0]} <span className="text-[#C22973]">{t.exploreRooms.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-slate-500 max-w-lg leading-relaxed text-lg font-light">
            {t.exploreSub}
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-center mb-12 border border-red-100 font-bold uppercase text-[10px] tracking-widest">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <div key={evento.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-pink-200/20 transition-all duration-500 flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={evento.imagem_capa || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
                    alt={evento.nome} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-slate-900 uppercase tracking-[0.15em] shadow-sm flex items-center gap-1.5">
                      <Users size={12} className="text-[#C22973]" /> {t.activeChat}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <h2 className="text-xl font-black mb-3 text-slate-900 line-clamp-1 group-hover:text-[#C22973] transition-colors uppercase italic">
                    {evento.nome}
                  </h2>
                  <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                    {evento.descricao || (language === 'PT' ? "Participe do chat oficial..." : "Join the official chat...")}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      href={`/evento/${evento.id}/comunidade`}
                      className="flex items-center justify-between w-full bg-slate-50 text-slate-900 p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all group/btn"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle size={18} className="text-[#C22973]" />
                        {t.joinGroup}
                      </div>
                      <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform opacity-50" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : !erro && (
            <div className="col-span-full py-20 text-center">
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{t.noCommunities}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}