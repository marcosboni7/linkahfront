'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, LogIn, ArrowRight, MessageCircle, Loader2, Sparkles, Globe, ShieldCheck, Users } from 'lucide-react';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';

interface Evento {
  id: string;
  nome: string;
  imagem_capa?: string;
  descricao?: string;
  participantes_count?: number;
}

export default function ListaComunidades() {
  const { t } = useLanguage();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [estaLogado, setEstaLogado] = useState(false);

  useEffect(() => {
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
        setErro(t.errorLoadingCommunities || "Falha ao carregar comunidades.");
      } finally {
        setLoading(false);
      }
    };

    fetchComunidades();
  }, [t.errorLoadingCommunities]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <Loader2 className="animate-spin text-violet-600 mb-4" size={32} />
      <p className="text-sm font-medium text-slate-500 animate-pulse tracking-tight">
        {t.sync || "Carregando comunidades..."}
      </p>
    </div>
  );

  if (!estaLogado) return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto border border-violet-100">
            <Lock className="text-violet-600" size={32} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {t.restrictedAccess || "Acesso Restrito"}
            </h1>
            <p className="text-slate-500 text-base">
              {t.restrictedSub || "Entre na sua conta para explorar as comunidades."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              href="/auth/login"
              className="w-full bg-violet-600 text-white py-4 rounded-2xl font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
            >
              {t.login || "Entrar"}
            </Link>
            <Link 
              href="/auth/registro" 
              className="w-full bg-white text-slate-600 py-4 rounded-2xl font-semibold border border-slate-200 hover:bg-slate-50 transition-all"
            >
              {t.createFreeAccount || "Criar conta"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-20 pb-32 w-full">
        {/* Luma Style Header */}
        <div className="mb-16 space-y-6">
          <div className="flex items-center gap-2 text-violet-600 bg-violet-50 w-fit px-3 py-1 rounded-full border border-violet-100">
            <Sparkles size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Explore</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
              Comunidades
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              {t.exploreSub || "Encontre sua tribo e conecte-se com participantes dos melhores eventos."}
            </p>
          </div>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-10 text-sm font-medium border border-red-100">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <Link 
                key={evento.id} 
                href={`/evento/${evento.id}/comunidade`}
                className="group flex flex-col bg-white rounded-3xl border border-slate-100 hover:border-violet-200 hover:shadow-[0_20px_40px_rgba(124,58,237,0.06)] transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={evento.imagem_capa || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
                    alt={evento.nome} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Users size={12} className="text-violet-600" />
                    <span className="text-[11px] font-bold text-slate-700">Comunidade</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {evento.nome}
                    </h2>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {evento.descricao || "Participe das discussões e networking exclusivos deste evento."}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-sm font-bold text-violet-600 gap-1 group-hover:gap-2 transition-all">
                    Acessar Hub <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-400 font-medium italic">
                {t.noCommunities || "Nenhuma comunidade encontrada."}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}