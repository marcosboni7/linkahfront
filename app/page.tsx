'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from './site/Navbar';
import { Footer } from './site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Search,
  Ticket,
  Palette,
  Theater,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  Users,
  Zap,
  ChevronRight,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// 🔥 CONFIGURAÇÃO DINÂMICA
const EventCard = dynamic(() => import('./site/EventCard').then(mod => mod.EventCard), { 
  ssr: false,
  loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-3xl" /> 
});

// NOVO COMPONENTE ESTILO LUMA
const CategoryGrid = dynamic(() => import('./site/CategoryGrid').then(mod => mod.CategoryGrid), { 
  ssr: false 
});

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

const iconMap: { [key: string]: any } = {
  Todos: Ticket,
  'Arte & Cultura': Palette,
  'Entretenimento': Theater,
  'Negócios': Briefcase,
  'Educação & Desenvolvimento': GraduationCap,
  'Esportes & Bem-estar': Heart,
  'Experiências & Lifestyle': Sparkles,
  'Família & Comunidade': Users,
};

const CATEGORIAS_FIXAS = [
  'Todos',
  'Arte & Cultura',
  'Entretenimento',
  'Negócios',
  'Educação & Desenvolvimento',
  'Esportes & Bem-estar',
  'Experiências & Lifestyle',
  'Família & Comunidade'
];

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070', titleKey: 'slide1Title', highlightKey: 'slide1Highlight' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070', titleKey: 'slide2Title', highlightKey: 'slide2Highlight' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070', titleKey: 'slide3Title', highlightKey: 'slide3Highlight' },
];

export default function BuyTicketHome() {
  const languageData = useLanguage();
  const t = languageData?.t as Record<string, any> | undefined;

  const [isMounted, setIsMounted] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [filtroData, setFiltroData] = useState('todos'); 
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function carregarDados() {
      setLoading(true);
      try {
        const [resEventos, resComunidades] = await Promise.all([
          fetch(`${API_URL_BASE}/api/eventos/vitrine`, { cache: 'no-store' }),
          fetch(`${API_URL_BASE}/api/comunidades`, { cache: 'no-store' }),
        ]);
        if (resEventos.ok) setEventos(await resEventos.json());
        if (resComunidades.ok) {
          const dadosCom = await resComunidades.json();
          setComunidades(Array.isArray(dadosCom) ? dadosCom.slice(0, 3) : []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6500);
    return () => clearInterval(interval);
  }, [isMounted]);

  const vitrineFiltrada = useMemo(() => {
    if (!isMounted) return [];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    return (eventos || []).filter((ev) => {
      // 🔥 MANTIDA SUA LÓGICA DE CORREÇÃO DE FUSO
      const dataString = String(ev.data_inicio || ev.data || '').split('T')[0];
      const partes = dataString.split('-');
      
      let dataEv = new Date(0);
      if (partes.length === 3) {
        dataEv = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      }
      dataEv.setHours(0, 0, 0, 0);

      const nomeMatch = String(ev.nome || '').toLowerCase().includes(buscaNome.toLowerCase());
      const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
      
      let dataMatch = true;
      if (filtroData === 'hoje') dataMatch = dataEv.getTime() === hoje.getTime();
      if (filtroData === 'amanha') dataMatch = dataEv.getTime() === amanha.getTime();
      if (filtroData === 'fds') {
        const diaSemana = dataEv.getDay();
        dataMatch = diaSemana === 0 || diaSemana === 6;
      }

      return nomeMatch && catMatch && dataMatch;
    });
  }, [eventos, buscaNome, categoriaAtiva, filtroData, isMounted]);

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-[#ff4d4d]/20">
      <Navbar />

      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div 
              key={s.id} 
              className={`absolute inset-0 transition-all duration-[2000ms] ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            >
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none mb-10 uppercase">
            {String(t?.[slide.titleKey] || "DESCUBRA")} <br />
            <span className="text-[#ff4d4d] italic font-serif font-light">
              {String(t?.[slide.highlightKey] || "EXPERIÊNCIAS")}
            </span>
          </h1>

          <div className="mx-auto max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-1.5 flex border border-slate-100">
            <div className="flex-grow flex items-center gap-3 px-4">
              <Search size={20} className="text-slate-400" />
              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Buscar eventos..."
                className="w-full bg-transparent outline-none text-slate-700 font-medium text-base"
              />
            </div>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition-all">
              Buscar
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-32">
        
        {/* NAVEGAR POR CATEGORIA (Estilo Luma Cards) */}
        <section>
          <div className="flex flex-col mb-8">
            <h2 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Navegar por Categoria</h2>
            <div className="h-1 w-10 bg-violet-600 rounded-full mt-2" />
          </div>
          <CategoryGrid 
            categories={CATEGORIAS_FIXAS} 
            activeCategory={categoriaAtiva} 
            onSelect={setCategoriaAtiva} 
          />
        </section>

        {/* VITRINE DE EVENTOS */}
        <section id="vitrine-principal" className="scroll-mt-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Eventos</h2>
              <div className="h-1 w-12 bg-slate-900 rounded-full mt-2" />
            </div>

            {/* Filtros de Data (Atualizados para o novo visual) */}
            <div className="flex flex-wrap gap-2 p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
              {[
                { id: 'todos', label: 'Todos', icon: Ticket },
                { id: 'hoje', label: 'Hoje', icon: Zap },
                { id: 'amanha', label: 'Amanhã', icon: Calendar },
                { id: 'fds', label: 'FDS', icon: Sparkles },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFiltroData(item.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filtroData === item.id 
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-200' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {vitrineFiltrada.length > 0 ? (
              vitrineFiltrada.map((ev) => <EventCard key={`vitrine-${ev.id}`} evento={ev} />)
            ) : (
              <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Ticket size={32} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhum evento para esta seleção.</p>
              </div>
            )}
          </div>
        </section>

        {/* COMUNIDADES */}
        {!loading && comunidades.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-end justify-between border-b border-slate-100 pb-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Comunidades</h2>
              <Link href="/comunidades" className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-slate-900 transition-colors group">
                Explorar <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comunidades.map((com) => {
                const rawFoto = com.foto_url || com.imagem || com.capa;
                const fotoFinal = (rawFoto && typeof rawFoto === 'string') 
                  ? (rawFoto.startsWith('http') ? rawFoto : `${API_URL_BASE}/uploads/${rawFoto.replace(/^\/+/, '')}`) 
                  : 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070';
                
                return (
                  <Link key={com.id} href={`/comunidades/${com.id}`} className="group bg-white rounded-[2rem] border border-slate-100 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-500 flex flex-col overflow-hidden h-full">
                    <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                      <Image src={fotoFinal} alt={com.nome || "Comunidade"} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-8 flex-grow">
                      <div className="bg-slate-50 w-fit px-4 py-1.5 rounded-full text-[9px] font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-widest border border-slate-100">
                        <Users size={12} /> {com.membros_count || 0} Membros
                      </div>
                      <h3 className="text-xl font-black text-slate-950 mb-3 group-hover:text-violet-600 transition-colors uppercase tracking-tight leading-tight">{com.nome || "Sem Nome"}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium">{com.descricao || "Participe das discussões exclusivas."}</p>
                    </div>
                    <div className="px-8 pb-8">
                      <div className="w-full py-4 bg-slate-950 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-[10px] uppercase tracking-[0.2em] group-hover:bg-violet-600 transition-all duration-300 shadow-lg shadow-slate-200">
                        <MessageCircle size={16} strokeWidth={3} /> Entrar no Chat
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main> 
      <Footer />
    </div>
  );
}